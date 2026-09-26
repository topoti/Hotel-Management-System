// Middleware to protect routes.
// The Vue app sends the token in the header: Authorization: Bearer <token>
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Allows the request only if the user is logged in
const protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws if invalid or expired

    // Find the user and attach it to the request (without the password)
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Allows the request only if the logged-in user is an admin.
// Always use it after protect, e.g. router.post('/', protect, adminOnly, handler)
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
};

module.exports = { protect, adminOnly };
