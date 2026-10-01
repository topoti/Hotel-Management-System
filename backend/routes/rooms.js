const express = require('express');
const mongoose = require('mongoose');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Returns the ids of rooms that already have a booking overlapping the given dates.
// Two date ranges overlap when: existing.checkIn < newCheckOut AND existing.checkOut > newCheckIn
const getBookedRoomIds = async (checkIn, checkOut) => {
  return Booking.distinct('room', {
    status: { $ne: 'cancelled' },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  });
};

// GET /api/rooms  - list rooms (public)
// Optional filters: ?checkIn=2026-11-01&checkOut=2026-11-03&guests=2&type=Double
router.get('/', async (req, res) => {
  try {
    const { checkIn, checkOut, guests, type } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (guests) filter.capacity = { $gte: Number(guests) };

    // If dates are given, hide rooms that are already booked for those dates
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);

      if (isNaN(start) || isNaN(end) || end <= start) {
        return res.status(400).json({ message: 'Check-out date must be after check-in date' });
      }

      const bookedRoomIds = await getBookedRoomIds(start, end);
      filter._id = { $nin: bookedRoomIds };
    }

    const rooms = await Room.find(filter).sort({ price: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/rooms/:id  - one room's details (public)
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Room not found' });
    }
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/rooms  - add a room (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Room number already exists' });
    }
    res.status(400).json({ message: error.message }); // e.g. missing required fields
  }
});

// PUT /api/rooms/:id  - update a room (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return the updated room
      runValidators: true, // check the schema rules again
    });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Room number already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/rooms/:id  - delete a room (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    // Don't delete a room that still has active bookings
    const activeBooking = await Booking.findOne({
      room: req.params.id,
      status: { $in: ['confirmed', 'checked_in'] },
    });
    if (activeBooking) {
      return res.status(400).json({ message: 'This room has active bookings and cannot be deleted' });
    }

    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
