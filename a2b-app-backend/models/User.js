/// backend/models/User.js

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
      // Basic email format validation regex
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    // Store the hashed password, never the plain text
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      minlength: [6, 'Password must be at least 6 characters long (before hashing)'], // Note: Validation applies before hashing, adjust as needed
      select: false, // Exclude passwordHash from query results by default
    },
    // Optional: Store the user's official FPL manager ID
    fplTeamId: {
      type: Number,
      required: false,
      // Consider adding unique: true, sparse: true later if you want to ensure
      // only one app user can link to a specific FPL ID, while allowing many users
      // *not* to link an ID (sparse index ignores nulls for uniqueness).
    },
    // Add other fields like preferences, roles etc. as needed later
    // roles: {
    //   type: [String],
    //   enum: ['user', 'admin'],
    //   default: ['user']
    // }
  },
  {
    // Add createdAt and updatedAt timestamps automatically
    timestamps: true,
  }
);

// --- Mongoose Middleware ---

// Hash password BEFORE saving a new user document
userSchema.pre('save', async function (next) {
  // Only run this function if password was modified (or is new)
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    // Generate salt (randomness factor for hashing)
    const salt = await bcrypt.genSalt(10); // 10 rounds is generally recommended
    // Hash the password using the generated salt
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error); // Pass error to Mongoose error handling
  }
});

// --- Mongoose Instance Methods ---

// Method to compare entered password with the stored hash during login
userSchema.methods.matchPassword = async function (enteredPassword) {
    console.log('DEBUG matchPassword: Comparing entered password with stored hash...'); // Log method entry
    try {
        const result = await bcrypt.compare(enteredPassword, this.passwordHash);
        console.log('DEBUG matchPassword: bcrypt.compare result =', result); // Log bcrypt result
        return result;
    } catch (compareError) {
        console.error('DEBUG matchPassword: Error during bcrypt compare:', compareError);
        return false; // Important to return false on error
    }
};

// --- Indexing ---
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

// --- Create and Export Model ---
const User = mongoose.model('User', userSchema);

module.exports = User;
