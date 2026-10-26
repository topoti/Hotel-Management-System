const express = require('express');
const cors = require('cors');
require('dotenv').config({ quiet: true });

const connectDB = require('./config/db');

// Stop early if the .env file is missing important settings
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error('MONGO_URI and JWT_SECRET must be set in the .env file');
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors()); // allow the Vue app (different port) to call this API
app.use(express.json()); // read JSON from request bodies

// Test route - open http://localhost:5000 in the browser to check the server
app.get('/', (req, res) => {
  res.json({ message: 'Hotel Booking API is running' });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/stats', require('./routes/stats'));

// Unknown URL -> 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Any error we did not catch (e.g. broken JSON in the request body) -> clean JSON error
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Server error' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
