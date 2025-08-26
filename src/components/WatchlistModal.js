import React from 'react';

const WatchlistModal = ({ isPrivate, watchlist, removeFromWatchlist }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          {isPrivate ? 'Private Watchlist' : 'Public Watchlist'}
        </h2>
        {watchlist.length === 0 ? (
          <p>Your watchlist is empty.</p>
        ) : (
          <ul className="space-y-4">
            {watchlist.map((movie) => (
              <li key={movie.id} className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{movie.title}</h3>
                  <p className="text-gray-400">
                    {movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}
                  </p>
                </div>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-md"
                  onClick={() => removeFromWatchlist(movie, isPrivate)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default WatchlistModal;