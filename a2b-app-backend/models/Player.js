const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  fplId: { type: Number, unique: true, required: true }, // ID from FPL API
  name: { type: String, required: true },
  position: { type: String, enum: ['GK', 'DEF', 'MID', 'FWD'] }, // Goalkeeper, Defender, etc.
  teamFplId: { type: Number }, // Link to Team's FPL ID
  currentPrice: { type: Number }, // Store price * 10 (e.g., 6.5m stored as 65) or as float
  // Add other fields as needed later e.g., createdAt
});

module.exports = mongoose.model('Player', PlayerSchema);
