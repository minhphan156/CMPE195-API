/**
 * Metadata model.
 * @module metadata
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Metadata', {
    post_id: {type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    summary: { type: DataTypes.TEXT, allowNull: false },
    authors: { type: DataTypes.STRING, allowNull: false },
    dataset_link: DataTypes.STRING,
    preview_image: DataTypes.TEXT,
    views: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
  }, {
    underscored: true,
    freezeTableName: true
  });
};