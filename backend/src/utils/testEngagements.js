const axios = require('axios');

const API_URL = 'http://localhost:3001/api/v1';

// Test users
const testUsers = [
  {
    username: 'engageuser1',
    email: 'engageuser1@example.com',
    password: 'TestPassword123'
  },
  {
    username: 'engageuser2',
    email: 'engageuser2@example.com',
    password: 'TestPassword123'
  }
];

async function testEngagementSystem() {
  let user1Token, user2Token, postId;

  try {
    console.log('🧪 Testing Engagement System...\n');

    // 1. Setup authentication for two users
    console.log('1. Setting up test users...');
    const tokens = [];
    
    for (const user of testUsers) {
      try {
        const registerResponse = await axios.post(`${API_URL}/auth/register`, user);
        tokens.push(registerResponse.data.accessToken);
        console.log(`✅ User ${user.username} registered`);
      } catch (error) {
        if (error.response?.status === 409) {
          const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: user.email,
            password: user.password
          });
          tokens.push(loginResponse.data.accessToken);
          console.log(`✅ User ${user.username} logged in`);
        } else {
          throw error;
        }
      }
    }
    
    [user1Token, user2Token] = tokens;

    // 2. Create a test post
    console.log('\n2. Creating a test post...');
    const postResponse = await axios.post(
      `${API_URL}/posts`,
      {
        title: 'Test Post for Engagement',
        content: 'This is a test post to demonstrate the like/dislike engagement system. What do you think?',
        published: true,
        tags: ['test', 'engagement']
      },
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    postId = postResponse.data.post.id;
    console.log('✅ Post created:', postResponse.data.post.title);

    // 3. User 1 likes the post
    console.log('\n3. Testing like functionality...');
    const like1Response = await axios.post(
      `${API_URL}/engagements/posts/${postId}`,
      { isLike: true },
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    console.log('✅ User 1 liked the post:', like1Response.data.stats);

    // 4. User 2 dislikes the post
    console.log('\n4. Testing dislike functionality...');
    const dislikeResponse = await axios.post(
      `${API_URL}/engagements/posts/${postId}`,
      { isLike: false },
      { headers: { Authorization: `Bearer ${user2Token}` } }
    );
    console.log('✅ User 2 disliked the post:', dislikeResponse.data.stats);

    // 5. Get engagement stats
    console.log('\n5. Fetching engagement stats...');
    const statsResponse = await axios.get(
      `${API_URL}/engagements/posts/${postId}`,
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    console.log('✅ Engagement stats:', statsResponse.data);

    // 6. User 1 changes from like to dislike
    console.log('\n6. Testing engagement change...');
    const changeResponse = await axios.post(
      `${API_URL}/engagements/posts/${postId}`,
      { isLike: false },
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    console.log('✅ User 1 changed to dislike:', changeResponse.data.stats);

    // 7. User 2 removes their engagement (toggle off)
    console.log('\n7. Testing engagement removal...');
    const removeResponse = await axios.post(
      `${API_URL}/engagements/posts/${postId}`,
      { isLike: false },
      { headers: { Authorization: `Bearer ${user2Token}` } }
    );
    console.log('✅ User 2 removed engagement:', removeResponse.data.stats);

    // 8. Get user's engagements
    console.log('\n8. Fetching user engagements...');
    const userEngagementsResponse = await axios.get(
      `${API_URL}/engagements/user`,
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    console.log('✅ User 1 engagements:', {
      total: userEngagementsResponse.data.engagements.length,
      engagements: userEngagementsResponse.data.engagements.map(e => ({
        postTitle: e.Post.title,
        isLike: e.isLike
      }))
    });

    // 9. Create more posts and engagements for trending
    console.log('\n9. Creating data for trending posts...');
    const morePosts = [];
    for (let i = 0; i < 3; i++) {
      const post = await axios.post(
        `${API_URL}/posts`,
        {
          title: `Trending Post ${i + 1}`,
          content: `This is trending post number ${i + 1}. It's getting a lot of engagement!`,
          published: true
        },
        { headers: { Authorization: `Bearer ${user1Token}` } }
      );
      morePosts.push(post.data.post.id);
      
      // Add likes from both users
      await axios.post(
        `${API_URL}/engagements/posts/${post.data.post.id}`,
        { isLike: true },
        { headers: { Authorization: `Bearer ${user1Token}` } }
      );
      await axios.post(
        `${API_URL}/engagements/posts/${post.data.post.id}`,
        { isLike: true },
        { headers: { Authorization: `Bearer ${user2Token}` } }
      );
    }
    console.log('✅ Created and engaged with 3 more posts');

    // 10. Get trending posts
    console.log('\n10. Fetching trending posts...');
    const trendingResponse = await axios.get(`${API_URL}/engagements/trending?period=24h&limit=5`);
    console.log('✅ Trending posts:', {
      count: trendingResponse.data.posts.length,
      topPost: {
        title: trendingResponse.data.posts[0]?.title,
        likes: trendingResponse.data.posts[0]?.likes,
        trendingScore: trendingResponse.data.posts[0]?.trending_score
      }
    });

    // 11. Test engagement on posts list
    console.log('\n11. Checking engagement in posts list...');
    const postsWithEngagementResponse = await axios.get(
      `${API_URL}/posts?limit=5`,
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    const postsWithEngagement = postsWithEngagementResponse.data.posts;
    console.log('✅ Posts with engagement data:', {
      count: postsWithEngagement.length,
      sample: postsWithEngagement.slice(0, 2).map(p => ({
        title: p.title.substring(0, 30) + '...',
        engagementStats: p.engagementStats,
        userEngagement: p.userEngagement
      }))
    });

    console.log('\n🎉 All engagement tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.error?.details) {
      console.error('Details:', error.response.data.error.details);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testEngagementSystem();
}

module.exports = testEngagementSystem;