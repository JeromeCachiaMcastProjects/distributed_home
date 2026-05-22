const express = require('express');
const router = express.Router();
const axios = require('axios');
const Location = require('../models/Location');
const authMiddleware = require('../middleware/auth');

// GET /locations — get all favourite locations for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const locations = await Location.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /locations — add a new favourite location
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, address } = req.body;
    const location = await Location.create({
      userId: req.user.userId,
      name,
      address
    });
    res.status(201).json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /locations/:id — update a favourite location
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, address } = req.body;
    const location = await Location.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { name, address },
      { new: true }
    );
    if (!location) return res.status(404).json({ error: 'Location not found' });
    res.json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /locations/:id — remove a favourite location
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const location = await Location.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    if (!location) return res.status(404).json({ error: 'Location not found' });
    res.json({ message: 'Location removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /locations/:id/weather — get weather for a saved location
router.get('/:id/weather', authMiddleware, async (req, res) => {
  try {
    const location = await Location.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    if (!location) return res.status(404).json({ error: 'Location not found' });

    const response = await axios.get('https://weatherapi-com.p.rapidapi.com/forecast.json', {
      params: { q: location.address, days: 1 },
      headers: {
        'x-rapidapi-key': process.env.WEATHER_API_KEY,
        'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com'
      }
    });

    res.json({
      location: location.name,
      address: location.address,
      weather: {
        temp_c:    response.data.current.temp_c,
        condition: response.data.current.condition.text,
        icon:      response.data.current.condition.icon,
        humidity:  response.data.current.humidity,
        wind_kph:  response.data.current.wind_kph,
        feelslike_c: response.data.current.feelslike_c
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;