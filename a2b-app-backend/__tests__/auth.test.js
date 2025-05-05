// backend/__tests__/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../server'); // Import the exported app from server.js

// --- Add this try...catch block ---
let User; // Define outside try
try {
  console.log("DEBUG Test: Attempting to require User model...");
  User = require('../models/User'); // Try requiring inside
  console.log('DEBUG Test: require successful.');
  console.log('DEBUG Test: typeof User =', typeof User);
  // Check if it looks like a Mongoose model (will have functions/statics)
  if (User && typeof User === 'function' && User.modelName === 'User') {
       console.log('DEBUG Test: User appears to be a valid Mongoose model.');
  } else {
       console.log('DEBUG Test: User does NOT appear to be a valid Mongoose model:', User);
  }
} catch (error) {
  console.error('DEBUG Test: ERROR requiring User model:', error);
  User = null; // Ensure User is null if require failed
}
// --- End try...catch block ---

// const User = require('../models/User');
// --- Add this Debug Line ---
console.log('DEBUG Test: typeof User =', typeof User, '| User keys =', User ? Object.keys(User) : 'null/undefined');
// --- End Debug Line ---
require('dotenv').config({ path: '../.env' }); // Ensure test env loads .env if needed
const bcrypt = require('bcryptjs'); // Need bcrypt for login test setup

if (!User) {
  throw new Error("User model failed to load - cannot run tests.");
}

// Use a test database connection string if available, otherwise fallback
// WARNING: Using dev DB requires careful cleanup!
const TEST_MONGO_URI = process.env.MONGO_URI_TEST || process.env.MONGO_URI;

// Connect to DB before tests run
beforeAll(async () => {
  await mongoose.connect(TEST_MONGO_URI);
});

// Disconnect after tests run
afterAll(async () => {
  await mongoose.connection.close();
  server.close(); // Close the server instance exported from server.js
});

// Clean up User collection before each test
beforeEach(async () => {
  await User.deleteMany({});
});

// --- Test Suite for User Registration ---
describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.username).toEqual('testuser');
    expect(res.body.email).toEqual('test@example.com');

    // Verify user exists in DB (optional but good)
    const user = await User.findOne({ email: 'test@example.com' });
    expect(user).not.toBeNull();
  });

  it('should fail if email already exists', async () => {
    // First, create a user
    const user = new User({ username: 'testuser1', email: 'test@example.com', passwordHash: 'password123' });
    // Need to manually save here as pre-save hook expects plain password if going via .save()
    // Or register normally first via API
     await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser1', email: 'test1@example.com', password: 'password123' });


    // Try to register again with same email
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser2',
        email: 'test1@example.com', // Same email
        password: 'password456',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toMatch(/User already exists/i);
  });

  it('should fail if password is too short', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: '123', // Too short
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toBeInstanceOf(Array);
    // Check for specific validator error message
    expect(res.body.errors[0].msg).toMatch(/Password must be at least 6 chars long/i);
  });

  // Add tests for duplicate username, missing fields etc.
});


// --- Test Suite for User Login ---
describe('POST /api/auth/login', () => {
  // Setup a user before login tests
  beforeEach(async () => {
    await User.deleteMany({}); // Clean first
    // Create user by passing PLAIN TEXT password to passwordHash field.
    // The pre('save') hook in models/User.js will automatically hash it.
    await User.create({
        username: 'loginuser',
        email: 'login@example.com',
        passwordHash: 'password123' // <-- Provide PLAIN password here
    });
    console.log('DEBUG Login Test: User created for login test using pre-save hook.'); // Optional log
 });

  it('should login existing user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123', // Correct plain text password
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toEqual('login@example.com');
  });

  it('should fail login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'wrongpassword', // Incorrect password
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toMatch(/Invalid credentials/i);
    expect(res.body).not.toHaveProperty('token');
  });

  it('should fail login with non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'noexist@example.com', // Email doesn't exist
        password: 'password123',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toMatch(/Invalid credentials/i);
  });
});
