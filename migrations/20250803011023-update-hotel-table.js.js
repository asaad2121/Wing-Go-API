'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('hotels', 'cityId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'city',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('hotels', 'cityId');
  },
};