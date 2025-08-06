'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('city', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            city: {
                type: Sequelize.STRING(64),
                allowNull: false,
                unique: true
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('city');
    },
};