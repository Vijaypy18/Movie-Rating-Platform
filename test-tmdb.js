// Test TMDB API directly
require('dotenv').config({ path: './backend/.env' });

const axios = require('axios');

async function testTMDB() {
    console.log('🎬 Testing TMDB API...\n');
    
    const apiKey = process.env.TMDB_API_KEY;
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
    
    if (!apiKey) {
        console.error('❌ TMDB_API_KEY not found in environment variables');
        return;
    }
    
    try {
        // Test popular movies
        console.log('1. Testing popular movies...');
        const popularUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=1`;
        console.log('URL:', popularUrl);
        
        const response = await axios.get(popularUrl);
        console.log('Response status:', response.status);
        
        const data = response.data;
        console.log('✅ Popular movies API working');
        console.log(`   Found ${data.results?.length || 0} movies`);
        console.log(`   First movie: ${data.results?.[0]?.title || 'N/A'}`);
        
        // Test search
        console.log('\n2. Testing movie search...');
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=Avengers&page=1`;
        const searchResponse = await axios.get(searchUrl);
        const searchData = searchResponse.data;
        console.log('✅ Movie search API working');
        console.log(`   Found ${searchData.results?.length || 0} movies for "Avengers"`);
        
        console.log('\n🎉 TMDB API is working correctly!');
        
    } catch (error) {
        console.error('\n❌ TMDB API test failed:');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testTMDB();