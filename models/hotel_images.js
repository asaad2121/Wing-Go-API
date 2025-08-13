const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class HotelImages extends Model {
        static associate(models) {
            HotelImages.belongsTo(models.Hotels, {
                foreignKey: 'hotelId',
                as: 'hotel',
                onDelete: 'CASCADE',
            });
        }
    }

    HotelImages.init(
        {
            hotelId: {
                field: 'hotel_id',
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
            isActive: {
                field: 'is_active',
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
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
            modelName: 'HotelImages',
            tableName: 'hotel_images',
            timestamps: true,
        }
    );

    return HotelImages;
};
