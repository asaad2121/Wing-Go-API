'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'hashed_password', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    // If you want to remove the old password column (if applicable)
    await queryInterface.removeColumn('users', 'password');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'hashed_password');
    await queryInterface.addColumn('users', 'password', {
      type: Sequelize.STRING,
    });
  },
};
