const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes')
const predictionRoutes = require('./routes/predictionRoutes');


const app = express();

connectDB();

app.use(express.json({extended: false}));
app.use('/api/auth', authRoutes);
app.use('/api/predictions', predictionRoutes);

app.get('/', (req, res) => res.send('API Running'));

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
