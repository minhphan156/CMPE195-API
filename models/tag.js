/**
 * Tag model.
 * @module tag
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Tag', {
    name: { type: DataTypes.STRING, unique: true, allowNull: false }
  }, {
    underscored: true,
    timestamps: false,
    freezeTableName: true
  });
};