require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
        dialect: process.env.DB_DIALECT || 'mysql',
    },
    test: {
        username: process.env.DB_TEST_USERNAME,
        password: process.env.DB_TEST_PASSWORD,
        database: process.env.DB_TEST_DATABASE,
        host: process.env.DB_TEST_HOST,
        port: process.env.DB_TEST_PORT ? Number(process.env.DB_TEST_PORT) : 3306,
        dialect: process.env.DB_TEST_DIALECT || 'mysql',
    },
    production: {
        username: process.env.DB_PRODUCTION_USERNAME,
        password: process.env.DB_PRODUCTION_PASSWORD,
        database: process.env.DB_PRODUCTION_DATABASE,
        host: process.env.DB_PRODUCTION_HOST,
        port: process.env.DB_PRODUCTION_PORT ? Number(process.env.DB_PRODUCTION_PORT) : 3306,
        dialect: process.env.DB_PRODUCTION_DIALECT || 'mysql',
        dialectOptions: {
            connectTimeout: 30000,
        },
        logging: false, // disable SQL logs in prod
    },
};
