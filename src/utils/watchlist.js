const PRIVATE_WATCHLIST_KEY = 'privateWatchlist';
const PUBLIC_WATCHLIST_KEY = 'publicWatchlist';

export const addToPrivateWatchlist = (movie) => {
  const privateWatchlist = getPrivateWatchlist();
  privateWatchlist.push(movie);
  localStorage.setItem(PRIVATE_WATCHLIST_KEY, JSON.stringify(privateWatchlist));
};

export const addToPublicWatchlist = (movie) => {
  const publicWatchlist = getPublicWatchlist();
  publicWatchlist.push(movie);
  localStorage.setItem(PUBLIC_WATCHLIST_KEY, JSON.stringify(publicWatchlist));
};

export const removeFromPrivateWatchlist = (movie) => {
  const privateWatchlist = getPrivateWatchlist();
  const updatedWatchlist = privateWatchlist.filter((m) => m.id !== movie.id);
  localStorage.setItem(PRIVATE_WATCHLIST_KEY, JSON.stringify(updatedWatchlist));
};

export const removeFromPublicWatchlist = (movie) => {
  const publicWatchlist = getPublicWatchlist();
  const updatedWatchlist = publicWatchlist.filter((m) => m.id !== movie.id);
  localStorage.setItem(PUBLIC_WATCHLIST_KEY, JSON.stringify(updatedWatchlist));
};

export const getPrivateWatchlist = () => {
  const storedWatchlist = localStorage.getItem(PRIVATE_WATCHLIST_KEY);
  return storedWatchlist ? JSON.parse(storedWatchlist) : [];
};

export const getPublicWatchlist = () => {
  const storedWatchlist = localStorage.getItem(PUBLIC_WATCHLIST_KEY);
  return storedWatchlist ? JSON.parse(storedWatchlist) : [];
};