const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const bookingRoutes = require('./routes/bookings');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Booking service connected to MongoDB'))
  .catch(err => console.error(err));

app.use('/bookings', bookingRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Booking service running on port ${process.env.PORT}`);
});