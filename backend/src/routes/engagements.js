const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  toggleEngagement,
  getPostEngagementStats,
  getUserEngagements,
  getTrendingPosts
} = require('../controllers/engagementController');

// Toggle like/dislike on a post
router.post('/posts/:postId', authenticate, toggleEngagement);

// Get engagement stats for a post
router.get('/posts/:postId', optionalAuth, getPostEngagementStats);

// Get user's engagements
router.get('/user', authenticate, getUserEngagements);

// Get trending posts
router.get('/trending', getTrendingPosts);

module.exports = router;