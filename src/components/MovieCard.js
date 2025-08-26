import React, { useState } from 'react';

const MovieCard = ({ movie, isPrivate, addToWatchlist }) => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleAddToWatchlist = () => {
    addToWatchlist(movie, isPrivate);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-center relative">
      <div className="relative w-full h-96">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path || '/s7FqK5naHE3sdeJ6HXT1jNKkp05.jpg'}`}
          alt={movie.title}
          className="w-full h-full object-cover mb-4 rounded-md"
        />
        <div
          className={`absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-center ${
            showSuccessMessage ? 'block' : 'hidden'
          }`}
        >
          <p>Movie added to watchlist!</p>
        </div>
      </div>
      <div className="mt-2">
        <h3 className="text-lg font-semibold">{movie.title}</h3>
        <p className="text-gray-400">{movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-md mt-2"
          onClick={handleAddToWatchlist}
        >
          Add to Watchlist
        </button>
      </div>
    </div>
  );
};

export default MovieCard;