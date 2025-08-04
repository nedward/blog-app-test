# SentiBlog Deployment Guide

## 🚀 Quick Start

This guide will help you deploy SentiBlog to production using Docker Compose.

## Prerequisites

- Docker and Docker Compose installed on your server
- A domain name (optional, but recommended)
- SSL certificates (optional, for HTTPS)
- At least 2GB RAM and 20GB storage

## 1. Server Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 1.3 Create deployment user (optional but recommended)
```bash
sudo useradd -m -s /bin/bash sentiblog
sudo usermod -aG docker sentiblog
sudo su - sentiblog
```

## 2. Application Setup

### 2.1 Clone the repository
```bash
git clone https://github.com/yourusername/sentiblog.git
cd sentiblog
```

### 2.2 Configure environment variables
```bash
# Copy the example file
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

**Important environment variables to set:**

```env
# Database - Use strong passwords!
DB_USER=sentiblog
DB_PASSWORD=your_very_secure_password_here
DB_NAME=sentiblog_production

# Redis
REDIS_PASSWORD=your_redis_password_here

# JWT Secrets - Generate with: openssl rand -hex 64
JWT_SECRET=<generate-64-char-hex>
JWT_REFRESH_SECRET=<generate-different-64-char-hex>

# Your domain
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
```

### 2.3 Initialize the database
```bash
# Start only the database service
docker-compose -f docker-compose.prod.yml up -d postgres

# Wait for it to be ready (about 10 seconds)
sleep 10

# Run database initialization
docker-compose -f docker-compose.prod.yml exec postgres psql -U sentiblog -d sentiblog_production -f /docker-entrypoint-initdb.d/init.sql
```

## 3. Build and Deploy

### 3.1 Build the services
```bash
docker-compose -f docker-compose.prod.yml build
```

### 3.2 Start all services
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3.3 Verify services are running
```bash
docker-compose -f docker-compose.prod.yml ps

# Check logs if needed
docker-compose -f docker-compose.prod.yml logs -f
```

## 4. SSL/HTTPS Setup (Recommended)

### 4.1 Using Let's Encrypt with Certbot
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
```

### 4.2 Update Nginx configuration
Uncomment the HTTPS section in `nginx/nginx.prod.conf` and update with your domain.

## 5. Monitoring and Maintenance

### 5.1 View logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### 5.2 Backup database
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U sentiblog sentiblog_production > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U sentiblog sentiblog_production < backup_20240104_120000.sql
```

### 5.3 Update application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### 5.4 Scale services
```bash
# Scale backend instances
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## 6. Performance Optimization

### 6.1 Enable Redis caching
Redis is already configured in the production setup. The application will automatically use it for:
- Session storage
- API response caching
- Real-time event queuing

### 6.2 Database optimization
```sql
-- Run these in the postgres container
-- Create indexes for better performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_sentiment ON posts(sentiment);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_engagements_user_post ON engagements(user_id, post_id);
```

### 6.3 CDN Setup (Optional)
For better performance, consider using a CDN like Cloudflare:
1. Add your domain to Cloudflare
2. Update DNS settings
3. Enable caching and optimization features

## 7. Troubleshooting

### Common Issues

**1. Container won't start**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs [service-name]

# Check if ports are in use
sudo netstat -tlnp | grep -E ':(80|443|3000|3001|5432|6379)'
```

**2. Database connection issues**
```bash
# Test database connection
docker-compose -f docker-compose.prod.yml exec backend npm run test:db

# Reset database
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

**3. Frontend can't reach backend**
- Check NEXT_PUBLIC_API_URL is set correctly
- Verify Nginx is routing correctly
- Check CORS settings

### Health Checks
```bash
# Backend health
curl http://localhost/health

# Frontend health
curl http://localhost

# Full system check
./scripts/health-check.sh
```

## 8. Security Checklist

- [ ] Strong passwords for database and Redis
- [ ] SSL/HTTPS enabled
- [ ] Firewall configured (only ports 80, 443 open)
- [ ] Regular security updates
- [ ] Backup strategy in place
- [ ] Monitor logs for suspicious activity
- [ ] Rate limiting enabled (configured in Nginx)

## 9. Deployment Checklist

Before going live:
- [ ] Environment variables configured
- [ ] Database initialized and tested
- [ ] SSL certificates installed
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Test all major features
- [ ] Load testing performed
- [ ] DNS configured correctly

## 10. Support

For issues or questions:
- Check logs first: `docker-compose -f docker-compose.prod.yml logs`
- Review this documentation
- Check GitHub issues
- Contact support team

---

🎉 **Congratulations!** Your SentiBlog instance should now be running in production!