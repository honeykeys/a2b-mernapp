// backend/routes/authRoutes.js
const express = require('express');
const { check } = require('express-validator'); // For input validation
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

// Validation rules (optional but recommended)
const registerValidation = [
  check('username', 'Username must be at least 3 chars long').isLength({ min: 3 }),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 chars long').isLength({ min: 6 }),
];

const loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
];

// Define Routes
// POST /api/auth/register
router.post('/register', registerValidation, registerUser);

// POST /api/auth/login
router.post('/login', loginValidation, loginUser);

module.exports = router;