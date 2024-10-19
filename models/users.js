const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {

    set password(value) {
      this._password = value;
      this.salt = uuidv4();
      this.hashed_password = this.encryptPassword(value);
    }

    get password() {
      return this._password;
    }

    encryptPassword(password) {
      if (!password) return '';
      try {
        return crypto
          .createHmac('sha1', this.salt)
          .update(password)
          .digest('hex');
      } catch (err) {
        return '';
      }
    }

    authenticate(plainText) {
      console.log('authenticate', plainText, this.encryptPassword(plainText), this.hashed_password);
      return this.encryptPassword(plainText) === this.hashed_password;
    }
  }

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
    hashed_password: {
      field: 'hashed_password',
      type: DataTypes.STRING,
      allowNull: false,
    },
    salt: {
      field: 'salt',
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      field: 'created_at',
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      field: 'updated_at',
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    }
  }, {
    sequelize,
    tableName: 'users',
    timestamps: true,
  });

  return Users;
};
