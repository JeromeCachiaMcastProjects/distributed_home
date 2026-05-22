const express = require('express');
const router = express.Router();
const axios = require('axios');
const Payment = require('../models/Payment');
const authMiddleware = require('../middleware/auth');
const { calculatePrice } = require('../utils/priceCalculator');

// POST /payments — process a payment for a booking
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { bookingId, baseFare, cabType, passengers, dateTime, useDiscount } = req.body;

    // Check if user has a discount available
    let hasDiscount = false;
    if (useDiscount) {
      const notifResponse = await axios.get(
        `${process.env.CUSTOMER_SERVICE_URL}/notifications/check-discount/${req.user.userId}`
      );
      hasDiscount = notifResponse.data.exists;
    }

    // Calculate total price using the assignment formula
    const breakdown = calculatePrice(baseFare, cabType, dateTime, passengers, hasDiscount);

    // Save payment record
    const payment = await Payment.create({
      userId:     req.user.userId,
      bookingId,
      baseFare,
      cabType,
      passengers,
      dateTime,
      discount:   hasDiscount,
      totalPrice: breakdown.totalPrice,
      breakdown
    });

    // Mark booking as completed
    await axios.patch(
      `${process.env.BOOKING_SERVICE_URL}/bookings/${bookingId}/complete`,
      {},
      { headers: { Authorization: req.headers.authorization } }
    );

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /payments — all payments for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /payments/:id — single payment details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /payments/calculate — preview price without paying
router.post('/calculate', authMiddleware, async (req, res) => {
  try {
    const { baseFare, cabType, passengers, dateTime, useDiscount } = req.body;

    let hasDiscount = false;
    if (useDiscount) {
      const notifResponse = await axios.get(
        `${process.env.CUSTOMER_SERVICE_URL}/notifications/check-discount/${req.user.userId}`
      );
      hasDiscount = notifResponse.data.exists;
    }

    const breakdown = calculatePrice(baseFare, cabType, dateTime, passengers, hasDiscount);
    res.json(breakdown);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;