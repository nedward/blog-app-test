const request = require('supertest');
const app = require('../app');
const { sequelize, User } = require('../models');
const jwt = require('jsonwebtoken');

describe('Posts Endpoints', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Create test user
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPass123!'
    });

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser.id, email: testUser.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/posts', () => {
    it('should create a new post when authenticated', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Post',
          content: '<p>This is a test post with amazing content!</p>',
          excerpt: 'Test excerpt',
          tags: ['test', 'amazing'],
          published: true
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('post');
      expect(res.body.post.title).toBe('Test Post');
      expect(res.body.post.sentiment).toBeDefined();
      expect(res.body.post.tags).toHaveLength(2);
    });

    it('should reject unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({
          title: 'Test Post',
          content: 'Test content',
          published: true
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/posts', () => {
    it('should return published posts', async () => {
      const res = await request(app)
        .get('/api/posts');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('posts');
      expect(Array.isArray(res.body.posts)).toBe(true);
      expect(res.body).toHaveProperty('pagination');
    });

    it('should filter by sentiment', async () => {
      const res = await request(app)
        .get('/api/posts?sentiment=positive');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('posts');
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update own post', async () => {
      // First create a post
      const createRes = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Original Title',
          content: 'Original content',
          published: true
        });

      const postId = createRes.body.post.id;

      // Update the post
      const res = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
          content: 'Updated content with wonderful changes!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.post.title).toBe('Updated Title');
      expect(res.body.post.sentiment).toBeDefined();
    });
  });

  describe('POST /api/posts/:id/like', () => {
    it('should like a post', async () => {
      // Create a post
      const createRes = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Post to Like',
          content: 'Great content',
          published: true
        });

      const postId = createRes.body.post.id;

      // Like the post
      const res = await request(app)
        .post(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.post.likes).toBe(1);
      expect(res.body.userEngagement).toBe('like');
    });
  });
});