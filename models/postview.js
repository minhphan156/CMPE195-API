/**
 * PostView model.
 * @module postvie
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PostView', {
    liked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  }, {
    underscored: true,
    freezeTableName: true,
    timestamps: true,
    createdAt: false,
    updatedAt: 'last_viewed'
  });
};