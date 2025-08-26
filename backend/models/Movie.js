const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    tmdbId: {
        type: Number,
        required: true,
        unique: true
    },
    tmdb_id: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    original_title: {
        type: String
    },
    posterPath: {
        type: String
    },
    poster_path: {
        type: String
    },
    backdrop_path: {
        type: String
    },
    overview: {
        type: String
    },
    releaseDate: {
        type: Date
    },
    release_date: {
        type: Date
    },
    voteAverage: {
        type: Number,
        default: 0
    },
    vote_average: {
        type: Number,
        default: 0
    },
    voteCount: {
        type: Number,
        default: 0
    },
    vote_count: {
        type: Number,
        default: 0
    },
    popularity: {
        type: Number,
        default: 0
    },
    genres: [{
        id: Number,
        name: String
    }],
    genre_ids: [{
        type: Number
    }],
    // Custom ratings from users
    ratings: [{
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true 
        },
        rating: { 
            type: Number, 
            required: true,
            min: 0, 
            max: 10 
        },
        comment: {
            type: String,
            trim: true
        },
        updatedAt: { 
            type: Date, 
            default: Date.now 
        }
    }],
    user_ratings: [{
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true 
        },
        rating: { 
            type: Number, 
            required: true,
            min: 1, 
            max: 5 
        },
        comment: {
            type: String,
            trim: true
        },
        created_at: { 
            type: Date, 
            default: Date.now 
        }
    }],
    average_user_rating: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Sync fields before saving
MovieSchema.pre('save', function(next) {
    // Sync tmdbId fields
    if (this.tmdbId && !this.tmdb_id) {
        this.tmdb_id = this.tmdbId;
    } else if (this.tmdb_id && !this.tmdbId) {
        this.tmdbId = this.tmdb_id;
    }
    
    // Sync poster path fields
    if (this.posterPath && !this.poster_path) {
        this.poster_path = this.posterPath;
    } else if (this.poster_path && !this.posterPath) {
        this.posterPath = this.poster_path;
    }
    
    // Sync release date fields
    if (this.releaseDate && !this.release_date) {
        this.release_date = this.releaseDate;
    } else if (this.release_date && !this.releaseDate) {
        this.releaseDate = this.release_date;
    }
    
    // Sync vote average fields
    if (this.voteAverage && !this.vote_average) {
        this.vote_average = this.voteAverage;
    } else if (this.vote_average && !this.voteAverage) {
        this.voteAverage = this.vote_average;
    }
    
    // Sync vote count fields
    if (this.voteCount && !this.vote_count) {
        this.vote_count = this.voteCount;
    } else if (this.vote_count && !this.voteCount) {
        this.voteCount = this.vote_count;
    }

    // Calculate average rating
    if (this.user_ratings && this.user_ratings.length > 0) {
        this.average_user_rating = 
            this.user_ratings.reduce((sum, rating) => sum + rating.rating, 0) / this.user_ratings.length;
    }
    
    next();
});

module.exports = mongoose.model('Movie', MovieSchema);

