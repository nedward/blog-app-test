const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production';
const JWT_EXPIRE_TIME = '7d';
const JWT_REFRESH_EXPIRE_TIME = '30d';

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE_TIME }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRE_TIME }
  );

  return { accessToken, refreshToken };
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

const refreshAccessToken = (refreshToken) => {
  const decoded = verifyToken(refreshToken);
  
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }

  return generateTokens(decoded.userId);
};

module.exports = {
  generateTokens,
  verifyToken,
  refreshAccessToken
};