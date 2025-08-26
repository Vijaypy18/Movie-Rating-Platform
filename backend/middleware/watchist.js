const Watchlist = require('../models/Watchlist');

const ensureWatchlist = async (req, res, next) => {
    try {
        let watchlist = await Watchlist.findOne({ user: req.user.id });
        if (!watchlist) {
            watchlist = new Watchlist({ user: req.user.id, movies: [] });
            await watchlist.save();
        }
        req.watchlist = watchlist;
        next();
    } catch (error) {
        next(error); // Pass to centralized error handler
    }
};

module.exports = ensureWatchlist;
