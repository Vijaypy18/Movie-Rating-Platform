// Simple test script to verify backend functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// Test data
const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'testpassword123'
};

let authToken = '';

async function runTests() {
    console.log('🎬 Starting Movie Rating Website Backend Tests...\n');
    
    try {
        // Test 1: Register user
        console.log('1. Testing user registration...');
        try {
            const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
            console.log('✅ User registration successful');
            authToken = registerResponse.data.token;
        } catch (error) {
            if (error.response?.data?.message?.includes('already exists')) {
                console.log('ℹ️  User already exists, trying login...');
                
                // Test 2: Login user
                const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
                    email: testUser.email,
                    password: testUser.password
                });
                console.log('✅ User login successful');
                authToken = loginResponse.data.token;
            } else {
                throw error;
            }
        }
        
        // Test 3: Get user profile
        console.log('2. Testing get user profile...');
        const profileResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        console.log('✅ Get user profile successful');
        console.log(`   User: ${profileResponse.data.username} (${profileResponse.data.email})`);
        
        // Test 4: Search movies
        console.log('3. Testing movie search...');
        const searchResponse = await axios.get(`${API_BASE_URL}/movies/search`, {
            params: { query: 'Avengers' }
        });
        console.log('✅ Movie search successful');
        console.log(`   Found ${searchResponse.data.results?.length || 0} movies`);
        
        // Test 5: Get popular movies
        console.log('4. Testing popular movies...');
        const popularResponse = await axios.get(`${API_BASE_URL}/movies/popular`);
        console.log('✅ Popular movies successful');
        console.log(`   Found ${popularResponse.data.results?.length || 0} popular movies`);
        
        // Test 6: Add movie to watchlist
        if (searchResponse.data.results && searchResponse.data.results.length > 0) {
            console.log('5. Testing add to watchlist...');
            const movie = searchResponse.data.results[0];
            const watchlistResponse = await axios.post(`${API_BASE_URL}/watchlist`, {
                movieId: movie.id,
                type: 'public',
                comment: 'Test movie added via API test'
            }, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            console.log('✅ Add to watchlist successful');
            console.log(`   Added: ${movie.title}`);
        }
        
        // Test 7: Get watchlist
        console.log('6. Testing get watchlist...');
        const watchlistGetResponse = await axios.get(`${API_BASE_URL}/watchlist`, {
            params: { type: 'public' },
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        console.log('✅ Get watchlist successful');
        console.log(`   Watchlist has ${watchlistGetResponse.data.length} lists`);
        
        // Test 8: Search users
        console.log('7. Testing user search...');
        const userSearchResponse = await axios.get(`${API_BASE_URL}/friends/search`, {
            params: { query: 'test' },
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        console.log('✅ User search successful');
        console.log(`   Found ${userSearchResponse.data.length} users`);
        
        console.log('\n🎉 All tests passed! Backend is working correctly.');
        console.log('\n📝 Next steps:');
        console.log('   1. Start the backend: cd backend && npm run dev');
        console.log('   2. Open index.html in your browser');
        console.log('   3. Register/login and test the full application');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.response?.data?.message || error.message);
        console.error('   Make sure the backend server is running on http://localhost:5001');
        console.error('   Check your .env file has all required variables');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests();
}

module.exports = { runTests };