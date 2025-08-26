// Debug the exact requests being made
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function debugRequests() {
    console.log('🔍 Debugging Exact Requests...\n');
    
    try {
        // First, let's register a user and get a token
        console.log('1. Creating test user...');
        const timestamp = Date.now();
        const testUser = {
            username: `user${timestamp}`,
            email: `user${timestamp}@test.com`,
            password: 'testpassword123'
        };
        
        let token;
        try {
            const regResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
            token = regResponse.data.token;
            console.log('✅ User created, token received');
        } catch (regError) {
            // Try login if user exists
            try {
                const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
                    email: testUser.email,
                    password: testUser.password
                });
                token = loginResponse.data.token;
                console.log('✅ User logged in, token received');
            } catch (loginError) {
                console.log('❌ Both register and login failed');
                console.log('Register error:', regError.response?.data);
                console.log('Login error:', loginError.response?.data);
                return;
            }
        }
        
        // Test watchlist request exactly as frontend sends it
        console.log('\n2. Testing watchlist request...');
        const watchlistPayload = {
            movieId: 550, // Fight Club
            type: 'public'
        };
        
        console.log('Sending to watchlist:', watchlistPayload);
        console.log('Headers:', { 'Authorization': `Bearer ${token.substring(0, 20)}...` });
        
        try {
            const watchlistResponse = await axios.post(`${API_BASE_URL}/watchlist`, watchlistPayload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ Watchlist success:', watchlistResponse.data);
        } catch (watchlistError) {
            console.log('❌ Watchlist failed:');
            console.log('Status:', watchlistError.response?.status);
            console.log('Data:', watchlistError.response?.data);
            console.log('Headers:', watchlistError.response?.headers);
        }
        
        // Test favorites request exactly as frontend sends it
        console.log('\n3. Testing favorites request...');
        const favoritesPayload = {
            tmdbId: 550 // Fight Club
        };
        
        console.log('Sending to favorites:', favoritesPayload);
        
        try {
            const favoritesResponse = await axios.post(`${API_BASE_URL}/favourites`, favoritesPayload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ Favorites success:', favoritesResponse.data);
        } catch (favoritesError) {
            console.log('❌ Favorites failed:');
            console.log('Status:', favoritesError.response?.status);
            console.log('Data:', favoritesError.response?.data);
            console.log('Headers:', favoritesError.response?.headers);
        }
        
        // Test what movies API returns
        console.log('\n4. Testing movies API...');
        try {
            const moviesResponse = await axios.get(`${API_BASE_URL}/movies/popular?page=1`);
            console.log('✅ Movies API working');
            console.log('Sample movie:', {
                id: moviesResponse.data.results[0]?.id,
                title: moviesResponse.data.results[0]?.title
            });
        } catch (moviesError) {
            console.log('❌ Movies API failed:', moviesError.response?.data);
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugRequests();