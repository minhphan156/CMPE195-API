/**
 * User model.
 * @module user
 */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    first_name: { type: DataTypes.STRING, allowNull: false },
    last_name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    is_sso: { type: DataTypes.BOOLEAN, allowNull: false },
    position: { type: DataTypes.STRING, allowNull: false },
    avatar:  { type: DataTypes.STRING, allowNull: false }
  }, {
    underscored: true,
    timestamps: false,
    freezeTableName: true,
    getterMethods: {
      full_name() {
        return this.getDataValue('first_name') + ' ' + this.getDataValue('last_name');
      }
    }
  });
};