const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, required: true },
  bookingId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  baseFare:    { type: Number, required: true },
  cabType:     { type: String, required: true },
  passengers:  { type: Number, required: true },
  dateTime:    { type: Date, required: true },
  discount:    { type: Boolean, default: false },
  totalPrice:  { type: Number, required: true },
  breakdown:   { type: Object },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);