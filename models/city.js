const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class City extends Model {}

    City.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            topCity: {
                field: 'top_city',
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: 'City',
            tableName: 'city',
            timestamps: false,
        }
    );

    return City;
};
