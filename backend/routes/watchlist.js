const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Watchlist = require('../models/Watchlist');
const Movie = require('../models/Movie');
const axios = require('axios');

// Helper function to fetch movie from TMDB
const fetchMovieFromTMDB = async (tmdbId) => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error('TMDB API key not configured');
  
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}`, {
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error('TMDB API Error:', error.message);
    // Return mock data if TMDB fails
    return {
      id: tmdbId,
      title: `Movie ${tmdbId}`,
      overview: 'Movie data unavailable',
      poster_path: '/placeholder.jpg',
      release_date: '2024-01-01',
      vote_average: 7.0,
      vote_count: 100,
      genres: []
    };
  }
};

// Get user's watchlists (both public and private)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { type } = req.query; // 'public', 'private', or both if not specified

    const query = { user: req.user.id };
    if (type && ['public', 'private'].includes(type)) {
      query.type = type;
    }

    const watchlists = await Watchlist.find(query)
      .populate({
        path: 'movies.movie',
        select: 'title tmdbId posterPath overview releaseDate genres voteAverage'
      })
      .sort({ updatedAt: -1 });

    res.json(watchlists);
  } catch (error) {
    console.error('Get watchlists error:', error);
    res.status(500).json({ message: 'Error fetching watchlists' });
  }
});

// Add movie to watchlist with comment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { movieId, type = 'public', comment = '' } = req.body;

    if (!movieId) {
      return res.status(400).json({ message: 'Movie ID is required' });
    }

    if (!['public', 'private'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either "public" or "private"' });
    }

    // Find or create movie in database
    let movie = await Movie.findOne({ 
      $or: [
        { tmdb_id: movieId },
        { tmdbId: movieId }
      ]
    });
    
    if (!movie) {
      console.log('Movie not found in database, fetching from TMDB...');
      const movieData = await fetchMovieFromTMDB(movieId);
      console.log('TMDB data received:', { title: movieData.title, id: movieData.id });
      
      movie = new Movie({
        tmdbId: movieId,
        tmdb_id: movieId,
        title: movieData.title,
        original_title: movieData.original_title,
        posterPath: movieData.poster_path,
        poster_path: movieData.poster_path,
        backdrop_path: movieData.backdrop_path,
        overview: movieData.overview,
        releaseDate: movieData.release_date,
        release_date: movieData.release_date,
        voteAverage: movieData.vote_average,
        vote_average: movieData.vote_average,
        voteCount: movieData.vote_count,
        vote_count: movieData.vote_count,
        popularity: movieData.popularity,
        genres: movieData.genres || [],
        genre_ids: movieData.genres ? movieData.genres.map(g => g.id) : []
      });
      
      console.log('Saving movie to database...');
      await movie.save();
      console.log('Movie saved with ID:', movie._id);
    }

    // Find or create watchlist
    let watchlist = await Watchlist.findOne({ 
      user: req.user.id, 
      type 
    });

    if (!watchlist) {
      watchlist = new Watchlist({
        user: req.user.id,
        type,
        movies: []
      });
    }

    // Check if movie already exists in this watchlist
    const existingMovie = watchlist.movies.find(
      item => item.movie.toString() === movie._id.toString()
    );

    if (existingMovie) {
      return res.status(409).json({ message: 'Movie already exists in this watchlist' });
    }

    // Add movie to watchlist
    watchlist.movies.push({
      movie: movie._id,
      comment: comment.trim(),
      addedAt: new Date()
    });

    watchlist.updatedAt = new Date();
    await watchlist.save();

    // Return populated watchlist
    const populatedWatchlist = await Watchlist.findById(watchlist._id)
      .populate({
        path: 'movies.movie',
        select: 'title tmdb_id poster_path overview release_date genre_ids vote_average'
      });

    res.status(201).json({
      message: 'Movie added to watchlist successfully',
      watchlist: populatedWatchlist
    });

  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ message: 'Error adding movie to watchlist' });
  }
});

// Update comment for a movie in watchlist
router.put('/:watchlistId/movie/:movieId/comment', authMiddleware, async (req, res) => {
  try {
    const { watchlistId, movieId } = req.params;
    const { comment } = req.body;

    const watchlist = await Watchlist.findOne({
      _id: watchlistId,
      user: req.user.id
    });

    if (!watchlist) {
      return res.status(404).json({ message: 'Watchlist not found' });
    }

    const movieItem = watchlist.movies.find(
      item => item.movie.toString() === movieId
    );

    if (!movieItem) {
      return res.status(404).json({ message: 'Movie not found in watchlist' });
    }

    movieItem.comment = comment.trim();
    watchlist.updatedAt = new Date();
    await watchlist.save();

    res.json({ message: 'Comment updated successfully' });

  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Error updating comment' });
  }
});

// Remove movie from watchlist
router.delete('/:watchlistId/movie/:movieId', authMiddleware, async (req, res) => {
  try {
    const { watchlistId, movieId } = req.params;

    const watchlist = await Watchlist.findOne({
      _id: watchlistId,
      user: req.user.id
    });

    if (!watchlist) {
      return res.status(404).json({ message: 'Watchlist not found' });
    }

    const movieIndex = watchlist.movies.findIndex(
      item => item.movie.toString() === movieId
    );

    if (movieIndex === -1) {
      return res.status(404).json({ message: 'Movie not found in watchlist' });
    }

    watchlist.movies.splice(movieIndex, 1);
    watchlist.updatedAt = new Date();
    await watchlist.save();

    res.json({ message: 'Movie removed from watchlist successfully' });

  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ message: 'Error removing movie from watchlist' });
  }
});

module.exports = router;
