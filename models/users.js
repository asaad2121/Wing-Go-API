const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
    class Users extends Model {
        set password(value) {
            this._password = value;
            this.salt = uuidv4();
            this.hashedPassword = this.encryptPassword(value);
        }

        get password() {
            return this._password;
        }

        encryptPassword(password) {
            if (!password) return '';
            try {
                return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
            } catch (err) {
                return '';
            }
        }

        authenticate(plainText) {
            return this.encryptPassword(plainText) === this.hashedPassword;
        }
    }

    Users.init(
        {
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
            hashedPassword: {
                field: 'hashed_password',
                type: DataTypes.STRING,
                allowNull: false,
            },
            countryCode: {
                field: 'country_code',
                type: DataTypes.STRING,
                allowNull: true,
            },
            phoneNumber: {
                field: 'phone_number',
                type: DataTypes.STRING,
                allowNull: true,
            },
            dob: {
                field: 'date_of_birth',
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            salt: {
                field: 'salt',
                type: DataTypes.STRING,
                allowNull: true,
            },
            googleId: {
                field: 'google_id',
                type: DataTypes.STRING,
                allowNull: true,
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
            },
        },
        {
            sequelize,
            tableName: 'users',
            timestamps: true,
        }
    );

    return Users;
};
