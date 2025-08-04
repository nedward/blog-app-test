const { body } = require('express-validator');
const { User } = require('../models');
const { generateTokens, refreshAccessToken } = require('../utils/jwt');
const { handleValidationErrors } = require('../middleware/validation');

// Validation rules
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .isAlphanumeric()
    .withMessage('Username can only contain letters and numbers'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Register new user
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [User.sequelize.Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        error: {
          message: existingUser.email === email 
            ? 'Email already registered' 
            : 'Username already taken',
          status: 409
        }
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      passwordHash: password // Will be hashed by beforeCreate hook
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    res.status(201).json({
      message: 'Registration successful',
      user: user.toJSON(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: {
        message: 'Registration failed',
        status: 500
      }
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
          status: 401
        }
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
          status: 401
        }
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        message: 'Login failed',
        status: 500
      }
    });
  }
};

// Refresh access token
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: {
          message: 'Refresh token required',
          status: 400
        }
      });
    }

    const tokens = refreshAccessToken(refreshToken);

    res.json({
      message: 'Token refreshed successfully',
      ...tokens
    });
  } catch (error) {
    res.status(401).json({
      error: {
        message: error.message || 'Token refresh failed',
        status: 401
      }
    });
  }
};

// Get current user
const me = async (req, res) => {
  res.json({
    user: req.user.toJSON()
  });
};

// Logout (client-side token removal)
const logout = async (req, res) => {
  res.json({
    message: 'Logout successful'
  });
};

module.exports = {
  register: [registerValidation, register],
  login: [loginValidation, login],
  refresh,
  me,
  logout
};