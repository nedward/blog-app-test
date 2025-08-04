const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Post = sequelize.define('Post', {
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  excerpt: {
    type: DataTypes.TEXT,
    validate: {
      len: [0, 500]
    }
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  publishedAt: {
    type: DataTypes.DATE,
    field: 'published_at'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'view_count'
  }
}, {
  tableName: 'posts',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: (post) => {
      // Generate slug from title if not provided
      if (!post.slug) {
        post.slug = post.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          + '-' + Date.now();
      }
    },
    beforeUpdate: (post) => {
      // Update publishedAt when publishing
      if (post.changed('published') && post.published && !post.publishedAt) {
        post.publishedAt = new Date();
      }
    }
  }
});

// Instance methods
Post.prototype.incrementViewCount = async function() {
  this.viewCount += 1;
  await this.save();
};

// Class methods
Post.findBySlug = function(slug) {
  return this.findOne({ where: { slug } });
};

Post.findPublished = function(options = {}) {
  return this.findAll({
    where: { published: true },
    order: [['published_at', 'DESC']],
    ...options
  });
};

module.exports = Post;