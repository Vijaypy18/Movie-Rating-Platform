const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/moviedb', {
      serverSelectionTimeoutMS: 5001
    });
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    console.error('Detailed MongoDB Connection Error:', err);
    // Exit process with failure
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Models
const User = require('./models/User');
const Movie = require('./models/Movie');
const Watchlist = require('./models/Watchlist');

// Middleware for JWT Authentication
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    if (!req.user) return res.status(403).json({ message: 'User not found' });
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Fetch Movie Details from TMDB API
const fetchMovieDetails = async (tmdbId) => {
  const apiKey = process.env.TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch movie details');
    return await response.json();
  } catch (error) {
    console.error('TMDB API Error:', error);
    throw error;
  }
};

// Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
};

// Routes
app.get('/', (req, res) => {
  res.send('Movie Rating Backend is running!');
});

// Watchlist Routes
app.get('/api/watchlist', authenticateToken, async (req, res) => {
  const { type } = req.query; // type: 'public' or 'private'
  try {
    const watchlists = await Watchlist.find({
      user: req.user._id,
      type: type || 'public'
    }).populate('movies');
    res.json(watchlists);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching watchlists', error: error.message });
  }
});

app.post('/api/watchlist', authenticateToken, async (req, res) => {
  const { type, movieId } = req.body;

  try {
    // Fetch movie details and create movie entry if not exists
    let movie = await Movie.findOne({ tmdbId: movieId });
    if (!movie) {
      const movieDetails = await fetchMovieDetails(movieId);
      movie = new Movie({
        title: movieDetails.title,
        tmdbId: movieId,
        posterPath: movieDetails.poster_path,
        overview: movieDetails.overview,
        releaseDate: movieDetails.release_date
      });
      await movie.save();
    }

    // Create or update watchlist
    let watchlist = await Watchlist.findOne({ user: req.user._id, type: type || 'public' });
    if (!watchlist) {
      watchlist = new Watchlist({ user: req.user._id, type: type || 'public', movies: [] });
    }

    // Add movie to watchlist if not already present
    if (!watchlist.movies.includes(movie._id)) {
      watchlist.movies.push(movie._id);
      await watchlist.save();
    }

    res.status(201).json({ message: 'Movie added to watchlist', watchlist });
  } catch (error) {
    res.status(500).json({ message: 'Error adding movie to watchlist', error: error.message });
  }
});

// Ratings Routes
app.post('/api/ratings', authenticateToken, async (req, res) => {
  const { movieId, rating, comment } = req.body;

  try {
    let movie = await Movie.findOne({ tmdbId: movieId });
    if (!movie) {
      const movieDetails = await fetchMovieDetails(movieId);
      movie = new Movie({
        title: movieDetails.title,
        tmdbId: movieId,
        posterPath: movieDetails.poster_path,
        overview: movieDetails.overview,
        releaseDate: movieDetails.release_date
      });
    }

    // Update or add new rating
    const existingRatingIndex = movie.ratings.findIndex(
      r => r.user.toString() === req.user._id.toString()
    );

    if (existingRatingIndex > -1) {
      movie.ratings[existingRatingIndex] = { user: req.user._id, rating, comment };
    } else {
      movie.ratings.push({ user: req.user._id, rating, comment });
    }

    await movie.save();
    res.status(201).json({ message: 'Rating added/updated', movie });
  } catch (error) {
    res.status(500).json({ message: 'Error adding rating', error: error.message });
  }
});

// Favorites Routes
app.post('/api/favorites', authenticateToken, async (req, res) => {
  const { tmdbId } = req.body;

  try {
    let movie = await Movie.findOne({ tmdbId });
    if (!movie) {
      const movieDetails = await fetchMovieDetails(tmdbId);
      movie = new Movie({
        title: movieDetails.title,
        tmdbId,
        posterPath: movieDetails.poster_path,
        overview: movieDetails.overview,
        releaseDate: movieDetails.release_date
      });
      await movie.save();
    }

    const user = req.user;
    if (!user.favorites.includes(movie._id)) {
      user.favorites.push(movie._id);
      await user.save();
    }

    res.status(200).json({ message: 'Movie added to favorites', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to favorites', error: error.message });
  }
});

app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
});

// Profile Routes
app.put('/api/profile', authenticateToken, async (req, res) => {
  const { username, email, profilePicture } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (username) user.username = username;
    if (email) user.email = email;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Authentication Routes
app.post('/api/auth/register', require('./routes/auth'));
app.post('/api/auth/login', require('./routes/auth'));

// Use error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;