const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TouristPlaceImages extends Model {
        static associate(models) {
            TouristPlaceImages.belongsTo(models.TouristPlace, {
                foreignKey: 'touristPlaceId',
                as: 'touristPlace',
                onDelete: 'CASCADE',
            });
        }
    }

    TouristPlaceImages.init(
        {
            touristPlaceId: {
                field: 'tourist_place_id',
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            imagePublicId: {
                field: 'image_public_id',
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            format: {
                field: 'format',
                type: DataTypes.STRING(50),
                allowNull: true,
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
            modelName: 'TouristPlaceImages',
            tableName: 'tourist_place_images',
            timestamps: true,
        }
    );

    return TouristPlaceImages;
};
