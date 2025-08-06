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
