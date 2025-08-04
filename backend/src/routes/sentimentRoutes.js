const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getSentimentDistribution, getTrendingEmotions } = require('../services/sentimentAnalysisService');
const { Post, SentimentAnalysis } = require('../models');

// Get sentiment distribution for user's posts
router.get('/distribution', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's posts
    const posts = await Post.findAll({
      where: { userId },
      attributes: ['id']
    });
    
    const postIds = posts.map(p => p.id);
    const distribution = await getSentimentDistribution(postIds);
    
    res.json({
      distribution,
      totalPosts: postIds.length
    });
  } catch (error) {
    console.error('Get sentiment distribution error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch sentiment distribution',
        status: 500
      }
    });
  }
});

// Get trending emotions across all posts
router.get('/trending-emotions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 7;
    const trendingEmotions = await getTrendingEmotions(limit);
    
    res.json({
      emotions: trendingEmotions
    });
  } catch (error) {
    console.error('Get trending emotions error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch trending emotions',
        status: 500
      }
    });
  }
});

// Get sentiment analysis for a specific post
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    
    const sentiment = await SentimentAnalysis.findOne({
      where: { postId }
    });
    
    if (!sentiment) {
      return res.status(404).json({
        error: {
          message: 'Sentiment analysis not found for this post',
          status: 404
        }
      });
    }
    
    res.json({
      sentiment
    });
  } catch (error) {
    console.error('Get post sentiment error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch post sentiment',
        status: 500
      }
    });
  }
});

module.exports = router;