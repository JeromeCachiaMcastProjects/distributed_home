const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/auth');

// GET /fare/estimate — get fare estimate from external API
router.get('/estimate', authMiddleware, async (req, res) => {
  try {
    const { pickup, dropoff } = req.query;

    if (!pickup || !dropoff) {
      return res.status(400).json({ error: 'pickup and dropoff query params are required' });
    }

    const response = await axios.get(
      'https://taxi-fare-calculator.p.rapidapi.com/calculate',
      {
        params: { from: pickup, to: dropoff },
        headers: {
          'x-rapidapi-key': process.env.FARE_API_KEY,
          'x-rapidapi-host': 'taxi-fare-calculator.p.rapidapi.com'
        }
      }
    );

    res.json({
      pickup,
      dropoff,
      estimatedFare: response.data
    });
  } catch (err) {
    // If external API fails, return a calculated fallback
    if (err.response?.status === 403 || err.response?.status === 429) {
      return res.status(502).json({ error: 'Fare API limit reached. Please try again later.' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;