const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class EntryFee extends Model {
        static associate(models) {
            EntryFee.belongsTo(models.TouristPlace, {
                foreignKey: 'touristPlaceId',
                as: 'touristPlace',
            });
        }
    }

    EntryFee.init(
        {
            touristPlaceId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'tourist_places',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            fee_type: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            currency: {
                type: DataTypes.STRING(10),
                defaultValue: 'NZD',
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            last_updated: {
                type: DataTypes.DATE,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            },
        },
        {
            sequelize,
            modelName: 'EntryFee',
            tableName: 'entry_fees',
            timestamps: false,
        }
    );

    return EntryFee;
};
