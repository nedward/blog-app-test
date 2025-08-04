const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comment = sequelize.define('Comment', {
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
  parentCommentId: {
    type: DataTypes.UUID,
    field: 'parent_comment_id',
    references: {
      model: 'comments',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 5000]
    }
  },
  sentiment: {
    type: DataTypes.ENUM('positive', 'negative', 'neutral', 'mixed')
  },
  sentimentScore: {
    type: DataTypes.DECIMAL(3, 2),
    field: 'sentiment_score',
    validate: {
      min: -1,
      max: 1
    }
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_deleted'
  }
}, {
  tableName: 'comments',
  timestamps: true,
  underscored: true,
  defaultScope: {
    where: { isDeleted: false }
  },
  scopes: {
    withDeleted: {
      where: {}
    }
  }
});

// Instance methods
Comment.prototype.softDelete = async function() {
  this.isDeleted = true;
  this.content = '[Deleted]';
  await this.save();
};

Comment.prototype.toJSON = function() {
  const values = { ...this.get() };
  if (this.isDeleted) {
    values.content = '[Deleted]';
    delete values.userId;
  }
  return values;
};

// Class methods
Comment.getThreadedComments = async function(postId) {
  const comments = await this.findAll({
    where: { postId },
    order: [['created_at', 'ASC']]
  });

  // Build comment tree
  const commentMap = {};
  const rootComments = [];

  comments.forEach(comment => {
    commentMap[comment.id] = {
      ...comment.toJSON(),
      replies: []
    };
  });

  comments.forEach(comment => {
    if (comment.parentCommentId) {
      const parent = commentMap[comment.parentCommentId];
      if (parent) {
        parent.replies.push(commentMap[comment.id]);
      }
    } else {
      rootComments.push(commentMap[comment.id]);
    }
  });

  return rootComments;
};

module.exports = Comment;