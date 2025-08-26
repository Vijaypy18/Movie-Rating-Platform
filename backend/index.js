const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500', 'null'],
  credentials: true
}));

// MongoDB Connection with better error handling
const connectDB = async () => {
  try {
    const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movie-rating';
    await mongoose.connect(dbURI, {
      serverSelectionTimeoutMS: 30000, // 30 second timeout
      socketTimeoutMS: 45001, // 45 second socket timeout
      retryWrites: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
    });
    console.log('Connected to MongoDB successfully');
    
    // Test the connection with a simple operation
    const admin = mongoose.connection.db.admin();
    await admin.ping();
    console.log('MongoDB ping successful - database is responsive');
    
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('Retrying connection in 5 seconds...');
    setTimeout(() => {
      connectDB();
    }, 5001);
  }
};
connectDB();

// Import Models
const User = require('./models/User');
const Movie = require('./models/Movie');
const Watchlist = require('./models/Watchlist');
const Favourites = require('./models/favourites');

// Enhanced JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Enhanced TMDB API Integration
const fetchMovieDetails = async (tmdbId, query = null) => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error('TMDB API key not configured');

  const baseUrl = 'https://api.themoviedb.org/3';
  let url;

  if (query) {
    url = `${baseUrl}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
  } else {
    url = `${baseUrl}/movie/${tmdbId}?api_key=${apiKey}`;
  }

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('TMDB API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Improved Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message),
    });
  }

  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(409).json({
      message: 'Duplicate entry found',
      field: Object.keys(err.keyValue)[0],
    });
  }

  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
};

// Enhanced Watchlist Routes with Better Error Handling
// All routes are handled by separate route files

// Watchlist routes are handled by separate route file

// Rating routes are handled by movie routes

// Favourites routes are handled by separate route file

// Movie routes are handled by separate route file

// Authentication Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Friend Routes
const friendRoutes = require('./routes/friends');
app.use('/api/friends', friendRoutes);

// Watchlist Routes
const watchlistRoutes = require('./routes/watchlist');
app.use('/api/watchlist', watchlistRoutes);

// Movie Routes
const movieRoutes = require('./routes/movies');
app.use('/api/movies', movieRoutes);

// Favourites Routes
const favouritesRoutes = require('./routes/favourites');
app.use('/api/favourites', favouritesRoutes);

// Apply error handler
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = app;
    