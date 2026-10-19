const express = require('express');
const cors = require('cors');
require('dotenv').config({ quiet: true });

const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors()); // allow the Vue app (different port) to call this API
app.use(express.json()); // read JSON from request bodies

// Test route - open http://localhost:5000 in the browser to check the server
app.get('/', (req, res) => {
  res.json({ message: 'Hotel Booking API is running' });
});

// Routes will be added here in the next weeks:
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/stats', require('./routes/stats'));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
