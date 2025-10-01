const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserTripHotels extends Model {
        static associate(models) {
            UserTripHotels.belongsTo(models.Trips, {
                foreignKey: 'trip_id',
                as: 'trip',
                onDelete: 'CASCADE',
            });

            UserTripHotels.belongsTo(models.Hotels, {
                foreignKey: 'hotel_id',
                as: 'hotel',
                onDelete: 'CASCADE',
            });
        }
    }

    UserTripHotels.init(
        {
            trip_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: 'trips',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            city_id: {
                type: DataTypes.MEDIUMINT.UNSIGNED,
                allowNull: false,
            },
            city_name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            days: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            budget: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            tourist_destination_ids: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            hotel_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'hotels',
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
            modelName: 'UserTripHotels',
            tableName: 'user_trip_hotels',
            timestamps: false,
        }
    );

    return UserTripHotels;
};
