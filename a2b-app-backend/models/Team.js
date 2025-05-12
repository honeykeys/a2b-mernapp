const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  fplId: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
  short_name: { type: String, required: true, maxlength: 3 },
});

module.exports = mongoose.model('Team', TeamSchema);