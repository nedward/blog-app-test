const { createServer } = require('http');
const { Server } = require('socket.io');
const { sequelize } = require('./models');
const app = require('./app');
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3005',
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  // Real-time events (to be implemented)
  socket.on('join-post', (postId) => {
    socket.join(`post-${postId}`);
  });
  
  socket.on('leave-post', (postId) => {
    socket.leave(`post-${postId}`);
  });
});

const PORT = process.env.PORT || 3001;

// Connect to database and start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Don't sync models - we use init.sql
    // Models are created by init.sql script

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`
🚀 SentiBlog Backend Server Started!
📍 Running on http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
💾 Database: Connected
📡 WebSocket: Enabled
🔒 Auth: JWT enabled

Available endpoints:
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET  /api/v1/auth/me
- POST /api/v1/auth/refresh
      `);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();