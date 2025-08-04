const { Sequelize } = require('sequelize');

const config = {
  development: {
    url: process.env.DATABASE_URL || 'postgresql://sentiblog:sentiblog_dev_123@localhost:5432/sentiblog_dev',
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  },
  test: {
    url: process.env.DATABASE_URL || 'postgresql://sentiblog:sentiblog_dev_123@localhost:5432/sentiblog_test',
    dialect: 'postgres',
    logging: false
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

const env = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(config[env].url, config[env]);

module.exports = { sequelize, Sequelize };