const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, required: true },
  name:    { type: String, required: true },
  address: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', locationSchema);