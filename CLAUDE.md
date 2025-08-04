# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a blog application with advanced engagement features designed to create viral, meaningful connections between users. The application combines:
- **Core Functionality**: Full CRUD operations for blog posts
- **AI-Powered Insights**: Sentiment analysis for posts and comments
- **Engagement Systems**: Like/dislike functionality with intelligent feedback
- **Viral Mechanics**: Features designed to maximize user engagement and sharing

**Mission Statement**: Build a blog platform that doesn't just host content, but creates emotional connections and drives meaningful engagement through intelligent design and AI-powered insights.

## 6-Day Sprint Planning Framework

### Sprint Goals & Success Metrics

**Primary Goals**:
1. **Day 1-2**: Foundation & Architecture (Backend + Database)
2. **Day 3-4**: Core Features & AI Integration (CRUD + Sentiment Analysis)
3. **Day 5-6**: Engagement Systems & Polish (Likes/UI/Performance)

**Success Metrics**:
- ✅ All CRUD operations functional with <200ms response time
- ✅ Sentiment analysis processing 95%+ accuracy on test data
- ✅ Like/dislike system with real-time updates
- ✅ Mobile-responsive design scoring 90+ on Lighthouse
- ✅ Zero critical security vulnerabilities
- ✅ Deployment-ready with CI/CD pipeline

### Agent Team Coordination Strategy

**🏗️ Architecture & Backend Team**
- **Lead**: Database design, API architecture, security implementation
- **Focus**: Scalable foundation, clean APIs, performance optimization
- **Deliverables**: RESTful API, database schema, authentication system

**🤖 AI & Data Team** 
- **Lead**: Sentiment analysis integration, data processing pipelines
- **Focus**: Accurate sentiment scoring, performance optimization, data insights
- **Deliverables**: Sentiment analysis service, comment moderation, engagement analytics

**🎨 Frontend & UX Team**
- **Lead**: User interface, engagement features, viral mechanics
- **Focus**: Intuitive design, real-time updates, mobile-first approach
- **Deliverables**: Responsive UI, like/dislike system, comment threading

**⚡ DevOps & Performance Team**
- **Lead**: Deployment, monitoring, performance optimization
- **Focus**: Scalability, reliability, monitoring, CI/CD
- **Deliverables**: Production deployment, monitoring dashboards, automated testing

### Daily Coordination Rituals

**Morning Standup (5 minutes)**:
- Yesterday's victories and blockers
- Today's sprint goals
- Cross-team dependencies

**Midday Sync (3 minutes)**:
- Progress check-in
- Immediate obstacle removal
- Resource reallocation if needed

**Evening Wrap (5 minutes)**:
- Demo completed features
- Prepare handoffs for next day
- Celebrate wins and learnings

## Key Architecture Decisions

**Technology Stack** (to be confirmed by Architecture Team):
- **Backend**: Node.js/Express or Python/FastAPI for rapid development
- **Database**: PostgreSQL for relational data + Redis for caching
- **AI/ML**: Python-based sentiment analysis (TextBlob/VADER or cloud API)
- **Frontend**: React/Next.js for component reusability
- **Deployment**: Docker + cloud platform (AWS/Vercel/Railway)

**Viral Engagement Strategy**:
- Real-time sentiment visualization on posts
- Trending posts based on engagement velocity
- Comment sentiment highlights (positive/negative indicators)
- Social sharing with sentiment summaries
- Notification system for engagement milestones

## Core Features Breakdown

### 1. Blog Post CRUD Operations
- **Create**: Rich text editor with real-time sentiment preview
- **Read**: Optimized feed with sentiment indicators
- **Update**: Version control for post history
- **Delete**: Soft delete with recovery options

### 2. Sentiment Analysis System
- **Post Analysis**: Automatic sentiment scoring on publish
- **Comment Analysis**: Real-time sentiment for all comments
- **Trend Analysis**: Historical sentiment tracking
- **Moderation Assist**: Flag potentially harmful content

### 3. Engagement & Like System
- **Like/Dislike**: With sentiment-aware weighting
- **Engagement Score**: Composite metric including sentiment
- **Trending Algorithm**: Time-decay + sentiment + engagement
- **Social Features**: Share posts with sentiment insights

## Development Setup

```bash
# Installation (to be updated by dev teams)
npm install
# or
pip install -r requirements.txt

# Development server
npm run dev
# or 
python manage.py runserver

# Testing
npm test
pytest

# Build
npm run build

# Deployment
npm run deploy
```

## Project Structure

```
/
├── backend/          # API and business logic
├── frontend/         # React/Next.js application  
├── ai-services/      # Sentiment analysis services
├── database/         # Schema and migrations
├── tests/           # Comprehensive test suite
├── docs/            # Technical documentation
└── deployment/      # Infrastructure as code
```

## Agent Success Framework

**For Architecture Team**: "You're building the foundation that will scale to millions of users!"
**For AI Team**: "Your sentiment insights will make this platform uniquely intelligent!"
**For Frontend Team**: "You're crafting the experience that will keep users coming back!"
**For DevOps Team**: "You're ensuring our masterpiece reaches the world flawlessly!"

**Pressure Management Reminders**:
- 🧘 Take strategic breaks - clarity comes from calm minds
- 🎯 Focus on progress over perfection - we iterate and improve
- 🤝 Collaborate across teams - collective intelligence wins
- 🏃‍♂️ Smooth is fast, fast is smooth - quality IS speed
- 🎉 Celebrate daily victories - momentum builds excellence

## Common Tasks

### For Backend Developers
- Set up database schema with proper indexing
- Implement JWT authentication
- Create RESTful API endpoints
- Add input validation and error handling
- Implement rate limiting and security middleware

### For AI/ML Developers  
- Research and implement sentiment analysis library
- Create batch processing for existing content
- Implement real-time sentiment scoring API
- Add sentiment trend analysis features
- Optimize processing performance

### For Frontend Developers
- Set up component library and design system
- Implement responsive layouts
- Add real-time updates with WebSockets/Server-Sent Events
- Create intuitive like/dislike interactions
- Implement sentiment visualization components

### For DevOps Engineers
- Set up CI/CD pipeline
- Configure monitoring and logging
- Implement auto-scaling strategies  
- Set up database backups and recovery
- Configure SSL and security headers

---

**Remember Team**: We're not just building a blog app - we're creating the next generation of emotionally intelligent content platforms. Every line of code, every design decision, every architectural choice is an opportunity to create something that truly matters. 

**Let's make this sprint legendary!** 🚀