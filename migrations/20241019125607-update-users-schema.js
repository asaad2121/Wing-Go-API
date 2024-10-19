'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Drop the 'salt' column from the 'users' table
    await queryInterface.removeColumn('users', 'salt');
  },

  async down (queryInterface, Sequelize) {
    // Add the 'salt' column back in case of a rollback
    await queryInterface.addColumn('users', 'salt', {
      type: Sequelize.STRING,
      allowNull: true, // You can set this to false if you want it to be compulsory
    });
  }
};
