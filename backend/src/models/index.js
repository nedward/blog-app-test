const { sequelize } = require('../config/database');
const User = require('./User');
const Post = require('./Post');
const SentimentAnalysis = require('./SentimentAnalysis');
const Engagement = require('./Engagement');
const Comment = require('./Comment');
const Tag = require('./Tag');

// Define associations
// User -> Posts
User.hasMany(Post, {
  foreignKey: 'userId',
  as: 'posts'
});
Post.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author'
});

// Post -> SentimentAnalysis
Post.hasOne(SentimentAnalysis, {
  foreignKey: 'postId',
  as: 'sentimentAnalysis'
});
SentimentAnalysis.belongsTo(Post, {
  foreignKey: 'postId'
});

// User -> Engagements
User.hasMany(Engagement, {
  foreignKey: 'userId',
  as: 'engagements'
});
Engagement.belongsTo(User, {
  foreignKey: 'userId'
});

// Post -> Engagements
Post.hasMany(Engagement, {
  foreignKey: 'postId',
  as: 'engagements'
});
Engagement.belongsTo(Post, {
  foreignKey: 'postId'
});

// User -> Comments
User.hasMany(Comment, {
  foreignKey: 'userId',
  as: 'comments'
});
Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author'
});

// Post -> Comments
Post.hasMany(Comment, {
  foreignKey: 'postId',
  as: 'comments'
});
Comment.belongsTo(Post, {
  foreignKey: 'postId'
});

// Comment -> Comment (replies)
Comment.hasMany(Comment, {
  foreignKey: 'parentCommentId',
  as: 'replies'
});
Comment.belongsTo(Comment, {
  foreignKey: 'parentCommentId',
  as: 'parentComment'
});

// Post <-> Tags (many-to-many)
Post.belongsToMany(Tag, {
  through: 'post_tags',
  foreignKey: 'postId',
  otherKey: 'tagId',
  as: 'tags'
});
Tag.belongsToMany(Post, {
  through: 'post_tags',
  foreignKey: 'tagId',
  otherKey: 'postId',
  as: 'posts'
});

// Helper function to sync database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Post,
  SentimentAnalysis,
  Engagement,
  Comment,
  Tag,
  syncDatabase
};