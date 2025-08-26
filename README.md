# Movie Rating Website

A full-stack movie rating and watchlist application built with the MERN stack. Users can search for movies, create public/private watchlists, rate movies, add friends, and view friends' public watchlists.

## Features

### Core Features
- **Movie Search**: Search movies using TMDB API with real-time suggestions
- **User Authentication**: JWT-based authentication system
- **Dual Watchlists**: Public and private watchlist functionality
- **Movie Rating**: Rate movies from 0-10 with optional comments
- **Friend System**: Add friends, send/accept friend requests
- **Social Features**: View friends' public watchlists and comments

### Technical Features
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Search**: Debounced search with live suggestions
- **Infinite Scrolling**: Pagination for movie browsing
- **Deployment Ready**: Configured for Render deployment
- **Error Handling**: Comprehensive error handling and user feedback

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **TMDB API** for movie data
- **CORS** enabled for cross-origin requests

### Frontend
- **Vanilla JavaScript** (ES6+)
- **Tailwind CSS** for styling
- **Axios** for HTTP requests
- **Font Awesome** for icons

## Project Structure

```
movie-rating-website/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Movie.js
│   │   ├── Watchlist.js
│   │   └── favourites.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── movies.js
│   │   ├── watchlist.js
│   │   ├── friends.js
│   │   └── favourites.js
│   ├── middleware/
│   │   └── auth.js
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend files/
│   ├── index.html
│   ├── movies.html
│   ├── watchlist.html
│   ├── favorites.html
│   ├── profile.html
│   ├── movies.js
│   ├── watchlist.js
│   ├── index.js
│   └── style.css
├── server.js (frontend proxy server)
├── package.json
├── render.yaml
└── README.md
```

## Environment Variables

### Backend (.env file)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
TMDB_API_KEY=your_tmdb_api_key
PORT=5001
NODE_ENV=development
```

### Required API Keys
1. **MongoDB Atlas**: Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **TMDB API**: Get your API key from [TMDB](https://www.themoviedb.org/settings/api)

## Local Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account
- TMDB API account

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd movie-rating-website
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

3. **Set up environment variables**
```bash
# Create backend/.env file
cd backend
cp .env.example .env
# Edit .env with your actual values
```

4. **Start the development servers**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Or simply open index.html in your browser
```

5. **Access the application**
- Frontend: http://localhost:3000 (or file:// if opening directly)
- Backend API: http://localhost:5001

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Movies
- `GET /api/movies/search?query=movie_name` - Search movies
- `GET /api/movies/popular?page=1` - Get popular movies
- `GET /api/movies/:tmdbId` - Get movie details
- `POST /api/movies/:tmdbId/rate` - Rate a movie

### Watchlists
- `GET /api/watchlist?type=public|private` - Get user's watchlists
- `POST /api/watchlist` - Add movie to watchlist
- `PUT /api/watchlist/:watchlistId/movie/:movieId/comment` - Update movie comment
- `DELETE /api/watchlist/:watchlistId/movie/:movieId` - Remove movie from watchlist

### Friends
- `GET /api/friends/search?query=username` - Search users
- `POST /api/friends/request/:userId` - Send friend request
- `POST /api/friends/accept/:userId` - Accept friend request
- `POST /api/friends/reject/:userId` - Reject friend request
- `GET /api/friends/list` - Get friends list
- `GET /api/friends/requests` - Get friend requests
- `GET /api/friends/:userId/watchlist` - Get friend's public watchlist
- `DELETE /api/friends/remove/:userId` - Remove friend

### Favorites
- `POST /api/favourites` - Add movie to favorites
- `GET /api/favourites` - Get user's favorites

## Deployment on Render

### Prerequisites
- GitHub repository with your code
- Render account
- Environment variables ready

### Deployment Steps

1. **Push your code to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Render**
- Go to [Render Dashboard](https://dashboard.render.com)
- Click "New" → "Blueprint"
- Connect your GitHub repository
- Render will automatically detect the `render.yaml` file

3. **Set Environment Variables**
In Render dashboard, set these environment variables for the backend service:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A secure random string (32+ characters)
- `TMDB_API_KEY`: Your TMDB API key

4. **Deploy**
- Render will automatically build and deploy both services
- Backend will be available at: `https://movie-rating-backend.onrender.com`
- Frontend will be available at: `https://movie-rating-frontend.onrender.com`

### Manual Deployment (Alternative)

If you prefer manual deployment:

1. **Deploy Backend**
- Create a new Web Service on Render
- Connect your repository
- Set build command: `cd backend && npm install`
- Set start command: `cd backend && npm start`
- Add environment variables

2. **Deploy Frontend**
- Create another Web Service on Render
- Connect the same repository
- Set build command: `npm install`
- Set start command: `npm start`
- Set `BACKEND_URL` environment variable to your backend service URL

## Usage Guide

### Getting Started
1. **Register/Login**: Create an account or login with existing credentials
2. **Browse Movies**: Use the Movies page to search and discover films
3. **Add to Watchlists**: Add movies to public or private watchlists
4. **Rate Movies**: Give ratings and comments to movies you've watched
5. **Find Friends**: Search for other users and send friend requests
6. **Social Features**: View friends' public watchlists and their movie comments

### Key Features
- **Public Watchlist**: Visible to your friends
- **Private Watchlist**: Only visible to you
- **Movie Comments**: Add personal notes to movies in your watchlists
- **Friend System**: Connect with other movie enthusiasts
- **Movie Ratings**: Rate movies from 0-10 with optional comments

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is properly configured
   - Check if frontend is making requests to correct backend URL

2. **Authentication Issues**
   - Verify JWT_SECRET is set correctly
   - Check if token is being sent in Authorization header

3. **Database Connection**
   - Verify MongoDB URI is correct
   - Ensure MongoDB Atlas allows connections from your IP

4. **TMDB API Issues**
   - Check if TMDB_API_KEY is valid
   - Verify API key has proper permissions

### Development Tips
- Use browser developer tools to debug API requests
- Check backend logs for detailed error messages
- Ensure all environment variables are set correctly

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Create an issue in the GitHub repository

---

**Happy movie rating! 🎬**