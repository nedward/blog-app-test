const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Engagement = sequelize.define('Engagement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'post_id',
    references: {
      model: 'posts',
      key: 'id'
    }
  },
  isLike: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_like'
  }
}, {
  tableName: 'engagements',
  timestamps: true,
  updatedAt: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'post_id']
    }
  ]
});

// Class methods
Engagement.toggleEngagement = async function(userId, postId, isLike) {
  const existing = await this.findOne({
    where: { userId, postId }
  });

  if (existing) {
    if (existing.isLike === isLike) {
      // Remove engagement if clicking the same button
      await existing.destroy();
      return null;
    } else {
      // Switch from like to dislike or vice versa
      existing.isLike = isLike;
      await existing.save();
      return existing;
    }
  } else {
    // Create new engagement
    return this.create({ userId, postId, isLike });
  }
};

Engagement.getPostEngagementStats = async function(postId) {
  const stats = await this.findAll({
    where: { postId },
    attributes: [
      'isLike',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['isLike']
  });

  const result = {
    likes: 0,
    dislikes: 0
  };

  stats.forEach(stat => {
    if (stat.isLike) {
      result.likes = parseInt(stat.get('count'));
    } else {
      result.dislikes = parseInt(stat.get('count'));
    }
  });

  return result;
};

Engagement.getUserEngagement = async function(userId, postId) {
  const engagement = await this.findOne({
    where: { userId, postId }
  });
  
  return engagement ? engagement.isLike : null;
};

module.exports = Engagement;