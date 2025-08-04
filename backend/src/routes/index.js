const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');

// Mount routes
router.use('/auth', authRoutes);

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
      posts: 'Coming soon...',
      sentiment: 'Coming soon...',
      engagement: 'Coming soon...'
    }
  });
});

module.exports = router;