const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME || "site_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "21M10t20",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
  },
);

module.exports = sequelize;
