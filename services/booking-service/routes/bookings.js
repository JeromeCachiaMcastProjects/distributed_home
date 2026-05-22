const express = require('express');
const router = express.Router();
const axios = require('axios');
const Booking = require('../models/Booking');
const authMiddleware = require('../middleware/auth');

// POST /bookings — create a new booking
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { startLocation, endLocation, dateTime, passengers, cabType, fare } = req.body;

    if (passengers > 8) {
      return res.status(400).json({ error: 'Maximum 8 passengers allowed' });
    }

    const booking = await Booking.create({
      userId: req.user.userId,
      startLocation,
      endLocation,
      dateTime,
      passengers,
      cabType,
      fare,
      status: 'upcoming'
    });

    // Trigger events asynchronously (don't await — fire and forget)
    triggerCabReadyEvent(booking, req.user.userId);
    triggerDiscountCheck(req.user.userId);

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /bookings/current — upcoming bookings for logged-in user
router.get('/current', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.user.userId,
      status: 'upcoming'
    }).sort({ dateTime: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /bookings/past — completed bookings for logged-in user
router.get('/past', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.user.userId,
      status: 'completed'
    }).sort({ dateTime: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /bookings — all bookings for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /bookings/:id/complete — mark a booking as completed
router.patch('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Event: notify user cab is ready 3 minutes after booking ---
async function triggerCabReadyEvent(booking, userId) {
  setTimeout(async () => {
    try {
      await axios.post(`${process.env.CUSTOMER_SERVICE_URL}/notifications`, {
        userId,
        message: `Your cab is ready! Pickup: ${booking.startLocation} → ${booking.endLocation}. Cab type: ${booking.cabType}.`,
        type: 'cab_ready'
      });
      console.log(`Cab ready notification sent to user ${userId}`);
    } catch (err) {
      console.error('Failed to send cab ready notification:', err.message);
    }
  }, 3 * 60 * 1000); // 3 minutes
}

// --- Event: check if user qualifies for a discount after 3 bookings ---
async function triggerDiscountCheck(userId) {
  try {
    const completedCount = await Booking.countDocuments({
      userId,
      status: { $in: ['upcoming', 'completed'] }
    });

    if (completedCount === 3) {
      // Check if discount notification already sent
      const existing = await axios.get(
        `${process.env.CUSTOMER_SERVICE_URL}/notifications/check-discount/${userId}`
      );

      if (!existing.data.exists) {
        await axios.post(`${process.env.CUSTOMER_SERVICE_URL}/notifications`, {
          userId,
          message: '🎉 Congratulations! You have unlocked a 10% discount on your next booking!',
          type: 'discount'
        });
        console.log(`Discount notification sent to user ${userId}`);
      }
    }
  } catch (err) {
    console.error('Failed to check discount:', err.message);
  }
}

module.exports = router;