const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, required: true },
  startLocation: { type: String, required: true },
  endLocation:   { type: String, required: true },
  dateTime:      { type: Date, required: true },
  passengers:    { type: Number, required: true, min: 1, max: 8 },
  cabType:       { type: String, enum: ['Economic', 'Premium', 'Executive'], required: true },
  status:        { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
  fare:          { type: Number },
  createdAt:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);