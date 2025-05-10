// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // Ensure this path is correct
const authRoutes = require('./routes/authRoutes'); // Ensure this path is correct
const predictionRoutes = require('./routes/predictionRoutes'); // Ensure this path is correct
const fplRoutes = require('./routes/fplRoutes'); // Ensure this path is correct for your new FPL routes

// Load .env variables at the very beginning
dotenv.config();

// Initialize Express app
const app = express();

// Database Connection
connectDB();

// CORS Configuration
// It's good practice to configure CORS before other middleware/routes if possible.
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', // Fallback for local dev if not set
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Middleware to parse JSON request bodies
app.use(express.json());

// API Routes
// Mount each router only once
app.use('/api/auth', authRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/fpl', fplRoutes); // Added your new FPL routes

// Simple GET route for the root path (e.g., to check if API is running)
app.get('/', (req, res) => res.send('API Running Successfully'));

// 404 Not Found Handler (Catch all requests that don't match defined routes)
// This should be placed after all your specific routes.
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass error to the main error handler
});

// Main Error Handler (Catches errors passed via next(error))
// This needs all 4 arguments (err, req, res, next) for Express to recognize it as an error handling middleware.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Ensure 500 if status is still 200
  res.status(statusCode);
  console.error("SERVER ERROR:", err.message); // Log the error message server-side
  if (process.env.NODE_ENV !== 'production') {
    console.error("STACK:", err.stack); // Log stack trace in development
  }
  res.json({
    message: err.message,
    // Include stack trace only in development environment for debugging
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  }
});

// Handle unhandled promise rejections (good practice)
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  console.error(err.stack);
  // Close server & exit process gracefully
  server.close(() => process.exit(1));
});

// Export the app and server for testing purposes
module.exports = { app, server };

