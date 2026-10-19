const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { protect, adminOnly } = require('../middleware/auth');
const { startOfToday } = require('../utils/dates');

const router = express.Router();

const ONE_DAY = 1000 * 60 * 60 * 24;

// POST /api/bookings  - create a booking (logged-in user)
// Body: { roomId, checkIn: "2026-11-01", checkOut: "2026-11-03", guests: 2 }
router.post('/', protect, async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests } = req.body;

    // 1. Check the input
    if (!roomId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ message: 'Room, dates and guests are required' });
    }
    if (!mongoose.isValidObjectId(roomId)) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: 'Invalid dates' });
    }
    if (start < startOfToday()) {
      return res.status(400).json({ message: 'Check-in date cannot be in the past' });
    }
    if (end <= start) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    // 2. Check the room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    if (Number(guests) < 1 || Number(guests) > room.capacity) {
      return res.status(400).json({ message: `This room allows 1 to ${room.capacity} guest(s)` });
    }

    // 3. Make sure nobody else has booked this room for these dates (no double booking)
    const clash = await Booking.findOne({
      room: roomId,
      status: { $ne: 'cancelled' },
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    });
    if (clash) {
      return res.status(400).json({ message: 'Sorry, this room is already booked for these dates' });
    }

    // 4. Calculate the price on the server (never trust a price sent by the browser)
    const nights = Math.round((end - start) / ONE_DAY);
    const totalPrice = nights * room.price;

    const booking = await Booking.create({
      user: req.user._id,
      room: roomId,
      checkIn: start,
      checkOut: end,
      guests: Number(guests),
      totalPrice,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/bookings/my  - the logged-in user's bookings
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('room', 'roomNumber type image price') // replace the room id with room details
      .sort({ checkIn: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/bookings/:id/cancel  - cancel your own booking
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Users can only cancel their own bookings
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only cancel your own bookings' });
    }
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: `A ${booking.status.replace('_', ' ')} booking cannot be cancelled` });
    }
    if (booking.checkIn < startOfToday()) {
      return res.status(400).json({ message: 'Past bookings cannot be cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------- Admin routes (used by the admin pages in Week 5) ----------

// GET /api/bookings  - all bookings (admin). Optional filter: ?status=confirmed
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('room', 'roomNumber type')
      .sort({ checkIn: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/bookings/:id/status  - change status, e.g. check-in / check-out (admin)
// Body: { status: "checked_in" }
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    // Which status can change to which:
    // confirmed -> checked_in or cancelled,  checked_in -> checked_out
    const nextAllowed = {
      confirmed: ['checked_in', 'cancelled'],
      checked_in: ['checked_out'],
      checked_out: [],
      cancelled: [],
    };

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const newStatus = req.body.status;
    if (!nextAllowed[booking.status].includes(newStatus)) {
      return res.status(400).json({ message: `Cannot change status from ${booking.status} to ${newStatus}` });
    }
    // A guest cannot check in before the check-in date
    if (newStatus === 'checked_in' && booking.checkIn > startOfToday()) {
      return res.status(400).json({ message: 'Guest cannot check in before the check-in date' });
    }

    booking.status = newStatus;
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
