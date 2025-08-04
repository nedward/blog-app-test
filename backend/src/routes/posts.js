const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Public routes (with optional auth for engagement data)
router.get('/', optionalAuth, postController.getPosts);
router.get('/:identifier', optionalAuth, postController.getPost);

// Protected routes
router.post('/', authenticate, postController.createPost);
router.put('/:id', authenticate, postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);

// User posts
router.get('/user/:userId', optionalAuth, postController.getUserPosts);

module.exports = router;