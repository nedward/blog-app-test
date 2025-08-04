const axios = require('axios');

const API_URL = 'http://localhost:3001/api/v1';

async function testSimplePost() {
  try {
    // Login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'posttest@example.com',
      password: 'TestPassword123'
    });
    
    const accessToken = loginResponse.data.accessToken;
    console.log('✅ Logged in');

    // Create simple post without tags
    const createResponse = await axios.post(
      `${API_URL}/posts`,
      {
        title: 'Simple Test Post',
        content: 'This is a simple test post without tags.',
        published: true
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    console.log('✅ Post created:', createResponse.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testSimplePost();