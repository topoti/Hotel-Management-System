const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: ['Single', 'Double', 'Suite'], required: true },
    price: { type: Number, required: true }, // price per night
    capacity: { type: Number, required: true }, // max number of guests
    description: { type: String },
    image: { type: String }, // image URL
    amenities: [{ type: String }], // e.g. ['WiFi', 'AC', 'TV']
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
