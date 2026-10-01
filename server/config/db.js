import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || "research_laboratory",
  process.env.MYSQL_USER || "root",
  process.env.MYSQL_PASSWORD || "",
  {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    dialect: "mysql",
    logging: false,
  },
);

export async function connectDatabase() {
  await sequelize.authenticate();
  await sequelize.sync();
  console.log("MySQL connected");
}

export default sequelize;
