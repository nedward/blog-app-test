# SentiBlog Deployment Guide

This guide covers deploying SentiBlog to various environments, from local development to production cloud platforms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Production Deployment](#production-deployment)
4. [Cloud Platform Guides](#cloud-platform-guides)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

- Docker and Docker Compose (v2.0+)
- Node.js 18+ and npm/yarn
- PostgreSQL 15+
- Redis 7+
- Domain name (for production)
- SSL certificate (for production)

## Local Development

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/blog-app-test.git
   cd blog-app-test
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Run migrations**
   ```bash
   docker-compose exec backend npm run migrate
   ```

4. **Access the application**
   - Frontend: http://localhost:3005
   - Backend API: http://localhost:3001
   - pgAdmin: http://localhost:5050

### Manual Setup

1. **Install PostgreSQL and Redis**
   ```bash
   # macOS
   brew install postgresql@15 redis
   brew services start postgresql@15
   brew services start redis

   # Ubuntu/Debian
   sudo apt-get install postgresql-15 redis-server
   sudo systemctl start postgresql redis
   ```

2. **Create database**
   ```bash
   createdb sentiblog_db
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials

   # Frontend
   cd ../frontend
   npm install
   cp .env.example .env.local
   ```

4. **Run migrations**
   ```bash
   cd backend
   npm run migrate
   ```

5. **Start services**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Production Deployment

### Docker Production Setup

1. **Create production docker-compose**
   ```yaml
   # docker-compose.prod.yml
   version: '3.8'

   services:
     backend:
       build:
         context: ./backend
         dockerfile: Dockerfile.prod
       environment:
         - NODE_ENV=production
         - DATABASE_URL=${DATABASE_URL}
         - JWT_SECRET=${JWT_SECRET}
         - REDIS_URL=${REDIS_URL}
       ports:
         - "3001:3001"
       depends_on:
         - postgres
         - redis

     frontend:
       build:
         context: ./frontend
         dockerfile: Dockerfile.prod
         args:
           - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
       ports:
         - "3000:3000"
       depends_on:
         - backend

     postgres:
       image: postgres:15-alpine
       environment:
         - POSTGRES_DB=sentiblog_db
         - POSTGRES_USER=${DB_USER}
         - POSTGRES_PASSWORD=${DB_PASSWORD}
       volumes:
         - postgres_data:/var/lib/postgresql/data

     redis:
       image: redis:7-alpine
       command: redis-server --requirepass ${REDIS_PASSWORD}
       volumes:
         - redis_data:/data

   volumes:
     postgres_data:
     redis_data:
   ```

2. **Build and deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/sentiblog
server {
    listen 80;
    server_name sentiblog.com www.sentiblog.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sentiblog.com www.sentiblog.com;

    ssl_certificate /etc/letsencrypt/live/sentiblog.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sentiblog.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Cloud Platform Guides

### AWS Deployment

1. **Using AWS ECS**
   ```bash
   # Build and push to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_URI
   docker build -t sentiblog-backend ./backend
   docker tag sentiblog-backend:latest $ECR_URI/sentiblog-backend:latest
   docker push $ECR_URI/sentiblog-backend:latest
   ```

2. **Task Definition**
   ```json
   {
     "family": "sentiblog",
     "taskRoleArn": "arn:aws:iam::123456789:role/ecsTaskRole",
     "executionRoleArn": "arn:aws:iam::123456789:role/ecsExecutionRole",
     "networkMode": "awsvpc",
     "containerDefinitions": [
       {
         "name": "backend",
         "image": "${ECR_URI}/sentiblog-backend:latest",
         "memory": 512,
         "cpu": 256,
         "essential": true,
         "portMappings": [{
           "containerPort": 3001,
           "protocol": "tcp"
         }],
         "environment": [
           {"name": "NODE_ENV", "value": "production"}
         ],
         "secrets": [
           {"name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:region:account:secret:db-url"},
           {"name": "JWT_SECRET", "valueFrom": "arn:aws:secretsmanager:region:account:secret:jwt-secret"}
         ]
       }
     ]
   }
   ```

### Heroku Deployment

1. **Create Heroku apps**
   ```bash
   heroku create sentiblog-backend
   heroku create sentiblog-frontend
   ```

2. **Add buildpacks and addons**
   ```bash
   # Backend
   heroku buildpacks:set heroku/nodejs -a sentiblog-backend
   heroku addons:create heroku-postgresql:hobby-dev -a sentiblog-backend
   heroku addons:create heroku-redis:hobby-dev -a sentiblog-backend

   # Frontend
   heroku buildpacks:set heroku/nodejs -a sentiblog-frontend
   ```

3. **Deploy**
   ```bash
   # Backend
   git subtree push --prefix backend heroku-backend main

   # Frontend
   git subtree push --prefix frontend heroku-frontend main
   ```

### Vercel Deployment (Frontend)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy frontend**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Configure environment variables in Vercel dashboard**

### DigitalOcean App Platform

1. **Create app.yaml**
   ```yaml
   name: sentiblog
   region: nyc
   services:
   - name: backend
     github:
       repo: yourusername/sentiblog
       branch: main
       deploy_on_push: true
     source_dir: backend
     environment_slug: node-js
     http_port: 3001
     instance_count: 1
     instance_size_slug: basic-xs
     envs:
     - key: NODE_ENV
       value: production
     - key: DATABASE_URL
       type: SECRET
   
   - name: frontend
     github:
       repo: yourusername/sentiblog
       branch: main
       deploy_on_push: true
     source_dir: frontend
     environment_slug: node-js
     http_port: 3000
     routes:
     - path: /
   
   databases:
   - name: sentiblog-db
     engine: PG
     version: "15"
     size: db-s-dev-database
   ```

## Environment Configuration

### Backend Environment Variables

```bash
# Application
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@host:5432/sentiblog_db
DB_SSL=true # For cloud databases

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Redis
REDIS_URL=redis://default:password@host:6379
REDIS_TLS=true # For cloud Redis

# CORS
FRONTEND_URL=https://sentiblog.com

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW=15 # minutes
RATE_LIMIT_MAX=100

# Email (optional)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@sentiblog.com
```

### Frontend Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.sentiblog.com/api/v1

# Analytics (optional)
NEXT_PUBLIC_GA_ID=GA-XXXXXXXXX
NEXT_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token

# Features
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## Database Setup

### Production Database Migration

1. **Backup existing data**
   ```bash
   pg_dump -h localhost -U sentiblog -d sentiblog_db > backup.sql
   ```

2. **Run migrations**
   ```bash
   NODE_ENV=production npm run migrate
   ```

3. **Verify migration**
   ```bash
   npm run migrate:status
   ```

### Database Optimization

```sql
-- Create indexes for performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_published_created ON posts(published, created_at DESC);
CREATE INDEX idx_posts_sentiment ON posts(sentiment);
CREATE INDEX idx_engagements_user_post ON engagements(user_id, post_id);

-- Analyze tables for query optimization
ANALYZE posts;
ANALYZE users;
ANALYZE engagements;
```

## Monitoring & Maintenance

### Health Checks

1. **Backend health endpoint**
   ```bash
   curl https://api.sentiblog.com/api/v1/health
   ```

2. **Database health**
   ```bash
   docker-compose exec postgres pg_isready
   ```

### Logging

1. **Application logs**
   ```bash
   # Docker logs
   docker-compose logs -f backend

   # PM2 logs
   pm2 logs sentiblog-backend
   ```

2. **Log aggregation setup**
   ```javascript
   // backend/src/utils/logger.js
   const winston = require('winston');
   const { Loggly } = require('winston-loggly-bulk');

   const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.Console(),
       new Loggly({
         token: process.env.LOGGLY_TOKEN,
         subdomain: process.env.LOGGLY_SUBDOMAIN,
         tags: ['sentiblog', process.env.NODE_ENV],
         json: true
       })
     ]
   });
   ```

### Monitoring Setup

1. **Uptime monitoring**
   - Use services like UptimeRobot, Pingdom, or Better Uptime
   - Monitor both frontend and API endpoints
   - Set up alerts for downtime

2. **Application Performance Monitoring (APM)**
   ```javascript
   // Using New Relic
   require('newrelic'); // At the top of app.js

   // Using Sentry
   const Sentry = require('@sentry/node');
   Sentry.init({ 
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV
   });
   ```

3. **Database monitoring**
   ```sql
   -- Monitor slow queries
   SELECT query, calls, mean_exec_time, max_exec_time
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

### Backup Strategy

1. **Automated daily backups**
   ```bash
   # backup.sh
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="/backups"
   
   # Database backup
   pg_dump $DATABASE_URL > $BACKUP_DIR/db_backup_$DATE.sql
   
   # Upload to S3
   aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql s3://sentiblog-backups/
   
   # Clean old backups (keep last 30 days)
   find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
   ```

2. **Setup cron job**
   ```bash
   # Run daily at 2 AM
   0 2 * * * /path/to/backup.sh
   ```

### Security Checklist

- [ ] SSL/TLS certificates configured
- [ ] Environment variables secured
- [ ] Database connections encrypted
- [ ] Regular security updates applied
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS protection headers
- [ ] CSRF tokens implemented

## Troubleshooting

### Common Deployment Issues

1. **Database connection errors**
   - Verify DATABASE_URL format
   - Check network security groups/firewalls
   - Ensure SSL mode matches database configuration

2. **CORS errors**
   - Verify FRONTEND_URL in backend environment
   - Check allowed origins configuration
   - Ensure credentials are included in requests

3. **Memory issues**
   - Monitor container memory usage
   - Increase container limits if needed
   - Optimize Node.js memory settings

4. **Build failures**
   - Clear Docker cache: `docker system prune -a`
   - Verify all environment variables are set
   - Check for missing dependencies

## Support

For deployment support:
- GitHub Issues: [github.com/yourusername/sentiblog/issues](https://github.com/yourusername/sentiblog/issues)
- Documentation: [docs.sentiblog.com](https://docs.sentiblog.com)
- Community Discord: [discord.gg/sentiblog](https://discord.gg/sentiblog)