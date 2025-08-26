// Test MongoDB connection
require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

async function testDatabase() {
    console.log('🗄️  Testing MongoDB Connection...\n');
    
    const dbURI = process.env.MONGODB_URI;
    console.log('MongoDB URI:', dbURI ? `${dbURI.substring(0, 20)}...` : 'NOT FOUND');
    
    if (!dbURI) {
        console.error('❌ MONGODB_URI not found in environment variables');
        return;
    }
    
    try {
        console.log('1. Attempting to connect to MongoDB...');
        
        await mongoose.connect(dbURI, {
            serverSelectionTimeoutMS: 10000, // 10 second timeout
            retryWrites: true,
        });
        
        console.log('✅ Connected to MongoDB successfully');
        
        // Test database operations
        console.log('\n2. Testing database operations...');
        
        // Test creating a simple document
        const testSchema = new mongoose.Schema({
            name: String,
            createdAt: { type: Date, default: Date.now }
        });
        
        const TestModel = mongoose.model('Test', testSchema);
        
        // Create a test document
        const testDoc = new TestModel({ name: 'Connection Test' });
        await testDoc.save();
        console.log('✅ Successfully created test document');
        
        // Read the test document
        const foundDoc = await TestModel.findOne({ name: 'Connection Test' });
        console.log('✅ Successfully read test document:', foundDoc.name);
        
        // Clean up - delete the test document
        await TestModel.deleteOne({ name: 'Connection Test' });
        console.log('✅ Successfully deleted test document');
        
        console.log('\n🎉 Database connection and operations are working perfectly!');
        
        // Test User model specifically
        console.log('\n3. Testing User model...');
        const User = require('./backend/models/User');
        
        const userCount = await User.countDocuments();
        console.log(`✅ User collection accessible - ${userCount} users found`);
        
        console.log('\n📋 Database Status: HEALTHY ✅');
        
    } catch (error) {
        console.error('\n❌ Database connection failed:');
        console.error('Error:', error.message);
        
        if (error.message.includes('authentication failed')) {
            console.error('\n🔧 Authentication Issue:');
            console.error('   - Check username and password in MongoDB URI');
            console.error('   - Verify MongoDB Atlas user permissions');
        } else if (error.message.includes('network')) {
            console.error('\n🔧 Network Issue:');
            console.error('   - Check internet connection');
            console.error('   - Verify MongoDB Atlas IP whitelist');
            console.error('   - Check firewall settings');
        } else if (error.message.includes('timeout')) {
            console.error('\n🔧 Timeout Issue:');
            console.error('   - MongoDB Atlas might be slow to respond');
            console.error('   - Try increasing serverSelectionTimeoutMS');
        }
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

testDatabase();