const express = require('express');
const { check } = require('express-validator');
const { registerUser, loginUser } = require('../controllers/authController');
console.log('DEBUG Router: typeof registerUser =', typeof registerUser);

const router = express.Router();

const registerValidation = [
  check('username', 'Username must be at least 3 chars long').isLength({ min: 3 }),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 chars long').isLength({ min: 6 }),
];
console.log('DEBUG Router: typeof registerValidation =', typeof registerValidation);
console.log('DEBUG Router: Array.isArray(registerValidation) =', Array.isArray(registerValidation));

const loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
];

router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);

module.exports = router;