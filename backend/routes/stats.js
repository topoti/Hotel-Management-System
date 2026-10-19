const express = require('express');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { startOfToday, addDays } = require('../utils/dates');

const router = express.Router();

// GET /api/stats  - numbers for the admin dashboard (admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const today = startOfToday();
    const tomorrow = addDays(today, 1);
    const notCancelled = { status: { $ne: 'cancelled' } };

    // Run all the queries at the same time
    const [totalRooms, totalGuests, totalBookings, occupiedRooms, arrivals, departures, revenue, recentBookings] =
      await Promise.all([
        Room.countDocuments(),
        User.countDocuments({ role: 'guest' }),
        Booking.countDocuments(notCancelled),
        Booking.countDocuments({ status: 'checked_in' }),

        // Guests arriving today who have not checked in yet
        Booking.find({ status: 'confirmed', checkIn: { $gte: today, $lt: tomorrow } })
          .populate('user', 'name phone')
          .populate('room', 'roomNumber type'),

        // Guests leaving today who are still checked in
        Booking.find({ status: 'checked_in', checkOut: { $gte: today, $lt: tomorrow } })
          .populate('user', 'name phone')
          .populate('room', 'roomNumber type'),

        // Total money from all bookings that are not cancelled
        Booking.aggregate([{ $match: notCancelled }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),

        // Latest 5 bookings
        Booking.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name').populate('room', 'roomNumber type'),
      ]);

    res.json({
      totalRooms,
      totalGuests,
      totalBookings,
      occupiedRooms,
      revenue: revenue[0]?.total || 0,
      arrivals,
      departures,
      recentBookings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
