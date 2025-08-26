// Test what data structure the watchlist API returns
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testWatchlistData() {
    console.log('🔍 Testing Watchlist Data Structure...\n');
    
    try {
        // Create a test user and add a movie to watchlist
        const timestamp = Date.now();
        const testUser = {
            username: `testuser${timestamp}`,
            email: `test${timestamp}@example.com`,
            password: 'testpassword123'
        };
        
        console.log('1. Creating test user...');
        const regResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
        const token = regResponse.data.token;
        console.log('✅ User created');
        
        console.log('\n2. Adding movie to watchlist...');
        const addResponse = await axios.post(`${API_BASE_URL}/watchlist`, {
            movieId: 550, // Fight Club
            type: 'public',
            comment: 'Test movie for data structure check'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Movie added to watchlist');
        
        console.log('\n3. Fetching watchlist data...');
        const watchlistResponse = await axios.get(`${API_BASE_URL}/watchlist`, {
            params: { type: 'public' },
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ Watchlist data fetched');
        console.log('\n📊 Watchlist Data Structure:');
        console.log('Response data:', JSON.stringify(watchlistResponse.data, null, 2));
        
        if (watchlistResponse.data.length > 0) {
            const watchlist = watchlistResponse.data[0];
            console.log('\n📋 First Watchlist:');
            console.log('- Type:', watchlist.type);
            console.log('- Movies count:', watchlist.movies?.length || 0);
            
            if (watchlist.movies && watchlist.movies.length > 0) {
                const firstMovie = watchlist.movies[0];
                console.log('\n🎬 First Movie Structure:');
                console.log('- Movie item:', JSON.stringify(firstMovie, null, 2));
                
                if (firstMovie.movie) {
                    console.log('\n🎭 Movie Object Fields:');
                    console.log('Available fields:', Object.keys(firstMovie.movie));
                    console.log('- Title:', firstMovie.movie.title);
                    console.log('- Poster path fields:');
                    console.log('  - poster_path:', firstMovie.movie.poster_path);
                    console.log('  - posterPath:', firstMovie.movie.posterPath);
                    console.log('  - poster:', firstMovie.movie.poster);
                    console.log('- Release date fields:');
                    console.log('  - release_date:', firstMovie.movie.release_date);
                    console.log('  - releaseDate:', firstMovie.movie.releaseDate);
                    console.log('- Vote average fields:');
                    console.log('  - vote_average:', firstMovie.movie.vote_average);
                    console.log('  - voteAverage:', firstMovie.movie.voteAverage);
                }
            }
        }
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.response?.data || error.message);
    }
}

testWatchlistData();