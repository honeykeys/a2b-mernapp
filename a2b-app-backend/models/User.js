// backend/models/User.js

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
      select: false, // Exclude passwordHash from query results by default
    },
    fplTeamId: {
      type: Number, // This is the FPL Manager ID
      required: false,
      default: null,
    },
    fplManagerHistory: {
      type: mongoose.Schema.Types.Mixed, // Stores the raw JSON object from the FPL API
      default: null,
    },
    fplHistoryLastUpdated: { // Tracks when the history was last successfully fetched
      type: Date,
      default: null,
    }
    // roles: {
    //   type: [String],
    //   enum: ['user', 'admin'],
    //   default: ['user']
    // }
  },
  {
    timestamps: true, // Add createdAt and updatedAt timestamps automatically
  }
);

// --- Mongoose Middleware ---
// The pre-save password hashing middleware has been REMOVED from here.
// Hashing will now be handled in the controller layer before saving.

// --- Mongoose Instance Methods ---

// Method to compare entered password with the stored hash during login
userSchema.methods.matchPassword = async function (enteredPassword) {
    // IMPORTANT: `this.passwordHash` will be undefined here if not explicitly selected
    // in the query due to `select: false` in the schema.
    // Ensure your login query does: User.findOne({ email }).select('+passwordHash');
    if (!this.passwordHash) {
        console.error('DEBUG matchPassword: passwordHash not selected on user document or not set.');
        // This indicates a programming error (not selecting the hash) or data issue.
        return false;
    }
    // console.log('DEBUG matchPassword: Comparing entered password with stored hash...'); // Already in controller
    try {
        const result = await bcrypt.compare(enteredPassword, this.passwordHash);
        // console.log('DEBUG matchPassword: bcrypt.compare result =', result); // Already in controller
        return result;
    } catch (compareError) {
        console.error('DEBUG matchPassword: Error during bcrypt compare:', compareError);
        return false; // Important to return false on error
    }
};

// --- Indexing ---
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
// Consider an index on fplTeamId if you query by it often and it's unique/sparse
// if (userSchema.path('fplTeamId').options.unique) {
//   userSchema.index({ fplTeamId: 1 }, { unique: true, sparse: true });
// }

// --- Create and Export Model ---
const User = mongoose.model('User', userSchema);

module.exports = User;
