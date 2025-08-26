// Debug API issues
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function debugAPI() {
    console.log('🔍 Debugging API Issues...\n');
    
    try {
        // Test 1: Check if server is running
        console.log('1. Testing server connection...');
        try {
            const healthCheck = await axios.get(`${API_BASE_URL}/movies/popular?page=1`);
            console.log('✅ Server is running');
            console.log(`   Movies response: ${healthCheck.data.results?.length || 0} movies`);
        } catch (serverError) {
            console.log('❌ Server connection failed:', serverError.message);
            console.log('   Make sure backend server is running: cd backend && npm start');
            return;
        }
        
        // Test 2: Test registration with detailed logging
        console.log('\n2. Testing registration...');
        const testUser = {
            username: `debuguser_${Date.now()}`,
            email: `debug_${Date.now()}@example.com`,
            password: 'debugpassword123'
        };
        
        console.log('   Sending registration data:', { 
            username: testUser.username, 
            email: testUser.email, 
            passwordLength: testUser.password.length 
        });
        
        try {
            const regResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
            console.log('✅ Registration successful');
            const token = regResponse.data.token;
            
            // Test 3: Test watchlist with detailed logging
            console.log('\n3. Testing watchlist API...');
            const watchlistData = {
                movieId: 550, // Fight Club TMDB ID
                type: 'public',
                comment: 'Debug test movie'
            };
            
            console.log('   Sending watchlist data:', watchlistData);
            console.log('   Using token:', token.substring(0, 20) + '...');
            
            try {
                const watchlistResponse = await axios.post(`${API_BASE_URL}/watchlist`, watchlistData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log('✅ Watchlist API successful');
            } catch (watchlistError) {
                console.log('❌ Watchlist API failed:');
                console.log('   Status:', watchlistError.response?.status);
                console.log('   Message:', watchlistError.response?.data?.message);
                console.log('   Full error:', watchlistError.response?.data);
            }
            
            // Test 4: Test favorites with detailed logging
            console.log('\n4. Testing favorites API...');
            const favoritesData = {
                tmdbId: 550 // Fight Club TMDB ID
            };
            
            console.log('   Sending favorites data:', favoritesData);
            
            try {
                const favoritesResponse = await axios.post(`${API_BASE_URL}/favourites`, favoritesData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log('✅ Favorites API successful');
            } catch (favoritesError) {
                console.log('❌ Favorites API failed:');
                console.log('   Status:', favoritesError.response?.status);
                console.log('   Message:', favoritesError.response?.data?.message);
                console.log('   Full error:', favoritesError.response?.data);
            }
            
        } catch (regError) {
            console.log('❌ Registration failed:');
            console.log('   Status:', regError.response?.status);
            console.log('   Message:', regError.response?.data?.message);
            console.log('   Full error:', regError.response?.data);
        }
        
    } catch (error) {
        console.error('\n❌ Debug failed:', error.message);
    }
}

debugAPI();