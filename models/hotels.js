const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Hotels extends Model {
        static associate(models) {
            Hotels.hasMany(models.HotelImages, {
                foreignKey: 'hotelId',
                as: 'images',
                onDelete: 'CASCADE',
            });
            Hotels.belongsTo(models.City, {
                foreignKey: 'cityId',
                as: 'city',
            });
        }
    }
    Hotels.init(
        {
            name: {
                field: 'name',
                type: DataTypes.STRING(64),
            },
            cityId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'city',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            latitude: {
                field: 'latitude',
                type: DataTypes.DECIMAL(10, 8),
                allowNull: true,
            },
            longitude: {
                field: 'longitude',
                type: DataTypes.DECIMAL(11, 8),
                allowNull: true,
            },
            rating: {
                field: 'rating',
                type: DataTypes.DECIMAL(2, 1),
                validate: {
                    min: 0,
                    max: 5,
                },
            },
            pricePerNight: {
                field: 'price_per_night',
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
            },
            address: {
                field: 'address',
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            contactNo: {
                field: 'contact_no',
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            email: {
                field: 'email',
                type: DataTypes.STRING(128),
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
            modelName: 'Hotels',
            tableName: 'hotels',
            timestamps: true,
        }
    );

    return Hotels;
};
