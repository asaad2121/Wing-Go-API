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
            user_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
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
