// Simple test script to verify authentication is working
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// Test data
const testUser = {
    username: 'testuser123',
    email: 'testuser123@example.com',
    password: 'testpassword123'
};

async function testAuth() {
    console.log('🔐 Testing Authentication...\n');
    
    try {
        // Test 1: Register new user
        console.log('1. Testing registration...');
        try {
            const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
            console.log('✅ Registration successful');
            console.log(`   Token: ${registerResponse.data.token.substring(0, 20)}...`);
            console.log(`   User: ${registerResponse.data.user.username}`);
            
            // Test login with the same user
            console.log('\n2. Testing login with registered user...');
            const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
                email: testUser.email,
                password: testUser.password
            });
            console.log('✅ Login successful');
            console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);
            console.log(`   User: ${loginResponse.data.user.username}`);
            
        } catch (error) {
            if (error.response?.data?.message?.includes('already exists')) {
                console.log('ℹ️  User already exists, testing login...');
                
                // Test login
                const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
                    email: testUser.email,
                    password: testUser.password
                });
                console.log('✅ Login successful');
                console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);
                console.log(`   User: ${loginResponse.data.user.username}`);
            } else {
                throw error;
            }
        }
        
        console.log('\n🎉 Authentication is working correctly!');
        console.log('\n📝 You can now:');
        console.log('   1. Open frontend/index.html in your browser');
        console.log('   2. Try registering a new user or logging in');
        console.log('   3. Navigate to the movies page to test movie functionality');
        
    } catch (error) {
        console.error('\n❌ Authentication test failed:');
        console.error('   Error:', error.response?.data?.message || error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('   1. Make sure backend server is running: cd backend && npm start');
        console.error('   2. Check MongoDB connection in backend/.env');
        console.error('   3. Verify JWT_SECRET is set in backend/.env');
    }
}

// Run the test
testAuth();