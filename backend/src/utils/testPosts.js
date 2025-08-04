const axios = require('axios');

const API_URL = 'http://localhost:3001/api/v1';

// Test data
const testUser = {
  username: 'posttest',
  email: 'posttest@example.com',
  password: 'TestPassword123'
};

const testPost = {
  title: 'My First Blog Post',
  content: 'This is an amazing blog post about building sentiment-aware applications. I am so excited to share this with you all!',
  excerpt: 'An amazing blog post about sentiment analysis',
  tags: ['technology', 'ai', 'sentiment-analysis'],
  published: true
};

async function testPostsCRUD() {
  let accessToken, userId, postId;

  try {
    console.log('🧪 Testing Posts CRUD Operations...\n');

    // 1. Register/Login to get auth token
    console.log('1. Setting up authentication...');
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
      accessToken = registerResponse.data.accessToken;
      userId = registerResponse.data.user.id;
      console.log('✅ New user registered');
    } catch (error) {
      if (error.response?.status === 409) {
        // User exists, login instead
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        accessToken = loginResponse.data.accessToken;
        userId = loginResponse.data.user.id;
        console.log('✅ Existing user logged in');
      } else {
        throw error;
      }
    }

    // 2. Create a post
    console.log('\n2. Creating a new post...');
    const createResponse = await axios.post(
      `${API_URL}/posts`,
      testPost,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    postId = createResponse.data.post.id;
    console.log('✅ Post created:', {
      id: postId,
      title: createResponse.data.post.title,
      author: createResponse.data.post.author.username,
      tags: createResponse.data.post.tags.map(t => t.name)
    });

    // 3. Get all posts
    console.log('\n3. Fetching all posts...');
    const listResponse = await axios.get(`${API_URL}/posts`);
    console.log('✅ Posts fetched:', {
      count: listResponse.data.posts.length,
      total: listResponse.data.pagination.total
    });

    // 4. Get single post
    console.log('\n4. Fetching single post...');
    const getResponse = await axios.get(`${API_URL}/posts/${postId}`);
    console.log('✅ Post retrieved:', {
      title: getResponse.data.post.title,
      viewCount: getResponse.data.post.viewCount,
      engagementStats: getResponse.data.post.engagementStats
    });

    // 5. Update post
    console.log('\n5. Updating post...');
    const updateResponse = await axios.put(
      `${API_URL}/posts/${postId}`,
      {
        title: 'My Updated Blog Post',
        tags: ['technology', 'ai', 'machine-learning']
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    console.log('✅ Post updated:', {
      title: updateResponse.data.post.title,
      tags: updateResponse.data.post.tags.map(t => t.name)
    });

    // 6. Get user's posts
    console.log('\n6. Fetching user posts...');
    const userPostsResponse = await axios.get(`${API_URL}/posts/user/${userId}`);
    console.log('✅ User posts fetched:', {
      count: userPostsResponse.data.posts.length
    });

    // 7. Search posts
    console.log('\n7. Searching posts...');
    const searchResponse = await axios.get(`${API_URL}/posts?search=sentiment`);
    console.log('✅ Search results:', {
      found: searchResponse.data.posts.length,
      query: 'sentiment'
    });

    // 8. Delete post
    console.log('\n8. Deleting post...');
    await axios.delete(
      `${API_URL}/posts/${postId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    console.log('✅ Post deleted successfully');

    // 9. Verify deletion
    console.log('\n9. Verifying deletion...');
    try {
      await axios.get(`${API_URL}/posts/${postId}`);
      console.log('❌ Post still exists!');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Post confirmed deleted');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 All posts CRUD tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.error?.details) {
      console.error('Validation errors:', error.response.data.error.details);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testPostsCRUD();
}

module.exports = testPostsCRUD;