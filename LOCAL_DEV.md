# Local Development Without Docker

If you prefer to run the application without Docker, follow these steps:

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis (optional, for caching)

## Setup Instructions

### 1. Install PostgreSQL

```bash
# macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15

# Create database and user
createuser -s sentiblog
createdb sentiblog_dev
```

### 2. Install Redis (Optional)

```bash
# macOS with Homebrew
brew install redis
brew services start redis
```

### 3. Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Update .env with your local PostgreSQL credentials
# DATABASE_URL=postgresql://sentiblog@localhost:5432/sentiblog_dev
```

### 4. Initialize Database

```bash
# Run the init script
psql -U sentiblog -d sentiblog_dev -f backend/db/init.sql
```

### 5. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in another terminal)
cd frontend
npm install
```

### 6. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 7. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Testing Authentication

Once both servers are running:

```bash
cd backend
node src/utils/testAuth.js
```

## Troubleshooting

1. **PostgreSQL Connection Error**: 
   - Ensure PostgreSQL is running: `brew services list`
   - Check connection: `psql -U sentiblog -d sentiblog_dev`

2. **Port Already in Use**:
   - Backend: Change `PORT` in `.env`
   - Frontend: Change port in `package.json` dev script

3. **Module Not Found**:
   - Delete `node_modules` and run `npm install` again