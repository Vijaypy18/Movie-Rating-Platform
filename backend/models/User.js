const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    profilePicture: {
      type: String,
      default: '/default-profile.png',
    },
    securityQuestion: {
      type: String,
      required: true,
      enum: [
        'What is your favorite animal?',
        'What is your favorite flower?',
        'What is your favorite city?',
        'What is your favorite food?',
        'What is your favorite color?',
        'What is your favorite movie?',
        'What is your favorite book?',
        'What is your favorite sport?'
      ]
    },
    securityAnswer: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, // Store in lowercase for case-insensitive comparison
      minlength: 1
    },
    watchlists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Watchlist',
      },
    ],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    friendRequests: {
      sent: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      received: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Password validation method
UserSchema.methods.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Password hashing before saving
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);
