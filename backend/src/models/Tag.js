const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  slug: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'tags',
  timestamps: true,
  updatedAt: false,
  underscored: true,
  hooks: {
    beforeCreate: (tag) => {
      if (!tag.slug) {
        tag.slug = tag.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
    }
  }
});

// Class methods
Tag.findOrCreateByName = async function(name) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const [tag] = await this.findOrCreate({
    where: { slug },
    defaults: { name, slug }
  });

  return tag;
};

Tag.findBySlug = function(slug) {
  return this.findOne({ where: { slug } });
};

module.exports = Tag;