const { body, param, validationResult } = require('express-validator');
const { Engagement, Post, sequelize } = require('../models');
const { handleValidationErrors } = require('../middleware/validation');

// Validation rules
const engagementValidation = [
  param('postId').isUUID().withMessage('Invalid post ID'),
  body('isLike').isBoolean().withMessage('isLike must be a boolean'),
  handleValidationErrors
];

// Toggle like/dislike on a post
const toggleEngagement = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { postId } = req.params;
    const { isLike } = req.body;
    const userId = req.user.id;

    // Check if post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      await transaction.rollback();
      return res.status(404).json({
        error: {
          message: 'Post not found',
          status: 404
        }
      });
    }

    // Check for existing engagement
    const existingEngagement = await Engagement.findOne({
      where: { userId, postId },
      transaction
    });

    let action;
    if (existingEngagement) {
      if (existingEngagement.isLike === isLike) {
        // Same engagement - remove it (toggle off)
        await existingEngagement.destroy({ transaction });
        action = 'removed';
      } else {
        // Different engagement - update it
        await existingEngagement.update({ isLike }, { transaction });
        action = 'updated';
      }
    } else {
      // No existing engagement - create new
      await Engagement.create({
        userId,
        postId,
        isLike
      }, { transaction });
      action = 'created';
    }

    await transaction.commit();

    // Get updated engagement stats
    const engagementStats = await Engagement.getPostEngagementStats(postId);
    const userEngagement = await Engagement.getUserEngagement(userId, postId);

    res.json({
      message: `Engagement ${action} successfully`,
      engagement: userEngagement,
      stats: engagementStats
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    console.error('Toggle engagement error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to toggle engagement',
        status: 500
      }
    });
  }
};

// Get engagement stats for a post
const getPostEngagementStats = async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Check if post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        error: {
          message: 'Post not found',
          status: 404
        }
      });
    }

    const stats = await Engagement.getPostEngagementStats(postId);
    const userEngagement = req.user ? 
      await Engagement.getUserEngagement(req.user.id, postId) : null;

    res.json({
      stats,
      userEngagement
    });
  } catch (error) {
    console.error('Get engagement stats error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch engagement stats',
        status: 500
      }
    });
  }
};

// Get user's engagements
const getUserEngagements = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId };
    if (type === 'likes') {
      where.isLike = true;
    } else if (type === 'dislikes') {
      where.isLike = false;
    }

    const { count, rows: engagements } = await Engagement.findAndCountAll({
      where,
      include: [{
        model: Post,
        attributes: ['id', 'title', 'slug', 'excerpt', 'createdAt']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      engagements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get user engagements error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch user engagements',
        status: 500
      }
    });
  }
};

// Get trending posts based on engagements
const getTrendingPosts = async (req, res) => {
  try {
    const { period = '24h', limit = 10 } = req.query;
    
    // Calculate time threshold
    let timeThreshold;
    switch (period) {
      case '1h':
        timeThreshold = new Date(Date.now() - 60 * 60 * 1000);
        break;
      case '24h':
        timeThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        timeThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    // Get trending posts with engagement metrics
    const trendingPosts = await sequelize.query(`
      SELECT 
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.created_at,
        p.view_count,
        u.id as author_id,
        u.username as author_username,
        u.avatar_url as author_avatar,
        sa.sentiment,
        sa.sentiment_score,
        COUNT(DISTINCT e.id) as total_engagements,
        COUNT(DISTINCT CASE WHEN e.is_like = true THEN e.id END) as likes,
        COUNT(DISTINCT CASE WHEN e.is_like = false THEN e.id END) as dislikes,
        COUNT(DISTINCT c.id) as comment_count,
        (COUNT(DISTINCT CASE WHEN e.is_like = true THEN e.id END) * 2 + 
         COUNT(DISTINCT c.id) + 
         p.view_count * 0.1) as trending_score
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN engagements e ON p.id = e.post_id AND e.created_at >= :timeThreshold
      LEFT JOIN comments c ON p.id = c.post_id AND c.created_at >= :timeThreshold
      LEFT JOIN sentiment_analyses sa ON p.id = sa.post_id
      WHERE p.published = true
      GROUP BY p.id, u.id, sa.sentiment, sa.sentiment_score
      ORDER BY trending_score DESC
      LIMIT :limit
    `, {
      replacements: { timeThreshold, limit: parseInt(limit) },
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      posts: trendingPosts,
      period,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Get trending posts error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch trending posts',
        status: 500
      }
    });
  }
};

module.exports = {
  toggleEngagement: [engagementValidation, toggleEngagement],
  getPostEngagementStats: [param('postId').isUUID(), handleValidationErrors, getPostEngagementStats],
  getUserEngagements,
  getTrendingPosts
};