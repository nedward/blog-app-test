const axios = require('axios');

const API_URL = 'http://localhost:3001/api/v1';

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication System...\n');

    // Test registration
    console.log('1. Testing Registration...');
    const registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPassword123'
    };

    const registerResponse = await axios.post(`${API_URL}/auth/register`, registerData);
    console.log('✅ Registration successful:', {
      user: registerResponse.data.user,
      hasAccessToken: !!registerResponse.data.accessToken,
      hasRefreshToken: !!registerResponse.data.refreshToken
    });

    const { accessToken, refreshToken } = registerResponse.data;

    // Test login
    console.log('\n2. Testing Login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: registerData.email,
      password: registerData.password
    });
    console.log('✅ Login successful:', {
      user: loginResponse.data.user,
      hasTokens: !!loginResponse.data.accessToken
    });

    // Test authenticated endpoint
    console.log('\n3. Testing Protected Endpoint...');
    const meResponse = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log('✅ Protected endpoint accessible:', meResponse.data.user);

    // Test token refresh
    console.log('\n4. Testing Token Refresh...');
    const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken
    });
    console.log('✅ Token refresh successful:', {
      hasNewAccessToken: !!refreshResponse.data.accessToken,
      hasNewRefreshToken: !!refreshResponse.data.refreshToken
    });

    console.log('\n🎉 All authentication tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAuth();
}

module.exports = testAuth;