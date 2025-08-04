# SentiBlog API Documentation

## Overview

The SentiBlog API is a RESTful API that powers the emotionally intelligent blog platform. It provides endpoints for user authentication, blog post management, sentiment analysis, and engagement tracking.

**Base URL**: `http://localhost:3001/api/v1`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Health Check

#### Check API Health
```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-08-04T19:53:02.901Z",
  "service": "SentiBlog API",
  "version": "1.0.0"
}
```

---

### Authentication

#### Register User
```
POST /auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "tokens": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

#### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "tokens": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

#### Refresh Token
```
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

#### Get Current User
```
GET /auth/me
```
**Requires Authentication**

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

#### Logout
```
POST /auth/logout
```
**Requires Authentication**

---

### Posts

#### List All Posts
```
GET /posts
```

**Query Parameters:**
- `limit` (number): Number of posts to return (default: 20)
- `offset` (number): Pagination offset (default: 0)
- `sentiment` (string): Filter by sentiment (positive, negative, neutral, mixed)
- `orderBy` (string): Sort order (createdAt, likes, views)

**Response:**
```json
{
  "posts": [
    {
      "id": "uuid",
      "title": "My First Post",
      "content": "This is the content...",
      "excerpt": "Brief excerpt...",
      "slug": "my-first-post",
      "sentiment": "positive",
      "sentiment_score": 0.85,
      "likes": 42,
      "dislikes": 3,
      "viewCount": 150,
      "published": true,
      "author": {
        "id": "uuid",
        "username": "johndoe"
      },
      "tags": [
        {"id": "uuid", "name": "technology"}
      ],
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

#### Get Post by ID or Slug
```
GET /posts/:id
```

**Response:**
```json
{
  "post": {
    "id": "uuid",
    "title": "My First Post",
    "content": "Full content of the post...",
    "excerpt": "Brief excerpt...",
    "slug": "my-first-post",
    "sentiment": "positive",
    "sentiment_score": 0.85,
    "likes": 42,
    "dislikes": 3,
    "viewCount": 150,
    "published": true,
    "author": {
      "id": "uuid",
      "username": "johndoe",
      "avatarUrl": "https://..."
    },
    "tags": [
      {"id": "uuid", "name": "technology"}
    ],
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

#### Create Post
```
POST /posts
```
**Requires Authentication**

**Request Body:**
```json
{
  "title": "My New Post",
  "content": "This is the content of my post...",
  "excerpt": "Optional brief description",
  "tags": ["technology", "ai"],
  "published": true
}
```

**Response:**
```json
{
  "message": "Post created successfully",
  "post": {
    "id": "uuid",
    "title": "My New Post",
    "slug": "my-new-post",
    "sentiment": "positive",
    "sentiment_score": 0.75
  }
}
```

#### Update Post
```
PUT /posts/:id
```
**Requires Authentication** (must be post author)

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "published": true
}
```

#### Delete Post
```
DELETE /posts/:id
```
**Requires Authentication** (must be post author)

#### Get User's Posts
```
GET /posts/user/:userId
```

---

### Sentiment Analysis

#### Get Sentiment Distribution
```
GET /sentiment/distribution
```

**Response:**
```json
{
  "distribution": {
    "positive": 145,
    "negative": 23,
    "neutral": 67,
    "mixed": 15
  },
  "total": 250
}
```

#### Get Trending Emotions
```
GET /sentiment/trending-emotions
```

**Response:**
```json
{
  "emotions": [
    {
      "emotion": "excitement",
      "count": 89,
      "trend": "up"
    },
    {
      "emotion": "frustration",
      "count": 34,
      "trend": "down"
    }
  ]
}
```

#### Get Post Sentiment Analysis
```
GET /sentiment/post/:postId
```

**Response:**
```json
{
  "postId": "uuid",
  "sentiment": "positive",
  "score": 0.85,
  "emotions": ["joy", "excitement"],
  "keywords": ["amazing", "innovative", "breakthrough"]
}
```

---

### Engagement

#### Toggle Like/Dislike
```
POST /engagements/posts/:postId
```
**Requires Authentication**

**Request Body:**
```json
{
  "isLike": true
}
```

**Response:**
```json
{
  "message": "Engagement recorded",
  "engagement": true,
  "stats": {
    "likes": 43,
    "dislikes": 3
  }
}
```

#### Get Post Engagement Stats
```
GET /engagements/posts/:postId
```

**Response:**
```json
{
  "postId": "uuid",
  "stats": {
    "likes": 43,
    "dislikes": 3,
    "total": 46
  },
  "userEngagement": true
}
```

#### Get User's Engagements
```
GET /engagements/user
```
**Requires Authentication**

**Response:**
```json
{
  "engagements": [
    {
      "postId": "uuid",
      "isLike": true,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Trending Posts
```
GET /engagements/trending
```

**Query Parameters:**
- `limit` (number): Number of posts (default: 10)
- `timeframe` (string): day, week, month (default: week)

---

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "message": "Error description",
    "status": 400,
    "code": "ERROR_CODE"
  }
}
```

### Common Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., email already exists)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Webhooks (Coming Soon)

Webhooks for real-time notifications about:
- New comments on your posts
- Engagement milestones
- Trending post notifications

## SDK Examples

### JavaScript/TypeScript
```javascript
import { SentiBlogAPI } from '@sentiblog/sdk';

const api = new SentiBlogAPI({
  baseURL: 'http://localhost:3001/api/v1',
  token: 'your-jwt-token'
});

// Create a post
const post = await api.posts.create({
  title: 'My Amazing Post',
  content: 'This is going to be incredible...',
  tags: ['technology', 'ai']
});

// Get sentiment analysis
const sentiment = await api.sentiment.analyze(post.id);
console.log(`Your post is ${sentiment.sentiment} (${sentiment.score})`);
```

### Python
```python
from sentiblog import SentiBlogClient

client = SentiBlogClient(
    base_url='http://localhost:3001/api/v1',
    token='your-jwt-token'
)

# Create a post
post = client.posts.create(
    title='My Amazing Post',
    content='This is going to be incredible...',
    tags=['technology', 'ai']
)

# Get sentiment analysis
sentiment = client.sentiment.analyze(post.id)
print(f"Your post is {sentiment.sentiment} ({sentiment.score})")
```

## Best Practices

1. **Authentication**: Always store tokens securely and refresh them before expiration
2. **Rate Limiting**: Implement exponential backoff for retries
3. **Error Handling**: Always handle error responses gracefully
4. **Pagination**: Use limit/offset for large datasets
5. **Caching**: Cache frequently accessed data like sentiment distributions

## Changelog

### v1.0.0 (Current)
- Initial release with core functionality
- User authentication with JWT
- Blog post CRUD operations
- Real-time sentiment analysis
- Like/dislike engagement system
- Basic trending algorithms

### Upcoming Features (v1.1.0)
- Comment system with nested replies
- Real-time notifications
- Advanced analytics dashboard
- Webhook support
- GraphQL API endpoint