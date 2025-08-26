import React, { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import WatchlistModal from '../components/WatchlistModal';
import { addToPrivateWatchlist, addToPublicWatchlist, getPrivateWatchlist, getPublicWatchlist, removeFromPrivateWatchlist, removeFromPublicWatchlist } from '../utils/watchlist';

const MoviePage = ({ movie }) => {
  const [showPrivateWatchlistModal, setShowPrivateWatchlistModal] = useState(false);
  const [showPublicWatchlistModal, setShowPublicWatchlistModal] = useState(false);
  const [privateWatchlist, setPrivateWatchlist] = useState([]);
  const [publicWatchlist, setPublicWatchlist] = useState([]);

  useEffect(() => {
    setPrivateWatchlist(getPrivateWatchlist());
    setPublicWatchlist(getPublicWatchlist());
  }, []);

  const handleAddToWatchlist = (movie, isPrivate) => {
    if (isPrivate) {
      addToPrivateWatchlist(movie);
      setPrivateWatchlist(getPrivateWatchlist());
    } else {
      addToPublicWatchlist(movie);
      setPublicWatchlist(getPublicWatchlist());
    }
  };

  const handleRemoveFromWatchlist = (movie, isPrivate) => {
    if (isPrivate) {
      removeFromPrivateWatchlist(movie);
      setPrivateWatchlist(getPrivateWatchlist());
    } else {
      removeFromPublicWatchlist(movie);
      setPublicWatchlist(getPublicWatchlist());
    }
  };

  return (
    <div className="p-4">
      <div className="flex">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="w-1/3 mr-4 rounded-md"
        />
        <div>
          <h1 className="text-2xl font-bold mb-2">{movie.title}</h1>
          <p className="text-gray-400 mb-4">
            {movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}
          </p>
          <p className="mb-4">{movie.overview}</p>
          <div className="flex space-x-4">
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-md"
              onClick={() => setShowPrivateWatchlistModal(true)}
            >
              Add to Private Watchlist
            </button>
            <button
              className="bg-green-600 text-white px-6 py-2 rounded-md"
              onClick={() => setShowPublicWatchlistModal(true)}
            >
              Add to Public Watchlist
            </button>
            <button
              className="bg-yellow-600 text-white px-6 py-2 rounded-md"
              onClick={() => setShowPrivateWatchlistModal(true)}
            >
              View Private Watchlist
            </button>
            <button
              className="bg-yellow-600 text-white px-6 py-2 rounded-md"
              onClick={() => setShowPublicWatchlistModal(true)}
            >
              View Public Watchlist
            </button>
          </div>
        </div>
      </div>

      {showPrivateWatchlistModal && (
        <WatchlistModal
          isPrivate
          watchlist={privateWatchlist}
          removeFromWatchlist={handleRemoveFromWatchlist}
          onClose={() => setShowPrivateWatchlistModal(false)}
        />
      )}

      {showPublicWatchlistModal && (
        <WatchlistModal
          isPrivate={false}
          watchlist={publicWatchlist}
          removeFromWatchlist={handleRemoveFromWatchlist}
          onClose={() => setShowPublicWatchlistModal(false)}
        />
      )}
    </div>
  );
};

export default MoviePage;