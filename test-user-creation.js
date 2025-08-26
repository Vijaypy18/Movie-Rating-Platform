// Test user creation directly with database
require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const User = require('./backend/models/User');

async function testUserCreation() {
    console.log('👤 Testing User Creation...\n');
    
    try {
        // Connect to database
        console.log('1. Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45001,
            retryWrites: true,
        });
        console.log('✅ Connected to MongoDB');
        
        // Test user creation
        console.log('\n2. Testing user creation...');
        const testUser = {
            username: `testuser_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            password: 'testpassword123'
        };
        
        console.log('Creating user:', { 
            username: testUser.username, 
            email: testUser.email,
            passwordLength: testUser.password.length 
        });
        
        const newUser = new User(testUser);
        await newUser.save();
        
        console.log('✅ User created successfully');
        console.log('   User ID:', newUser._id);
        console.log('   Username:', newUser.username);
        console.log('   Email:', newUser.email);
        console.log('   Password hashed:', newUser.password.length > 20 ? 'Yes' : 'No');
        
        // Test password validation
        console.log('\n3. Testing password validation...');
        const isValid = await newUser.validatePassword('testpassword123');
        console.log('✅ Password validation:', isValid ? 'PASSED' : 'FAILED');
        
        // Clean up
        await User.deleteOne({ _id: newUser._id });
        console.log('✅ Test user cleaned up');
        
        console.log('\n🎉 User creation is working correctly!');
        console.log('   The issue might be in the API route, not the database');
        
    } catch (error) {
        console.error('\n❌ User creation failed:');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        
        if (error.code === 11000) {
            console.error('\n🔧 Duplicate key error - user already exists');
        } else if (error.name === 'ValidationError') {
            console.error('\n🔧 Validation error:');
            Object.values(error.errors).forEach(err => {
                console.error(`   - ${err.path}: ${err.message}`);
            });
        }
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

testUserCreation();