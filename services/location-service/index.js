const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const locationRoutes = require('./routes/locations');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Location service connected to MongoDB'))
  .catch(err => console.error(err));

app.use('/locations', locationRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Location service running on port ${process.env.PORT}`);
});