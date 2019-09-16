/**
 * Post model.
 * @module post
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Post', {
    notebook_filename: { type: DataTypes.STRING, allowNull: false },
  }, {
    underscored: true,
    timestamps: false,
    freezeTableName: true
  });
};