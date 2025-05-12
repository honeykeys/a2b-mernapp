const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  fplId: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
  position: { type: String, enum: ['GK', 'DEF', 'MID', 'FWD'] },
  teamFplId: { type: Number },
  currentPrice: { type: Number },
});

module.exports = mongoose.model('Player', PlayerSchema);
