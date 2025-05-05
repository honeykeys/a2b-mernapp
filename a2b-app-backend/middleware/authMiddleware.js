// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming path is correct from middleware dir

const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (Bearer TOKEN -> TOKEN)
      token = req.headers.authorization.split(' ')[1];

      // Verify token using the secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user ID from the decoded token payload (we stored it as 'id')
      // Fetch user from DB, excluding the password hash
      req.user = await User.findById(decoded.id).select('-passwordHash');

      if (!req.user) {
          // User belonging to token not found (maybe deleted?)
          return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Token is valid, user found, proceed to the next middleware/route handler
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      // Handle specific JWT errors (like TokenExpiredError) if needed
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token found in header at all
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };