const axios = require('axios');

const API_URL = 'http://localhost:3001/api/v1';

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication Flow...\n');
    
    // 1. Register new user
    console.log('1️⃣  Registering new user...');
    const timestamp = Date.now();
    const registerRes = await axios.post(`${API_URL}/auth/register`, {
      username: 'testuser' + timestamp,
      email: `test${timestamp}@example.com`,
      password: 'TestPass123!'
    });
    console.log('✅ Registration successful:', {
      username: registerRes.data.user.username,
      email: registerRes.data.user.email
    });
    
    const { accessToken, refreshToken } = registerRes.data;
    
    // 2. Get current user
    console.log('\n2️⃣  Getting current user...');
    const meRes = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log('✅ Current user retrieved:', meRes.data.user.username);
    
    // 3. Create a post
    console.log('\n3️⃣  Creating a blog post...');
    const postRes = await axios.post(`${API_URL}/posts`, {
      title: 'Test Post with Amazing Content',
      content: '<p>This is a wonderful test post with great content!</p>',
      excerpt: 'A wonderful test',
      tags: ['test', 'amazing'],
      published: true
    }, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log('✅ Post created:', {
      id: postRes.data.post.id,
      title: postRes.data.post.title,
      sentiment: postRes.data.post.sentiment,
      score: postRes.data.post.sentiment_score
    });
    
    // 4. Like the post
    console.log('\n4️⃣  Liking the post...');
    const likeRes = await axios.post(`${API_URL}/engagements/posts/${postRes.data.post.id}`, {
      isLike: true
    }, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log('✅ Post liked:', likeRes.data);
    
    // 5. Get posts list
    console.log('\n5️⃣  Getting posts list...');
    const postsRes = await axios.get(`${API_URL}/posts`);
    console.log('✅ Posts retrieved:', postsRes.data.posts.length, 'posts');
    
    console.log('\n🎉 All tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', JSON.stringify(error.response?.data || error.message, null, 2));
    process.exit(1);
  }
}

testAuth();