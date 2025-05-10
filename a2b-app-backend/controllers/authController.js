const User = require('../models/User'); // Ensure this path is correct
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Import bcrypt here
const { validationResult } = require('express-validator');

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRES_IN || '30d', // Use env var or default
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, fplTeamId } = req.body;

  try {
    // Check if email or username already exists
    let userByEmail = await User.findOne({ email });
    if (userByEmail) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    let userByUsername = await User.findOne({ username });
    if (userByUsername) {
        return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hashing logic is now in the controller
    if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user instance with the hashed password
    const newUser = new User({
      username,
      email,
      passwordHash: hashedPassword, // Store the hashed password
      fplTeamId: fplTeamId || null
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Generate token
    const token = generateToken(savedUser._id);

    // Check if the registered user is "A"
    const isSpecialUserA = savedUser.email === process.env.SPECIAL_USER_A_EMAIL;
    if (process.env.SPECIAL_USER_A_EMAIL) { // Log if the special email is configured
        console.log(`DEBUG: Special User A Email configured: ${process.env.SPECIAL_USER_A_EMAIL}`);
        console.log(`DEBUG: Registered user email: ${savedUser.email}, Is Special: ${isSpecialUserA}`);
    } else {
        console.warn('DEBUG: SPECIAL_USER_A_EMAIL environment variable is not set.');
    }


    // Send response
    res.status(201).json({ // 201 Created
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      fplTeamId: savedUser.fplTeamId,
      token: token,
      isSpecialUserA: isSpecialUserA, // Add the flag here
    });

  } catch (error) {
    console.error('Registration Error:', error.message, error.stack);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token (login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists and select the passwordHash
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Passwords match, generate token
    const token = generateToken(user._id);

    // Check if the logged-in user is "A"
    const isSpecialUserA = user.email === process.env.SPECIAL_USER_A_EMAIL;
    if (process.env.SPECIAL_USER_A_EMAIL) { // Log if the special email is configured
        console.log(`DEBUG: Special User A Email configured: ${process.env.SPECIAL_USER_A_EMAIL}`);
        console.log(`DEBUG: Logged in user email: ${user.email}, Is Special: ${isSpecialUserA}`);
    } else {
        console.warn('DEBUG: SPECIAL_USER_A_EMAIL environment variable is not set.');
    }

    // Send response
    res.status(200).json({ // 200 OK
      _id: user._id,
      username: user.username,
      email: user.email,
      fplTeamId: user.fplTeamId,
      token: token,
      isSpecialUserA: isSpecialUserA, // Add the flag here
    });

  } catch (error) {
    console.error('Login Error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = { registerUser, loginUser };