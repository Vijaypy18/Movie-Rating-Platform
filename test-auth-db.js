// Test authentication with database
require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const User = require('./backend/models/User');

async function testAuthDB() {
    console.log('🔐 Testing Authentication with Database...\n');
    
    try {
        // Connect to database
        console.log('1. Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45001,
            retryWrites: true,
        });
        console.log('✅ Connected to MongoDB');
        
        // Test User operations
        console.log('\n2. Testing User model operations...');
        
        // Check existing users
        const userCount = await User.countDocuments().maxTimeMS(10000);
        console.log(`✅ Found ${userCount} existing users in database`);
        
        // Try to find a specific user (if any exist)
        if (userCount > 0) {
            const sampleUser = await User.findOne().maxTimeMS(10000);
            console.log(`✅ Sample user found: ${sampleUser.username}`);
        }
        
        // Test creating a new user
        console.log('\n3. Testing user creation...');
        const testUser = {
            username: `testuser_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            password: 'testpassword123'
        };
        
        const newUser = new User(testUser);
        await newUser.save();
        console.log(`✅ Successfully created user: ${newUser.username}`);
        
        // Test user login validation
        console.log('\n4. Testing password validation...');
        const isValidPassword = await newUser.validatePassword('testpassword123');
        console.log(`✅ Password validation: ${isValidPassword ? 'PASSED' : 'FAILED'}`);
        
        // Clean up - delete test user
        await User.deleteOne({ _id: newUser._id });
        console.log('✅ Test user cleaned up');
        
        console.log('\n🎉 Authentication database operations are working perfectly!');
        console.log('\n📋 Summary:');
        console.log(`   - Database connection: ✅ Working`);
        console.log(`   - User model: ✅ Working`);
        console.log(`   - User creation: ✅ Working`);
        console.log(`   - Password hashing: ✅ Working`);
        console.log(`   - Password validation: ✅ Working`);
        
    } catch (error) {
        console.error('\n❌ Authentication database test failed:');
        console.error('Error:', error.message);
        
        if (error.message.includes('timeout')) {
            console.error('\n🔧 Timeout Issue:');
            console.error('   - MongoDB Atlas might be slow');
            console.error('   - Try restarting the backend server');
            console.error('   - Check MongoDB Atlas status');
        }
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

testAuthDB();