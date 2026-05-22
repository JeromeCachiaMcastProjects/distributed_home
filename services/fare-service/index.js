const express = require('express');
const cors = require('cors');
require('dotenv').config();

const fareRoutes = require('./routes/fare');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/fare', fareRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Fare service running on port ${process.env.PORT}`);
});