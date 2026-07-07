
import { Sequelize } from "sequelize";
import path from "path";
import { env } from "./env";

const logging = env.nodeEnv === "development" ? console.log : false;

function isPostgresUrl(url?: string): boolean {
  if (!url) return false;
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

const sequelize = isPostgresUrl(env.databaseUrl)
  ? new Sequelize(env.databaseUrl!, {
      dialect: "postgres",
      dialectOptions: {
        ssl: isProductionSsl(),
      },
      logging,
    })
  : new Sequelize({
      dialect: "sqlite",
      storage:
        env.dbStorage || path.join(__dirname, "../../database.sqlite"),
      logging,
    });

function isProductionSsl() {
  if (env.nodeEnv !== "production") {
    return false;
  }

  return {
    require: true,
    rejectUnauthorized: false,
  };
}

export default sequelize;
export { isPostgresUrl };
