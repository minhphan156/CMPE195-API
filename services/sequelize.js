/**
 * sequelize module.
 * @module sequelize
 */

var RuntimeVars = require('./RuntimeVars');
const Sequelize = require('sequelize');
const UserModel = require('../models/user');
const PostModel = require('../models/post');
const MetadataModel = require('../models/metadata');
const TagModel = require('../models/tag');
const PostViewModel = require('../models/postview');

// Init Sequelize ORM
const sequelize = new Sequelize('dev1', RuntimeVars.DB.USERNAME, RuntimeVars.DB.PASSWORD, {
  host: RuntimeVars.DB.HOST,
  port: RuntimeVars.DB.PORT,
  dialect: 'postgres',
  operatorsAliases: false,
  logging: false,
  
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Defined Models
const User = UserModel(sequelize, Sequelize);
const Post = PostModel(sequelize, Sequelize);
const Metadata = MetadataModel(sequelize, Sequelize);
const Tag = TagModel(sequelize, Sequelize);
const PostView = PostViewModel(sequelize, Sequelize);

// Associations
Post.hasOne(Metadata);
Metadata.belongsTo(Post);

Metadata.belongsTo(User);
User.hasMany(Metadata);

Post.belongsToMany(Tag, { through: 'PostTag', timestamps: false });
Tag.belongsToMany(Post, { through: 'PostTag', timestamps: false });

User.belongsToMany(Post, {
  through: PostView,
  as: 'ViewedPosts'
});

Post.belongsToMany(User, {
  through: PostView,
  as: 'Viewers'
});

module.exports = {
  User,
  Post,
  Metadata,
  Tag,
  PostView,
  instance: sequelize
}