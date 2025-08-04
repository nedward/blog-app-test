const { body, param, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Post, User, Tag, SentimentAnalysis, Engagement, Comment, sequelize } = require('../models');
const { handleValidationErrors } = require('../middleware/validation');
const { analyzePostSentiment } = require('../services/sentimentAnalysisService');

// Validation rules
const createPostValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Excerpt must be less than 500 characters'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  body('published')
    .optional()
    .isBoolean().withMessage('Published must be a boolean'),
  handleValidationErrors
];

const updatePostValidation = [
  param('id').isUUID().withMessage('Invalid post ID'),
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
  body('content')
    .optional()
    .trim()
    .notEmpty().withMessage('Content cannot be empty'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Excerpt must be less than 500 characters'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  body('published')
    .optional()
    .isBoolean().withMessage('Published must be a boolean'),
  handleValidationErrors
];

// Create a new post
const createPost = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { title, content, excerpt, tags, published } = req.body;
    const userId = req.user.id;

    // Generate slug if not provided
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Date.now();

    // Create the post
    const post = await Post.create({
      userId,
      title,
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      slug,
      published: published || false
    }, { transaction });

    // Handle tags if provided
    const tagInstances = [];
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const slug = tagName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        const [tag] = await Tag.findOrCreate({
          where: { slug },
          defaults: { name: tagName, slug },
          transaction
        });
        tagInstances.push(tag);
        
        // Manually insert into junction table to avoid timestamp issue
        await sequelize.query(
          'INSERT INTO post_tags (post_id, tag_id) VALUES (:postId, :tagId) ON CONFLICT DO NOTHING',
          {
            replacements: { postId: post.id, tagId: tag.id },
            type: sequelize.QueryTypes.INSERT,
            transaction
          }
        );
      }
    }

    await transaction.commit();

    // Analyze sentiment after successful creation
    try {
      await analyzePostSentiment(post.id, title, content);
    } catch (sentimentError) {
      console.error('Sentiment analysis failed:', sentimentError);
      // Continue without sentiment analysis
    }

    // Fetch the complete post with associations
    const completePost = await Post.findByPk(post.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'avatarUrl'] },
        { model: SentimentAnalysis, as: 'sentimentAnalysis' }
      ]
    });
    
    // Add tags separately to avoid timestamp issue
    if (tags && tags.length > 0) {
      completePost.dataValues.tags = tagInstances.map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug
      }));
    }

    res.status(201).json({
      message: 'Post created successfully',
      post: completePost
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    console.error('Create post error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create post',
        status: 500
      }
    });
  }
};

// Get all posts with pagination and filters
const getPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      published = 'true',
      search,
      tags,
      sortBy = 'createdAt',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Filter by published status (only for non-authenticated users)
    if (!req.user || req.user.role !== 'admin') {
      where.published = published === 'true';
    }

    // Search in title and content
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Build query options
    const queryOptions = {
      where,
      include: [
        { 
          model: User, 
          as: 'author', 
          attributes: ['id', 'username', 'avatarUrl'] 
        },
        // Temporarily disable tags inclusion due to junction table issue
        // { 
        //   model: Tag, 
        //   as: 'tags', 
        //   attributes: ['id', 'name', 'slug'],
        //   ...(tags && {
        //     where: { name: { [Op.in]: Array.isArray(tags) ? tags : [tags] } }
        //   })
        // },
        {
          model: SentimentAnalysis,
          as: 'sentimentAnalysis',
          attributes: ['sentiment', 'sentimentScore']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, order.toUpperCase()]],
      distinct: true
    };

    const { count, rows: posts } = await Post.findAndCountAll(queryOptions);

    // Add engagement stats for each post
    const postsWithStats = await Promise.all(
      posts.map(async (post) => {
        const stats = await Engagement.getPostEngagementStats(post.id);
        return {
          ...post.toJSON(),
          engagementStats: stats,
          userEngagement: req.user ? 
            await Engagement.getUserEngagement(req.user.id, post.id) : null
        };
      })
    );

    res.json({
      posts: postsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch posts',
        status: 500
      }
    });
  }
};

// Get a single post by ID or slug
const getPost = async (req, res) => {
  try {
    const { identifier } = req.params;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    const post = await Post.findOne({
      where: isUUID ? { id: identifier } : { slug: identifier },
      include: [
        { 
          model: User, 
          as: 'author', 
          attributes: ['id', 'username', 'avatarUrl', 'bio'] 
        },
        // Temporarily disable tags inclusion
        // { 
        //   model: Tag, 
        //   as: 'tags', 
        //   attributes: ['id', 'name', 'slug'] 
        // },
        {
          model: SentimentAnalysis,
          as: 'sentimentAnalysis'
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        error: {
          message: 'Post not found',
          status: 404
        }
      });
    }

    // Check if user can view unpublished posts
    if (!post.published && (!req.user || (req.user.id !== post.userId && req.user.role !== 'admin'))) {
      return res.status(404).json({
        error: {
          message: 'Post not found',
          status: 404
        }
      });
    }

    // Increment view count
    await post.incrementViewCount();

    // Get engagement stats
    const engagementStats = await Engagement.getPostEngagementStats(post.id);
    const userEngagement = req.user ? 
      await Engagement.getUserEngagement(req.user.id, post.id) : null;

    // Get comment count
    const commentCount = await Comment.count({ where: { postId: post.id } });

    res.json({
      post: {
        ...post.toJSON(),
        engagementStats,
        userEngagement,
        commentCount
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch post',
        status: 500
      }
    });
  }
};

// Update a post
const updatePost = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const updates = req.body;

    const post = await Post.findByPk(id);

    if (!post) {
      await transaction.rollback();
      return res.status(404).json({
        error: {
          message: 'Post not found',
          status: 404
        }
      });
    }

    // Check ownership
    if (post.userId !== req.user.id && req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({
        error: {
          message: 'You do not have permission to update this post',
          status: 403
        }
      });
    }

    // Update the post
    await post.update(updates, { transaction });

    // Update tags if provided
    if (updates.tags !== undefined) {
      // First, remove existing tags
      await sequelize.query(
        'DELETE FROM post_tags WHERE post_id = :postId',
        {
          replacements: { postId: post.id },
          type: sequelize.QueryTypes.DELETE,
          transaction
        }
      );

      // Then add new tags
      for (const tagName of updates.tags) {
        const slug = tagName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        const [tag] = await Tag.findOrCreate({
          where: { slug },
          defaults: { name: tagName, slug },
          transaction
        });
        
        // Manually insert into junction table to avoid timestamp issue
        await sequelize.query(
          'INSERT INTO post_tags (post_id, tag_id) VALUES (:postId, :tagId) ON CONFLICT DO NOTHING',
          {
            replacements: { postId: post.id, tagId: tag.id },
            type: sequelize.QueryTypes.INSERT,
            transaction
          }
        );
      }
    }

    await transaction.commit();

    // Re-analyze sentiment if title or content was updated
    if (updates.title || updates.content) {
      try {
        const currentPost = await Post.findByPk(post.id);
        await analyzePostSentiment(post.id, currentPost.title, currentPost.content);
      } catch (sentimentError) {
        console.error('Sentiment analysis failed:', sentimentError);
        // Continue without sentiment analysis
      }
    }

    // Fetch updated post with associations
    const updatedPost = await Post.findByPk(post.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'avatarUrl'] },
        { model: SentimentAnalysis, as: 'sentimentAnalysis' }
      ]
    });
    
    // Add tags manually to avoid timestamp issue
    if (updates.tags !== undefined) {
      const tags = await sequelize.query(
        `SELECT t.id, t.name, t.slug 
         FROM tags t 
         JOIN post_tags pt ON t.id = pt.tag_id 
         WHERE pt.post_id = :postId`,
        {
          replacements: { postId: post.id },
          type: sequelize.QueryTypes.SELECT
        }
      );
      updatedPost.dataValues.tags = tags;
    }

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    console.error('Update post error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update post',
        status: 500
      }
    });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({
        error: {
          message: 'Post not found',
          status: 404
        }
      });
    }

    // Check ownership
    if (post.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: {
          message: 'You do not have permission to delete this post',
          status: 403
        }
      });
    }

    await post.destroy();

    res.json({
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to delete post',
        status: 500
      }
    });
  }
};

// Get user's posts
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Check if requesting own posts or is admin
    const isOwnPosts = req.user && req.user.id === userId;
    const isAdmin = req.user && req.user.role === 'admin';

    const where = {
      userId,
      ...((!isOwnPosts && !isAdmin) && { published: true })
    };

    const { count, rows: posts } = await Post.findAndCountAll({
      where,
      include: [
        // Temporarily disable tags inclusion
        // { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'] },
        { model: SentimentAnalysis, as: 'sentimentAnalysis' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch user posts',
        status: 500
      }
    });
  }
};

module.exports = {
  createPost: [createPostValidation, createPost],
  getPosts,
  getPost,
  updatePost: [updatePostValidation, updatePost],
  deletePost: [param('id').isUUID(), handleValidationErrors, deletePost],
  getUserPosts
};