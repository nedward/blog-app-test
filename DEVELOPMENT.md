# Development Setup Guide

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development without Docker)
- Git

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/nedward/blog-app-test.git
   cd blog-app-test
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your sentiment analysis API key
   ```

3. **Start the development environment**
   ```bash
   make up
   # or
   docker-compose up -d
   ```

4. **Access the applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - pgAdmin: http://localhost:5050
     - Email: admin@sentiblog.local
     - Password: admin123

## Development Commands

```bash
# View logs
make logs

# Stop services
make down

# Rebuild containers
make build

# Access container shells
make shell-backend
make shell-frontend
make shell-db

# Clean everything
make clean
```

## Project Structure

```
sentiblog/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Helper functions
│   ├── db/                # Database scripts
│   └── tests/             # Backend tests
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Next.js pages
│   │   ├── styles/        # CSS/Tailwind styles
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Frontend utilities
│   │   └── contexts/      # React contexts
│   ├── public/            # Static assets
│   └── tests/             # Frontend tests
└── docker-compose.yml     # Docker configuration
```

## Database

The PostgreSQL database is automatically initialized with the schema from `backend/db/init.sql`.

To connect to the database:
```bash
make shell-db
# or
docker exec -it sentiblog-postgres psql -U sentiblog -d sentiblog_dev
```

## API Development

The backend API runs on http://localhost:3001 with the following endpoints:

- `GET /health` - Health check
- `GET /api/v1` - API information
- More endpoints to be implemented...

## Frontend Development

The frontend uses Next.js with:
- Tailwind CSS for styling
- Framer Motion for animations
- Socket.io for real-time features
- SWR for data fetching

## Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## Troubleshooting

1. **Port conflicts**: If ports are already in use, update the port mappings in `docker-compose.yml`

2. **Database connection issues**: Ensure the PostgreSQL container is healthy:
   ```bash
   docker-compose ps
   ```

3. **Permission issues**: On Linux, you might need to run Docker commands with `sudo`

4. **Clean start**: If you encounter issues, try a clean restart:
   ```bash
   make clean
   make up
   ```