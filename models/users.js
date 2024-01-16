const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      // define association here
    }
  };
  Users.init({
    firstName: {
      field: 'first_name',
      type: DataTypes.STRING(64),
    },
    lastName: {
      field: 'last_name',
      type: DataTypes.STRING(64),
    },
    email: {
        field: 'email',
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        field: 'password',
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdAt: {
        field: 'created_at',
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        field: 'updated_at',
        allowNull: false,
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      }
    }, {
      sequelize,
      tableName: 'users',
    });
    return Users;
  };