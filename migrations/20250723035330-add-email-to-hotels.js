'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('hotels', 'email', {
      type: Sequelize.STRING(128),
      allowNull: true,
      after: 'contact_no',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('hotels', 'email');
  },
};