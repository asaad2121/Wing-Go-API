module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.MEDIUMINT.UNSIGNED,
      },
      firstName: {
        field: "first_name",
        type: Sequelize.STRING(64),
      },
      lastName: {
        field: "last_name",
        type: Sequelize.STRING(64),
      },
      email: {
        field: "email",
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        field: "password",
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        field: "created_at",
        allowNull: false,
        type: "TIMESTAMP",
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        field: "updated_at",
        allowNull: false,
        type: "TIMESTAMP",
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("users");
  },
};
