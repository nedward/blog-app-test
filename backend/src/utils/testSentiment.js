const axios = require('axios');

const API_URL = 'http://localhost:3001/api/v1';

// Test data
const testUser = {
  username: 'sentimenttest',
  email: 'sentimenttest@example.com',
  password: 'TestPassword123'
};

const happyPost = {
  title: 'Amazing Day at the Beach!',
  content: 'I had such a wonderful time at the beach today! The weather was perfect, the water was warm, and I saw the most beautiful sunset. I love summer days like this - they make me feel so happy and grateful for life. Everything was absolutely fantastic!',
  published: true,
  tags: ['travel', 'happiness', 'summer']
};

const sadPost = {
  title: 'Feeling Down Today',
  content: 'Today has been really tough. Everything seems to be going wrong, and I feel so frustrated and sad. The weather is terrible, work is stressful, and I just feel awful. I hate days like this when nothing goes right. It\'s just horrible.',
  published: true,
  tags: ['personal', 'feelings']
};

const neutralPost = {
  title: 'Technical Documentation Update',
  content: 'This is a standard update to our technical documentation. The API endpoints have been documented and the database schema has been updated. Please review the changes and provide feedback if needed.',
  published: true,
  tags: ['technical', 'documentation']
};

async function testSentimentAnalysis() {
  let accessToken, happyPostId, sadPostId, neutralPostId;

  try {
    console.log('🧪 Testing Sentiment Analysis Integration...\n');

    // 1. Setup authentication
    console.log('1. Setting up authentication...');
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
      accessToken = registerResponse.data.accessToken;
      console.log('✅ New user registered');
    } catch (error) {
      if (error.response?.status === 409) {
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        accessToken = loginResponse.data.accessToken;
        console.log('✅ Existing user logged in');
      } else {
        throw error;
      }
    }

    // 2. Create posts with different sentiments
    console.log('\n2. Creating posts with different sentiments...');
    
    // Happy post
    const happyResponse = await axios.post(
      `${API_URL}/posts`,
      happyPost,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    happyPostId = happyResponse.data.post.id;
    console.log('✅ Happy post created:', {
      title: happyResponse.data.post.title,
      sentiment: happyResponse.data.post.sentimentAnalysis?.sentiment,
      score: happyResponse.data.post.sentimentAnalysis?.sentimentScore
    });

    // Sad post
    const sadResponse = await axios.post(
      `${API_URL}/posts`,
      sadPost,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    sadPostId = sadResponse.data.post.id;
    console.log('✅ Sad post created:', {
      title: sadResponse.data.post.title,
      sentiment: sadResponse.data.post.sentimentAnalysis?.sentiment,
      score: sadResponse.data.post.sentimentAnalysis?.sentimentScore
    });

    // Neutral post
    const neutralResponse = await axios.post(
      `${API_URL}/posts`,
      neutralPost,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    neutralPostId = neutralResponse.data.post.id;
    console.log('✅ Neutral post created:', {
      title: neutralResponse.data.post.title,
      sentiment: neutralResponse.data.post.sentimentAnalysis?.sentiment,
      score: neutralResponse.data.post.sentimentAnalysis?.sentimentScore
    });

    // 3. Get sentiment distribution
    console.log('\n3. Fetching sentiment distribution...');
    const distributionResponse = await axios.get(
      `${API_URL}/sentiment/distribution`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    console.log('✅ Sentiment distribution:', distributionResponse.data);

    // 4. Get trending emotions
    console.log('\n4. Fetching trending emotions...');
    const emotionsResponse = await axios.get(`${API_URL}/sentiment/trending-emotions`);
    console.log('✅ Trending emotions:', emotionsResponse.data.emotions.slice(0, 3));

    // 5. Get individual post sentiment
    console.log('\n5. Fetching individual post sentiments...');
    
    const happySentiment = await axios.get(`${API_URL}/sentiment/post/${happyPostId}`);
    console.log('✅ Happy post sentiment:', {
      sentiment: happySentiment.data.sentiment.sentiment,
      score: happySentiment.data.sentiment.sentimentScore,
      keywords: happySentiment.data.sentiment.keywords
    });

    // 6. Update post and check sentiment update
    console.log('\n6. Updating post content and checking sentiment change...');
    await axios.put(
      `${API_URL}/posts/${neutralPostId}`,
      {
        content: 'I am absolutely thrilled about this update! Everything is working perfectly and I couldn\'t be happier with the results. This is amazing news for everyone!'
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    const updatedPost = await axios.get(`${API_URL}/posts/${neutralPostId}`);
    console.log('✅ Updated post sentiment:', {
      oldSentiment: 'neutral',
      newSentiment: updatedPost.data.post.sentimentAnalysis?.sentiment,
      newScore: updatedPost.data.post.sentimentAnalysis?.sentimentScore
    });

    // 7. Test sentiment on posts list
    console.log('\n7. Checking sentiment in posts list...');
    const postsResponse = await axios.get(`${API_URL}/posts?limit=10`);
    const postsWithSentiment = postsResponse.data.posts.filter(p => p.sentimentAnalysis);
    console.log('✅ Posts with sentiment analysis:', {
      total: postsResponse.data.posts.length,
      withSentiment: postsWithSentiment.length,
      sentiments: postsWithSentiment.map(p => ({
        title: p.title.substring(0, 30) + '...',
        sentiment: p.sentimentAnalysis?.sentiment
      }))
    });

    console.log('\n🎉 All sentiment analysis tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.error?.details) {
      console.error('Details:', error.response.data.error.details);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testSentimentAnalysis();
}

module.exports = testSentimentAnalysis;