const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Trips extends Model {
        static associate(models) {
            Trips.belongsTo(models.Users, {
                foreignKey: 'user_id',
                as: 'user',
                onDelete: 'CASCADE',
            });

            Trips.hasMany(models.UserTripHotels, {
                foreignKey: 'trip_id',
                as: 'tripHotels',
                onDelete: 'CASCADE',
            });
        }
    }

    Trips.init(
        {
            userId: {
                field: 'user_id',
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            createdAt: {
                field: 'created_at',
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
                field: 'updated_at',
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            },
        },
        {
            sequelize,
            modelName: 'Trips',
            tableName: 'trips',
            timestamps: false,
        }
    );

    return Trips;
};
