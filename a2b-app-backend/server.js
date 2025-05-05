const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // <-- Require cors
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes')
const predictionRoutes = require('./routes/predictionRoutes');


const app = express();

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN, // Allow only your frontend origin
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};
app.use(cors(corsOptions)); // Apply CORS middleware globally first
dotenv.config(); // Load .env variables
connectDB();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/predictions', predictionRoutes);

app.get('/', (req, res) => res.send('API Running'));
app.use('/api/auth', authRoutes);
app.use('/api/predictions', predictionRoutes);

 // 404 Not Found Handler (Catch all requests that don't match routes)
 app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass error to the main error handler
});

// Main Error Handler (Catches errors passed via next(error))
// Needs all 4 arguments for Express to recognise it as error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Set status code: use existing one or default to 500 (Internal Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  console.error("ERROR:", err.message); // Log the error message server-side
  res.json({
    message: err.message,
    // Include stack trace only in development environment for debugging
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
    // Only log server running if not in test mode
    if (process.env.NODE_ENV !== 'test') {
      console.log(`Server running on port ${PORT}`);
    }
  });
  
  // Handle unhandled promise rejections (good practice)
  process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
  
  // Export the app for testing purposes
  module.exports = { app, server }; // Export server too for closing in tests
