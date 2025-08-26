// Test if axios is working
const axios = require('axios');

async function testAxios() {
    console.log('🔧 Testing Axios...');
    
    try {
        // Test a simple HTTP request
        const response = await axios.get('https://httpbin.org/json', {
            timeout: 5001
        });
        console.log('✅ Axios is working correctly');
        console.log('   Response status:', response.status);
        console.log('   Response data keys:', Object.keys(response.data));
    } catch (error) {
        console.error('❌ Axios test failed:', error.message);
        console.error('   This might indicate a network or proxy issue');
    }
}

testAxios();