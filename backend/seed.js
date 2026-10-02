// Fills the database with sample rooms and an admin account.
// Run with: npm run seed   (WARNING: deletes existing rooms and users first)
require('dotenv').config({ quiet: true });
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Room = require('./models/Room');
const User = require('./models/User');
const Booking = require('./models/Booking');

const rooms = [
  {
    roomNumber: '101',
    type: 'Single',
    price: 50,
    capacity: 1,
    description: 'Cozy single room, perfect for solo travellers.',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    amenities: ['WiFi', 'AC', 'TV'],
  },
  {
    roomNumber: '102',
    type: 'Single',
    price: 55,
    capacity: 1,
    description: 'Single room with a city view.',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
    amenities: ['WiFi', 'AC', 'TV', 'Desk'],
  },
  {
    roomNumber: '201',
    type: 'Double',
    price: 90,
    capacity: 2,
    description: 'Spacious double room with a queen-size bed.',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
    amenities: ['WiFi', 'AC', 'TV', 'Mini Bar'],
  },
  {
    roomNumber: '202',
    type: 'Double',
    price: 100,
    capacity: 3,
    description: 'Double room with an extra bed and balcony.',
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
    amenities: ['WiFi', 'AC', 'TV', 'Balcony'],
  },
  {
    roomNumber: '301',
    type: 'Suite',
    price: 200,
    capacity: 4,
    description: 'Luxury suite with a living area and sea view.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Bathtub', 'Sea View'],
  },
];

const seed = async () => {
  await connectDB();

  // Clear old data
  await Booking.deleteMany();
  await Room.deleteMany();
  await User.deleteMany();

  // Insert rooms
  await Room.insertMany(rooms);

  // Create one admin and one guest account for testing
  const hashedPassword = await bcrypt.hash('123456', 10);
  await User.create([
    { name: 'Admin', email: 'admin@hotel.com', password: hashedPassword, role: 'admin' },
    { name: 'Test Guest', email: 'guest@hotel.com', password: hashedPassword, role: 'guest' },
  ]);

  console.log('Sample data inserted: 5 rooms, 1 admin, 1 guest');
  process.exit();
};

seed();
