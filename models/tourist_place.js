const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TouristPlace extends Model {
        static associate(models) {
            TouristPlace.belongsTo(models.City, {
                foreignKey: 'cityId',
                as: 'city',
            });

            TouristPlace.hasMany(models.EntryFee, {
                foreignKey: 'touristPlaceId',
                as: 'entryFees',
                onDelete: 'CASCADE',
            });

            TouristPlace.hasMany(models.TouristPlaceImages, {
                foreignKey: 'touristPlaceId',
                as: 'images',
                onDelete: 'CASCADE',
            });
        }
    }

    TouristPlace.init(
        {
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            cityId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'city',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            latitude: {
                type: DataTypes.DECIMAL(10, 8),
                allowNull: true,
            },
            longitude: {
                type: DataTypes.DECIMAL(11, 8),
                allowNull: true,
            },
            website: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            address: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'TouristPlace',
            tableName: 'tourist_places',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );

    return TouristPlace;
};
