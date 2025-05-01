const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  fplId: { type: Number, unique: true, required: true }, // ID from FPL API
  name: { type: String, required: true },
  short_name: { type: String, required: true, maxlength: 3 }, // e.g., ARS, LIV
  // Add other fields as needed later e.g., strength_rating
});

module.exports = mongoose.model('Team', TeamSchema);