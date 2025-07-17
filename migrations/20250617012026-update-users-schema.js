'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('users', 'countryCode', 'country_code');
    await queryInterface.renameColumn('users', 'phoneNumber', 'phone_number');
    await queryInterface.renameColumn('users', 'dob', 'date_of_birth');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('users', 'country_code', 'countryCode');
    await queryInterface.renameColumn('users', 'phone_number', 'phoneNumber');
    await queryInterface.renameColumn('users', 'date_of_birth', 'dob');
  }
};
