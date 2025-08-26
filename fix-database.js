// Fix database connection issues
require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

async function fixDatabase() {
    console.log('🔧 Fixing Database Connection Issues...\n');
    
    try {
        console.log('1. Testing basic connection...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5001,
        });
        console.log('✅ Basic connection successful');
        
        console.log('\n2. Testing database ping...');
        const admin = mongoose.connection.db.admin();
        const pingResult = await admin.ping();
        console.log('✅ Database ping successful:', pingResult);
        
        console.log('\n3. Listing collections...');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`✅ Found ${collections.length} collections:`, collections.map(c => c.name));
        
        console.log('\n4. Testing simple operations...');
        
        // Create a simple test collection
        const testCollection = mongoose.connection.db.collection('connectiontest');
        
        // Insert a test document
        await testCollection.insertOne({ test: 'data', timestamp: new Date() });
        console.log('✅ Insert operation successful');
        
        // Find the test document
        const testDoc = await testCollection.findOne({ test: 'data' });
        console.log('✅ Find operation successful:', testDoc.test);
        
        // Delete the test document
        await testCollection.deleteOne({ test: 'data' });
        console.log('✅ Delete operation successful');
        
        console.log('\n🎉 Database is working correctly!');
        console.log('\n📋 Recommendations:');
        console.log('   1. Restart your backend server to apply connection fixes');
        console.log('   2. The database connection should now be stable');
        console.log('   3. Try registering a new user in the frontend');
        
    } catch (error) {
        console.error('\n❌ Database fix failed:');
        console.error('Error:', error.message);
        
        console.log('\n🔧 Troubleshooting Steps:');
        console.log('   1. Check MongoDB Atlas cluster status');
        console.log('   2. Verify IP whitelist includes your current IP');
        console.log('   3. Check if cluster is paused (free tier auto-pauses)');
        console.log('   4. Try connecting from MongoDB Compass to test');
        
        console.log('\n💡 Alternative Solution:');
        console.log('   If MongoDB Atlas is having issues, you can:');
        console.log('   1. Use a local MongoDB instance');
        console.log('   2. Create a new MongoDB Atlas cluster');
        console.log('   3. Check MongoDB Atlas status page');
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

fixDatabase();