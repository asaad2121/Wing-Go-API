require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'asaadDB731@',
    database: process.env.DB_DATABASE || 'wingGo',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
  },
  test: {
    username: process.env.DB_TEST_USERNAME || 'root',
    password: process.env.DB_TEST_PASSWORD || null,
    database: process.env.DB_TEST_DATABASE || 'database_test',
    host: process.env.DB_TEST_HOST || '127.0.0.1',
    dialect: process.env.DB_TEST_DIALECT || 'mysql',
  },
  production: {
    username: process.env.DB_PRODUCTION_USERNAME || 'root',
    password: process.env.DB_PRODUCTION_PASSWORD || null,
    database: process.env.DB_PRODUCTION_DATABASE || 'database_production',
    host: process.env.DB_PRODUCTION_HOST || '127.0.0.1',
    dialect: process.env.DB_PRODUCTION_DIALECT || 'mysql',
  },
};
