const mongoose = require('mongoose');

// Define the Favorite Schema
const FavoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Reference to the User model
      required: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',  // Reference to the Movie model
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    poster: {
      type: String,  // Store the posterPath from the Movie model
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,  // Year from the Movie model, populated from releaseDate
    },
    addedAt: {
      type: Date,
      default: Date.now,  // Timestamp when the movie is added to favorites
    },
  },
  {
    // Enforcing uniqueness and indexing for faster lookups
    indexes: [
      { user: 1, movie: 1, unique: true }, // Prevent duplicate favorites for the same user and movie
    ],
  }
);

// Export the Favorite model
module.exports = mongoose.model('Favorite', FavoriteSchema);
