const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/auth');

// Convert place name to lat/lng using free Nominatim API
async function geocode(place) {
  const res = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: { q: place, format: 'json', limit: 1 },
    headers: { 'User-Agent': 'CabBookApp/1.0' }
  });
  if (!res.data || res.data.length === 0) throw new Error(`Could not geocode: ${place}`);
  return { lat: parseFloat(res.data[0].lat), lng: parseFloat(res.data[0].lon) };
}

// GET /fare/estimate
router.get('/estimate', authMiddleware, async (req, res) => {
  try {
    const { pickup, dropoff } = req.query;
    if (!pickup || !dropoff) {
      return res.status(400).json({ error: 'pickup and dropoff query params are required' });
    }

    // Geocode both locations
    const [from, to] = await Promise.all([geocode(pickup), geocode(dropoff)]);

    // Call the correct RapidAPI endpoint
    // Call the correct RapidAPI endpoint
    const response = await axios.get(
      'https://taxi-fare-calculator.p.rapidapi.com/search-geo',
      {
        params: {
          dep_lat: from.lat,
          dep_lng: from.lng,
          arr_lat: to.lat,
          arr_lng: to.lng
        },
        headers: {
          'x-rapidapi-key': process.env.FARE_API_KEY,
          'x-rapidapi-host': 'taxi-fare-calculator.p.rapidapi.com'
        },
        timeout: 8000
      }
    );

    const journey = response.data.journey;
    const dayFare = journey.fares.find(f => f.name === 'by Day');
    const fare = dayFare?.price_in_cents !== 'n/a'
      ? parseFloat((dayFare.price_in_cents / 100).toFixed(2))
      : 20;

    res.json({
      pickup,
      dropoff,
      estimatedFare: {
        fare,
        distance_km: journey.distance,
        duration_min: journey.duration,
        currency: 'EUR'
      },
      source: 'api'
    });

  } catch (err) {
    console.error('Fare API error:', err.message);
    // Fallback estimate
    res.json({
      pickup: req.query.pickup,
      dropoff: req.query.dropoff,
      estimatedFare: { fare: 20, currency: 'EUR' },
      source: 'fallback'
    });
  }
});

module.exports = router;