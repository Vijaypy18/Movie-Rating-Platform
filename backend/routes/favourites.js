const express = require('express');
const router = express.Router();
const Favorite = require('../models/favourites'); // Import Favorite model
const Movie = require('../models/Movie'); // Import Movie model
const authMiddleware = require('../middleware/auth'); // Import authentication middleware

// Get all favorites for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Fetch and populate the 'movie' field with relevant details (title, posterPath, averageRating, year)
    const favorites = await Favorite.find({ user: req.user.id })
      .populate('movie', 'title posterPath averageRating year');  // Populate movie fields

    // Send back the list of favorite movies
    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Server error fetching favorites' });
  }
});

// Add a movie to favorites
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tmdbId } = req.body;

    if (!tmdbId) {
      return res.status(400).json({ message: 'TMDB ID is required' });
    }

    // Find or create movie in database
    let movie = await Movie.findOne({ 
      $or: [
        { tmdb_id: tmdbId },
        { tmdbId: tmdbId }
      ]
    });

    if (!movie) {
      // Fetch movie from TMDB and create it
      const axios = require('axios');
      const apiKey = process.env.TMDB_API_KEY;
      
      try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}`, {
          timeout: 10000
        });
        const movieData = response.data;
        
        movie = new Movie({
          tmdbId: tmdbId,
          tmdb_id: tmdbId,
          title: movieData.title,
          posterPath: movieData.poster_path,
          poster_path: movieData.poster_path,
          overview: movieData.overview,
          releaseDate: movieData.release_date,
          voteAverage: movieData.vote_average,
          voteCount: movieData.vote_count
        });
        await movie.save();
      } catch (tmdbError) {
        console.error('TMDB API Error:', tmdbError.message);
        return res.status(500).json({ message: 'Failed to fetch movie data' });
      }
    }

    // Check if the movie is already in the user's favorites
    const existingFavorite = await Favorite.findOne({
      user: req.user.id,
      movie: movie._id,
    });
    if (existingFavorite) {
      return res.status(400).json({ message: 'Movie already in favorites' });
    }

    // Add the movie to the user's favorites
    const newFavorite = new Favorite({
      user: req.user.id,
      movie: movie._id,
      title: movie.title,
      poster: movie.posterPath || movie.poster_path,
      rating: movie.voteAverage || movie.vote_average || 0,
      year: movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : new Date().getFullYear(),
    });

    await newFavorite.save();

    res.status(201).json({
      message: 'Movie added to favorites successfully',
      favorite: newFavorite
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Server error adding to favorites' });
  }
});

// Remove a movie from favorites
router.delete('/:movieId', authMiddleware, async (req, res) => {
  try {
    // Find and delete the movie from the user's favorites
    const favorite = await Favorite.findOneAndDelete({
      user: req.user.id,
      movie: req.params.movieId,
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites' });  // Send success response
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ message: 'Server error removing from favorites' });
  }
});

// Get a single favorite by movie ID
router.get('/:movieId', authMiddleware, async (req, res) => {
  try {
    // Fetch a single favorite by movie ID, and populate the movie details
    const favorite = await Favorite.findOne({
      user: req.user.id,
      movie: req.params.movieId,
    })
      .populate('movie', 'title posterPath averageRating year');  // Populate movie details

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json(favorite);  // Send back the single favorite movie details
  } catch (error) {
    console.error('Error fetching favorite:', error);
    res.status(500).json({ message: 'Server error fetching favorite' });
  }
});

// Clear all favorites for the user
router.delete('/clear/all', authMiddleware, async (req, res) => {
  try {
    // Remove all favorites associated with the current user
    await Favorite.deleteMany({ user: req.user.id });
    res.json({ message: 'All favorites cleared' });
  } catch (error) {
    console.error('Error clearing favorites:', error);
    res.status(500).json({ message: 'Server error clearing favorites' });
  }
});

module.exports = router;
