const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  movies: [{
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Watchlist', WatchlistSchema);