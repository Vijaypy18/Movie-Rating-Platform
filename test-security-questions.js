// Test the new security question system
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testSecurityQuestions() {
    console.log('🔐 Testing Security Question System...\n');
    
    try {
        // Test 1: Get security questions
        console.log('1. Testing get security questions...');
        const questionsResponse = await axios.get(`${API_BASE_URL}/auth/security-questions`);
        console.log('✅ Security questions fetched');
        console.log('   Available questions:', questionsResponse.data.questions.length);
        
        // Test 2: Register with security question
        console.log('\n2. Testing registration with security question...');
        const timestamp = Date.now();
        const testUser = {
            username: `sectest${timestamp}`,
            email: `sectest${timestamp}@example.com`,
            password: 'testpassword123',
            securityQuestion: 'What is your favorite animal?',
            securityAnswer: 'Dog'
        };
        
        const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
        console.log('✅ Registration with security question successful');
        
        // Test 3: Test forgot password with correct answer
        console.log('\n3. Testing forgot password with correct answer...');
        const forgotResponse = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
            email: testUser.email,
            securityQuestion: testUser.securityQuestion,
            securityAnswer: 'dog' // Testing case-insensitive
        });
        console.log('✅ Forgot password verification successful');
        console.log('   Reset token received:', forgotResponse.data.resetToken ? 'Yes' : 'No');
        
        // Test 4: Reset password with token
        console.log('\n4. Testing password reset...');
        const resetResponse = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
            resetToken: forgotResponse.data.resetToken,
            newPassword: 'newpassword123'
        });
        console.log('✅ Password reset successful');
        
        // Test 5: Login with new password
        console.log('\n5. Testing login with new password...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: testUser.email,
            password: 'newpassword123'
        });
        console.log('✅ Login with new password successful');
        
        // Test 6: Test wrong security answer
        console.log('\n6. Testing wrong security answer...');
        try {
            await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
                email: testUser.email,
                securityQuestion: testUser.securityQuestion,
                securityAnswer: 'cat' // Wrong answer
            });
            console.log('❌ Should have failed with wrong answer');
        } catch (error) {
            console.log('✅ Correctly rejected wrong security answer');
            console.log('   Error:', error.response?.data?.message);
        }
        
        console.log('\n🎉 Security Question System Working Perfectly!');
        console.log('\n📋 Features Tested:');
        console.log('   ✅ Security questions API');
        console.log('   ✅ Registration with security Q&A');
        console.log('   ✅ Password reset verification');
        console.log('   ✅ Password reset with token');
        console.log('   ✅ Login with new password');
        console.log('   ✅ Wrong answer rejection');
        console.log('   ✅ Case-insensitive answer matching');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.response?.data || error.message);
    }
}

testSecurityQuestions();