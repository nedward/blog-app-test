# Blog App Backend Architecture

## System Overview

A scalable, microservices-based backend architecture designed to handle viral traffic spikes while maintaining real-time features and performance.

### Core Technology Stack
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL (primary), Redis (cache/sessions), ClickHouse (analytics)
- **Message Queue**: Apache Kafka
- **Cache**: Redis Cluster
- **Search**: Elasticsearch
- **API Gateway**: Kong or AWS API Gateway
- **Authentication**: JWT with refresh tokens
- **Real-time**: WebSocket with Socket.io
- **Containerization**: Docker + Kubernetes

## 1. Database Schema Design

### PostgreSQL Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    role user_role DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table with partitioning for scale
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(350) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image_url TEXT,
    status post_status DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Engagement metrics (denormalized for performance)
    view_count BIGINT DEFAULT 0,
    like_count BIGINT DEFAULT 0,
    dislike_count BIGINT DEFAULT 0,
    comment_count BIGINT DEFAULT 0,
    share_count BIGINT DEFAULT 0,
    
    -- SEO and content features
    meta_description TEXT,
    tags TEXT[],
    reading_time_minutes INTEGER,
    
    -- Moderation
    is_flagged BOOLEAN DEFAULT FALSE,
    moderation_status moderation_status DEFAULT 'pending'
) PARTITION BY RANGE (created_at);

-- Comments with nested structure support
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Engagement
    like_count BIGINT DEFAULT 0,
    dislike_count BIGINT DEFAULT 0,
    
    -- Moderation
    is_flagged BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Likes/Dislikes system (unified table for efficiency)
CREATE TABLE user_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type reaction_target_type NOT NULL, -- 'post' or 'comment'
    target_id UUID NOT NULL,
    reaction_type reaction_type NOT NULL, -- 'like' or 'dislike'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, target_type, target_id)
);

-- Sentiment analysis results
CREATE TABLE sentiment_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type sentiment_target_type NOT NULL, -- 'post' or 'comment'
    content_id UUID NOT NULL,
    sentiment_score DECIMAL(3,2) NOT NULL, -- -1.00 to 1.00
    sentiment_label sentiment_label NOT NULL, -- 'positive', 'negative', 'neutral'
    confidence_score DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
    emotions JSONB, -- detailed emotion breakdown
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(content_type, content_id)
);

-- User sessions for authentication
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_info JSONB,
    ip_address INET,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics and engagement tracking
CREATE TABLE user_engagement_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    event_type engagement_event_type NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Rate limiting tracking
CREATE TABLE rate_limit_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier VARCHAR(255) NOT NULL, -- IP or user_id
    endpoint VARCHAR(255) NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(identifier, endpoint, window_start)
);

-- Custom types
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived', 'deleted');
CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');
CREATE TYPE reaction_target_type AS ENUM ('post', 'comment');
CREATE TYPE reaction_type AS ENUM ('like', 'dislike');
CREATE TYPE sentiment_target_type AS ENUM ('post', 'comment');
CREATE TYPE sentiment_label AS ENUM ('positive', 'negative', 'neutral');
CREATE TYPE engagement_event_type AS ENUM ('view', 'like', 'dislike', 'comment', 'share', 'bookmark');
```

### Indexes for Performance

```sql
-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Post indexes
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_status_published_at ON posts(status, published_at DESC);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX idx_posts_engagement ON posts(like_count DESC, view_count DESC);

-- Comment indexes
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Reaction indexes
CREATE INDEX idx_reactions_user_target ON user_reactions(user_id, target_type, target_id);
CREATE INDEX idx_reactions_target ON user_reactions(target_type, target_id, reaction_type);

-- Engagement indexes
CREATE INDEX idx_engagement_user_id ON user_engagement_events(user_id);
CREATE INDEX idx_engagement_type_created ON user_engagement_events(event_type, created_at DESC);
```

## 2. API Architecture Decision: Hybrid REST + GraphQL

### REST API for Core Operations
- **Rationale**: Better caching, simpler scaling, established patterns
- **Use cases**: CRUD operations, authentication, file uploads

### GraphQL for Complex Queries
- **Rationale**: Efficient data fetching, real-time subscriptions
- **Use cases**: Feed generation, nested comments, dashboard analytics

### API Structure

```
/api/v1/
├── auth/
│   ├── POST /login
│   ├── POST /register
│   ├── POST /refresh
│   └── POST /logout
├── users/
│   ├── GET /users/:id
│   ├── PUT /users/:id
│   └── GET /users/:id/posts
├── posts/
│   ├── GET /posts (with pagination, filtering)
│   ├── POST /posts
│   ├── GET /posts/:id
│   ├── PUT /posts/:id
│   ├── DELETE /posts/:id
│   └── POST /posts/:id/reactions
├── comments/
│   ├── GET /posts/:postId/comments
│   ├── POST /posts/:postId/comments
│   ├── PUT /comments/:id
│   ├── DELETE /comments/:id
│   └── POST /comments/:id/reactions
└── analytics/
    ├── GET /posts/:id/analytics
    └── POST /events/track

/graphql
├── Queries: posts, comments, users, analytics
├── Mutations: createPost, updatePost, addComment
└── Subscriptions: postUpdated, newComment, realtimeAnalytics
```

## 3. Sentiment Analysis Service Integration

### Architecture Pattern: Event-Driven Microservice

```javascript
// Sentiment Analysis Service
class SentimentAnalysisService {
    constructor() {
        this.kafkaConsumer = new KafkaConsumer(['content-created', 'content-updated']);
        this.sentimentAPI = new OpenAISentimentAPI(); // or Hugging Face, AWS Comprehend
        this.cache = new Redis();
    }

    async processContentEvent(event) {
        const { contentType, contentId, text } = event;
        
        // Check cache first
        const cached = await this.cache.get(`sentiment:${contentType}:${contentId}`);
        if (cached) return JSON.parse(cached);

        // Analyze sentiment
        const analysis = await this.analyzeSentiment(text);
        
        // Store results
        await this.storeSentimentResults(contentType, contentId, analysis);
        
        // Cache results
        await this.cache.setex(`sentiment:${contentType}:${contentId}`, 3600, JSON.stringify(analysis));
        
        // Publish results
        await this.publishSentimentResults(contentType, contentId, analysis);
    }

    async analyzeSentiment(text) {
        return {
            score: -0.23, // -1 to 1
            label: 'negative',
            confidence: 0.87,
            emotions: {
                joy: 0.1,
                anger: 0.6,
                sadness: 0.2,
                fear: 0.05,
                surprise: 0.05
            }
        };
    }
}
```

### Integration Points
1. **Content Creation**: Async sentiment analysis triggered on post/comment creation
2. **Batch Processing**: Periodic re-analysis of older content
3. **Real-time Updates**: WebSocket notifications when sentiment analysis completes
4. **Moderation Integration**: Auto-flag highly negative content

## 4. Real-time Features Architecture

### WebSocket Architecture with Socket.io

```javascript
// Real-time Service
class RealtimeService {
    constructor() {
        this.io = require('socket.io')(server);
        this.redis = new Redis.Cluster([/* nodes */]);
        this.kafkaConsumer = new KafkaConsumer(['engagement-events', 'sentiment-results']);
    }

    setupEventHandlers() {
        // Post engagement updates
        this.kafkaConsumer.on('engagement-events', async (event) => {
            await this.broadcastEngagementUpdate(event);
        });

        // Sentiment analysis results
        this.kafkaConsumer.on('sentiment-results', async (event) => {
            await this.broadcastSentimentUpdate(event);
        });

        // Client connections
        this.io.on('connection', (socket) => {
            socket.on('subscribe-post', (postId) => {
                socket.join(`post:${postId}`);
            });

            socket.on('subscribe-user-feed', (userId) => {
                socket.join(`user:${userId}:feed`);
            });
        });
    }

    async broadcastEngagementUpdate(event) {
        const { postId, type, count } = event;
        this.io.to(`post:${postId}`).emit('engagement-update', {
            postId,
            type,
            count,
            timestamp: new Date()
        });
    }
}
```

### Real-time Features
1. **Live Like/Dislike Counts**: Instant updates without page refresh
2. **Real-time Comments**: New comments appear immediately
3. **Sentiment Indicators**: Visual sentiment changes as analysis completes
4. **User Activity**: Online status, typing indicators
5. **Trending Posts**: Real-time trending algorithm updates

## 5. Caching Strategy for Performance

### Multi-Layer Caching Architecture

```javascript
// Caching Strategy Implementation
class CacheManager {
    constructor() {
        this.redis = new Redis.Cluster([/* nodes */]);
        this.localCache = new NodeCache({ stdTTL: 300 }); // 5 min local cache
    }

    // Layer 1: Application-level caching
    async getWithLocalCache(key, fallback, ttl = 300) {
        let value = this.localCache.get(key);
        if (value) return value;

        value = await this.getWithRedisCache(key, fallback, ttl);
        this.localCache.set(key, value, ttl);
        return value;
    }

    // Layer 2: Redis distributed cache
    async getWithRedisCache(key, fallback, ttl = 3600) {
        let value = await this.redis.get(key);
        if (value) return JSON.parse(value);

        value = await fallback();
        await this.redis.setex(key, ttl, JSON.stringify(value));
        return value;
    }

    // Cache invalidation patterns
    async invalidatePostCache(postId) {
        const patterns = [
            `post:${postId}:*`,
            `posts:feed:*`,
            `posts:trending:*`,
            `user:${authorId}:posts:*`
        ];
        
        for (const pattern of patterns) {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        }
    }
}
```

### Caching Layers
1. **CDN**: Static assets, images (CloudFlare/AWS CloudFront)
2. **API Gateway**: Response caching for GET endpoints
3. **Redis Cluster**: 
   - Post content and metadata (1 hour TTL)
   - User sessions (24 hour TTL)
   - Engagement counts (5 minute TTL)
   - Feed data (15 minute TTL)
4. **Database Query Cache**: PostgreSQL query result caching
5. **Application Cache**: In-memory caching for frequently accessed data

### Cache Warming Strategy
```javascript
// Pre-load cache for viral content
class CacheWarmingService {
    async warmTrendingContent() {
        const trending = await this.getTrendingPosts();
        for (const post of trending) {
            await this.preloadPostData(post.id);
            await this.preloadComments(post.id);
            await this.preloadEngagementData(post.id);
        }
    }
}
```

## 6. Authentication & Authorization System

### JWT-based Authentication with Refresh Tokens

```javascript
// Authentication Service
class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET;
        this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
        this.redis = new Redis();
    }

    async generateTokenPair(userId) {
        const accessToken = jwt.sign(
            { userId, type: 'access' },
            this.jwtSecret,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId, type: 'refresh' },
            this.refreshTokenSecret,
            { expiresIn: '7d' }
        );

        // Store refresh token hash in database
        await this.storeRefreshToken(userId, refreshToken);
        
        return { accessToken, refreshToken };
    }

    async validateToken(token) {
        try {
            const decoded = jwt.verify(token, this.jwtSecret);
            
            // Check if token is blacklisted
            const blacklisted = await this.redis.get(`blacklist:${token}`);
            if (blacklisted) throw new Error('Token blacklisted');
            
            return decoded;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}
```

### Role-Based Access Control (RBAC)

```javascript
// Authorization Middleware
class AuthorizationMiddleware {
    static requireRole(roles) {
        return async (req, res, next) => {
            const user = req.user;
            if (!roles.includes(user.role)) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
            next();
        };
    }

    static requireOwnership(resourceType) {
        return async (req, res, next) => {
            const resourceId = req.params.id;
            const userId = req.user.id;
            
            const isOwner = await this.checkOwnership(resourceType, resourceId, userId);
            if (!isOwner && !['admin', 'moderator'].includes(req.user.role)) {
                return res.status(403).json({ error: 'Access denied' });
            }
            next();
        };
    }
}
```

### Security Features
1. **Password Security**: bcrypt hashing with salt rounds
2. **Session Management**: Redis-based session storage
3. **Token Blacklisting**: Immediate token invalidation
4. **Device Tracking**: Multi-device session management
5. **Suspicious Activity Detection**: Login pattern analysis

## 7. Rate Limiting & Spam Prevention

### Multi-Level Rate Limiting

```javascript
// Rate Limiting Service
class RateLimitingService {
    constructor() {
        this.redis = new Redis();
        this.limits = {
            'POST:/api/v1/posts': { requests: 5, window: 3600 }, // 5 posts per hour
            'POST:/api/v1/comments': { requests: 30, window: 3600 }, // 30 comments per hour
            'POST:/api/v1/reactions': { requests: 100, window: 3600 }, // 100 reactions per hour
            'GET:/api/v1/posts': { requests: 1000, window: 3600 } // 1000 reads per hour
        };
    }

    async checkRateLimit(identifier, endpoint) {
        const key = `rate_limit:${identifier}:${endpoint}`;
        const limit = this.limits[endpoint];
        
        if (!limit) return { allowed: true };

        const current = await this.redis.incr(key);
        
        if (current === 1) {
            await this.redis.expire(key, limit.window);
        }

        const allowed = current <= limit.requests;
        const resetTime = await this.redis.ttl(key);

        return {
            allowed,
            current,
            limit: limit.requests,
            resetTime
        };
    }
}
```

### Spam Prevention Strategies

```javascript
// Spam Detection Service
class SpamDetectionService {
    constructor() {
        this.ml_model = new SpamClassifier();
        this.redis = new Redis();
    }

    async analyzeContent(content, userId) {
        const features = {
            textLength: content.length,
            capsRatio: this.calculateCapsRatio(content),
            linkCount: this.countLinks(content),
            repeatWords: this.calculateRepeatWords(content),
            userAge: await this.getUserAge(userId),
            userReputation: await this.getUserReputation(userId)
        };

        const spamProbability = await this.ml_model.predict(features);
        
        return {
            isSpam: spamProbability > 0.7,
            confidence: spamProbability,
            flags: this.generateFlags(features)
        };
    }

    async handleSpamDetection(contentId, analysis) {
        if (analysis.isSpam) {
            await this.flagContent(contentId);
            await this.notifyModerators(contentId, analysis);
            
            if (analysis.confidence > 0.9) {
                await this.autoHideContent(contentId);
            }
        }
    }
}
```

### Anti-Spam Features
1. **Content Analysis**: ML-based spam detection
2. **User Reputation**: Behavior-based user scoring
3. **Shadow Banning**: Gradual content visibility reduction
4. **CAPTCHA**: Challenge-response for suspicious activity
5. **IP Reputation**: Blacklist/whitelist management
6. **Honeypot Fields**: Hidden form fields to catch bots

## 8. Handling Viral Traffic Spikes

### Auto-Scaling Architecture

```javascript
// Traffic Spike Handler
class TrafficSpikeHandler {
    constructor() {
        this.metrics = new PrometheusMetrics();
        this.alerting = new AlertManager();
        this.scaler = new KubernetesAutoscaler();
    }

    async monitorTrafficPatterns() {
        const metrics = await this.metrics.getMetrics([
            'http_requests_per_second',
            'database_connections',
            'redis_memory_usage',
            'response_time_95th'
        ]);

        if (this.detectSpike(metrics)) {
            await this.handleTrafficSpike(metrics);
        }
    }

    async handleTrafficSpike(metrics) {
        // 1. Immediate response
        await this.enableReadReplicas();
        await this.increaseCacheTTL();
        await this.activateCircuitBreakers();

        // 2. Scale infrastructure
        await this.scaler.scaleUp('blog-api', { replicas: 10 });
        await this.scaler.scaleUp('redis-cluster', { replicas: 6 });

        // 3. Enable emergency mode
        await this.enableEmergencyMode();
    }

    async enableEmergencyMode() {
        // Reduce feature complexity during high load
        await this.redis.set('emergency_mode', 'true', 'EX', 3600);
        
        // Disable expensive operations
        await this.disableRealTimeSentiment();
        await this.increaseCommentPagination();
        await this.simplifyFeedAlgorithm();
    }
}
```

### Database Scaling Strategy

```sql
-- Read replica configuration
-- Master handles: writes, complex queries
-- Replicas handle: reads, analytics, search

-- Connection pooling configuration
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Partitioning strategy for large tables
CREATE TABLE posts_2024_01 PARTITION OF posts 
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE posts_2024_02 PARTITION OF posts 
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

### Circuit Breaker Pattern

```javascript
// Circuit Breaker for External Services
class CircuitBreaker {
    constructor(service, options = {}) {
        this.service = service;
        this.failureThreshold = options.failureThreshold || 5;
        this.recoveryTimeout = options.recoveryTimeout || 30000;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.failureCount = 0;
        this.nextAttempt = Date.now();
    }

    async execute(operation, fallback) {
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttempt) {
                return fallback ? fallback() : this.getFallbackResponse();
            }
            this.state = 'HALF_OPEN';
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            return fallback ? fallback() : this.getFallbackResponse();
        }
    }

    onSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }

    onFailure() {
        this.failureCount++;
        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.recoveryTimeout;
        }
    }
}
```

### Performance Monitoring

```javascript
// Performance Monitoring Service
class PerformanceMonitor {
    constructor() {
        this.prometheus = new PrometheusRegistry();
        this.setupMetrics();
    }

    setupMetrics() {
        this.httpRequestDuration = new Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code']
        });

        this.databaseQueryDuration = new Histogram({
            name: 'database_query_duration_seconds',
            help: 'Duration of database queries',
            labelNames: ['query_type', 'table']
        });

        this.activeConnections = new Gauge({
            name: 'active_connections',
            help: 'Number of active connections',
            labelNames: ['type']
        });
    }

    middleware() {
        return (req, res, next) => {
            const start = Date.now();
            
            res.on('finish', () => {
                const duration = (Date.now() - start) / 1000;
                this.httpRequestDuration
                    .labels(req.method, req.route?.path || req.path, res.statusCode)
                    .observe(duration);
            });
            
            next();
        };
    }
}
```

## Deployment Architecture

### Container Orchestration with Kubernetes

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blog-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: blog-api
  template:
    metadata:
      labels:
        app: blog-api
    spec:
      containers:
      - name: blog-api
        image: blog-app/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: blog-api-service
spec:
  selector:
    app: blog-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: blog-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: blog-api
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Summary

This architecture provides:

1. **Scalability**: Horizontal scaling with Kubernetes, database read replicas, Redis clustering
2. **Performance**: Multi-layer caching, efficient database indexing, CDN integration
3. **Real-time Features**: WebSocket connections with Redis pub/sub for scaling
4. **Reliability**: Circuit breakers, health checks, graceful degradation
5. **Security**: JWT authentication, RBAC, rate limiting, spam detection
6. **Observability**: Comprehensive monitoring, logging, and alerting
7. **Viral Traffic Handling**: Auto-scaling, emergency modes, performance optimization

The system can handle viral traffic spikes through auto-scaling, caching strategies, and graceful degradation while maintaining real-time features and data consistency.

Key files in this architecture:
- `/Users/edwardharris/repos/github/nedward/blog-app-test/backend-architecture.md` - Complete architecture specification