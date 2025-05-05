// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  // Optional: Input validation using express-validator (defined in routes)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, fplTeamId } = req.body;

  try {
    // Check if email or username already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    user = await User.findOne({ username });
    if (user) {
        return res.status(400).json({ message: 'Username is already taken' });
    }


    // Create new user instance (password gets hashed by pre-save hook in User model)
    user = new User({
      username,
      email,
      passwordHash: password, // Pass plain password, hook will hash it
      fplTeamId: fplTeamId || null // Handle optional field
    });

    // Save user to database
    await user.save();

    // Generate token and send response
    const token = generateToken(user._id);
    res.status(201).json({ // 201 Created
      _id: user._id,
      username: user.username,
      email: user.email,
      fplTeamId: user.fplTeamId,
      token: token,
    });

  } catch (error) {
    console.error('Registration Error:', error.message);
    // Pass error to global error handler (if you have one) or send generic error
    res.status(500).json({ message: 'Server error during registration' });
    // next(error); // Alternative using error handler middleware
  }
};

// @desc    Authenticate user & get token (login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  // Optional: Input validation using express-validator (defined in routes)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    // IMPORTANT: Need to explicitly select passwordHash as it's excluded by default in schema
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      console.log('DEBUG Login: User not found.'); // Log if not found
      return res.status(400).json({ message: 'Invalid credentials (email)' });
    }
    console.log('DEBUG Login: User found:', user.email); // Log if found

    // Check if password matches using method defined in User model
    console.log('DEBUG Login: Comparing password...');
    const isMatch = await user.matchPassword(password);
    console.log('DEBUG Login: Password match result =', isMatch);

    if (!isMatch) {
      console.log('DEBUG Login: Password did not match.');
      return res.status(400).json({ message: 'Invalid credentials (password)' });
    }

    // Passwords match, generate token and send response
    console.log('DEBUG Login: Password matched! Generating token...');
    const token = generateToken(user._id);
    res.status(200).json({ // 200 OK
      _id: user._id,
      username: user.username,
      email: user.email,
      fplTeamId: user.fplTeamId,
      token: token,
    });

  } catch (error) {
    console.error('Login Error:', error.message);
    console.error('Login Error:', error.message)
    res.status(500).json({ message: 'Server error during login' });
    // next(error);
  }
};

module.exports = { registerUser, loginUser };