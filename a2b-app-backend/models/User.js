const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    passwordHash: {
      type: String,
      required: [true, 'Hashed password is required'],
      select: false,
    },
    fplTeamId: {
      type: Number,
      default: null,
    },
    fplManagerHistory: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    fplHistoryLastUpdated: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.passwordHash) {
    return false;
  }
  try {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
  } catch {
    return false;
  }
};
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);
module.exports = User;

