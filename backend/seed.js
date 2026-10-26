// Fills the database with sample rooms, users and bookings.
// Run with: npm run seed   (WARNING: deletes ALL existing data first)
require('dotenv').config({ quiet: true });
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Room = require('./models/Room');
const User = require('./models/User');
const Booking = require('./models/Booking');
const { startOfToday, addDays } = require('./utils/dates');

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
  const savedRooms = await Room.insertMany(rooms);
  const room = (number) => savedRooms.find((r) => r.roomNumber === number);

  // Create accounts for testing (all passwords: 123456)
  const hashedPassword = await bcrypt.hash('123456', 10);
  const [, guest, rahim, nusrat] = await User.create([
    { name: 'Admin', email: 'admin@hotel.com', password: hashedPassword, role: 'admin' },
    { name: 'Test Guest', email: 'guest@hotel.com', password: hashedPassword, phone: '01711111111' },
    { name: 'Rahim Uddin', email: 'rahim@example.com', password: hashedPassword, phone: '01822222222' },
    { name: 'Nusrat Jahan', email: 'nusrat@example.com', password: hashedPassword, phone: '01933333333' },
  ]);

  // Sample bookings around today's date, so the admin dashboard has something to show
  const today = startOfToday();
  const booking = (user, roomNumber, startOffset, nights, guests, status) => ({
    user: user._id,
    room: room(roomNumber)._id,
    checkIn: addDays(today, startOffset),
    checkOut: addDays(today, startOffset + nights),
    guests,
    totalPrice: room(roomNumber).price * nights,
    status,
  });

  await Booking.insertMany([
    booking(rahim, '201', -10, 3, 2, 'checked_out'), // stayed last week
    booking(nusrat, '301', -2, 4, 3, 'checked_in'), // staying now
    booking(rahim, '202', -3, 3, 2, 'checked_in'), // staying now, leaves today
    booking(guest, '101', 0, 2, 1, 'confirmed'), // arrives today
    booking(nusrat, '102', 0, 1, 1, 'confirmed'), // arrives today
    booking(guest, '201', 7, 3, 2, 'confirmed'), // next week
    booking(rahim, '301', 14, 2, 4, 'cancelled'), // cancelled
  ]);

  console.log('Sample data inserted: 5 rooms, 4 users (1 admin), 7 bookings');
  process.exit();
};

seed();
