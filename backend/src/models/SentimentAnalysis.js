const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SentimentAnalysis = sequelize.define('SentimentAnalysis', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'post_id',
    references: {
      model: 'posts',
      key: 'id'
    }
  },
  sentiment: {
    type: DataTypes.ENUM('positive', 'negative', 'neutral', 'mixed'),
    allowNull: false
  },
  sentimentScore: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    field: 'sentiment_score',
    validate: {
      min: -1,
      max: 1
    }
  },
  positiveScore: {
    type: DataTypes.DECIMAL(3, 2),
    field: 'positive_score',
    validate: {
      min: 0,
      max: 1
    }
  },
  negativeScore: {
    type: DataTypes.DECIMAL(3, 2),
    field: 'negative_score',
    validate: {
      min: 0,
      max: 1
    }
  },
  neutralScore: {
    type: DataTypes.DECIMAL(3, 2),
    field: 'neutral_score',
    validate: {
      min: 0,
      max: 1
    }
  },
  keywords: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  analyzedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'analyzed_at'
  }
}, {
  tableName: 'sentiment_analyses',
  timestamps: false,
  underscored: true
});

// Instance methods
SentimentAnalysis.prototype.getSentimentEmoji = function() {
  const emojiMap = {
    positive: '😊',
    negative: '😕',
    neutral: '😐',
    mixed: '🤔'
  };
  return emojiMap[this.sentiment] || '😐';
};

SentimentAnalysis.prototype.getSentimentColor = function() {
  const colorMap = {
    positive: '#10b981',
    negative: '#ef4444',
    neutral: '#6b7280',
    mixed: '#f59e0b'
  };
  return colorMap[this.sentiment] || '#6b7280';
};

// Class methods
SentimentAnalysis.getAverageSentiment = async function(userId) {
  const result = await sequelize.query(`
    SELECT 
      AVG(sa.sentiment_score) as avg_sentiment,
      COUNT(sa.id) as total_posts
    FROM sentiment_analyses sa
    JOIN posts p ON sa.post_id = p.id
    WHERE p.user_id = :userId
  `, {
    replacements: { userId },
    type: sequelize.QueryTypes.SELECT
  });
  
  return result[0];
};

module.exports = SentimentAnalysis;