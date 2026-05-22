const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const {
  CUSTOMER_SERVICE_URL,
  BOOKING_SERVICE_URL,
  PAYMENT_SERVICE_URL,
  LOCATION_SERVICE_URL,
  FARE_SERVICE_URL
} = process.env;

// Helper — forward request to a microservice and return its response
async function forward(req, res, targetUrl) {
  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      params: req.query,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && {
          Authorization: req.headers.authorization
        })
      }
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data || { error: err.message };
    res.status(status).json(message);
  }
}

// ─── Customer Service Routes ───────────────────────────────────────
app.post('/api/auth/register', (req, res) =>
  forward(req, res, `${CUSTOMER_SERVICE_URL}/auth/register`));

app.post('/api/auth/login', (req, res) =>
  forward(req, res, `${CUSTOMER_SERVICE_URL}/auth/login`));

app.get('/api/users/profile', (req, res) =>
  forward(req, res, `${CUSTOMER_SERVICE_URL}/users/profile`));

app.get('/api/notifications', (req, res) =>
  forward(req, res, `${CUSTOMER_SERVICE_URL}/notifications`));

app.patch('/api/notifications/:id/read', (req, res) =>
  forward(req, res, `${CUSTOMER_SERVICE_URL}/notifications/${req.params.id}/read`));

// ─── Booking Service Routes ────────────────────────────────────────
app.post('/api/bookings', (req, res) =>
  forward(req, res, `${BOOKING_SERVICE_URL}/bookings`));

app.get('/api/bookings', (req, res) =>
  forward(req, res, `${BOOKING_SERVICE_URL}/bookings`));

app.get('/api/bookings/current', (req, res) =>
  forward(req, res, `${BOOKING_SERVICE_URL}/bookings/current`));

app.get('/api/bookings/past', (req, res) =>
  forward(req, res, `${BOOKING_SERVICE_URL}/bookings/past`));

app.patch('/api/bookings/:id/complete', (req, res) =>
  forward(req, res, `${BOOKING_SERVICE_URL}/bookings/${req.params.id}/complete`));

// ─── Payment Service Routes ────────────────────────────────────────
app.post('/api/payments', (req, res) =>
  forward(req, res, `${PAYMENT_SERVICE_URL}/payments`));

app.get('/api/payments', (req, res) =>
  forward(req, res, `${PAYMENT_SERVICE_URL}/payments`));

app.post('/api/payments/calculate', (req, res) =>
  forward(req, res, `${PAYMENT_SERVICE_URL}/payments/calculate`));

app.get('/api/payments/:id', (req, res) =>
  forward(req, res, `${PAYMENT_SERVICE_URL}/payments/${req.params.id}`));

// ─── Location Service Routes ───────────────────────────────────────
app.get('/api/locations', (req, res) =>
  forward(req, res, `${LOCATION_SERVICE_URL}/locations`));

app.post('/api/locations', (req, res) =>
  forward(req, res, `${LOCATION_SERVICE_URL}/locations`));

app.put('/api/locations/:id', (req, res) =>
  forward(req, res, `${LOCATION_SERVICE_URL}/locations/${req.params.id}`));

app.delete('/api/locations/:id', (req, res) =>
  forward(req, res, `${LOCATION_SERVICE_URL}/locations/${req.params.id}`));

app.get('/api/locations/:id/weather', (req, res) =>
  forward(req, res, `${LOCATION_SERVICE_URL}/locations/${req.params.id}/weather`));

// ─── Fare Service Routes ───────────────────────────────────────────
app.get('/api/fare/estimate', (req, res) =>
  forward(req, res, `${FARE_SERVICE_URL}/fare/estimate`));

// ─── Health check ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    gateway: 'running',
    services: {
      customer: CUSTOMER_SERVICE_URL,
      booking:  BOOKING_SERVICE_URL,
      payment:  PAYMENT_SERVICE_URL,
      location: LOCATION_SERVICE_URL,
      fare:     FARE_SERVICE_URL
    }
  });
});

app.listen(process.env.PORT, () => {
  console.log(`API Gateway running on port ${process.env.PORT}`);
});