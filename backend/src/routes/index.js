const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const postRoutes = require('./posts');
const sentimentRoutes = require('./sentimentRoutes');
const engagementRoutes = require('./engagements');

// Mount routes
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/sentiment', sentimentRoutes);
router.use('/engagements', engagementRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SentiBlog API',
    version: '1.0.0'
  });
});

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'SentiBlog API v1',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        refresh: 'POST /api/v1/auth/refresh',
        me: 'GET /api/v1/auth/me',
        logout: 'POST /api/v1/auth/logout'
      },
      posts: {
        list: 'GET /api/v1/posts',
        create: 'POST /api/v1/posts',
        get: 'GET /api/v1/posts/:id',
        update: 'PUT /api/v1/posts/:id',
        delete: 'DELETE /api/v1/posts/:id',
        userPosts: 'GET /api/v1/posts/user/:userId'
      },
      sentiment: {
        distribution: 'GET /api/v1/sentiment/distribution',
        trendingEmotions: 'GET /api/v1/sentiment/trending-emotions',
        postSentiment: 'GET /api/v1/sentiment/post/:postId'
      },
      engagement: {
        toggle: 'POST /api/v1/engagements/posts/:postId',
        stats: 'GET /api/v1/engagements/posts/:postId',
        userEngagements: 'GET /api/v1/engagements/user',
        trending: 'GET /api/v1/engagements/trending'
      }
    }
  });
});

module.exports = router;