import { PrismaClient } from "@prisma/client";
import db, { initAssociations } from "../models";
import { env, isProduction } from "./env";
import { isPostgresUrl } from "./database";

const prisma = new PrismaClient();

export async function bootstrapDatabase(): Promise<void> {
  initAssociations();

  await db.sequelize.authenticate();
  console.log("✅ Sequelize database connected");

  await db.sequelize.sync();
  console.log("✅ Sequelize models synchronized");

  if (process.env.SEED_ON_START === "true") {
    await seedIfEmpty();
  }
}

async function seedIfEmpty(): Promise<void> {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log("ℹ️  Database already seeded, skipping seed");
    return;
  }

  console.log("🌱 Running initial database seed...");
  const { execSync } = await import("child_process");
  execSync("npx prisma db seed", { stdio: "inherit" });

  const productCount = await db.Product.count();
  if (productCount === 0) {
    console.log("🌱 Seeding Sequelize products...");
    const { default: seedSequelize } = await import("../scripts/seed-products");
    await seedSequelize();
  }
}

export async function validateProductionEnv(): Promise<void> {
  if (!isProduction) {
    return;
  }

  const warnings: string[] = [];

  if (!env.databaseUrl) {
    warnings.push("DATABASE_URL is not set");
  } else if (!isPostgresUrl(env.databaseUrl)) {
    warnings.push("DATABASE_URL is not a PostgreSQL connection string");
  }
  if (env.jwt.secret === "dev-secret-change-me") {
    warnings.push("JWT_SECRET is using the default development value");
  }
  if (env.corsOrigins.length === 0) {
    warnings.push("CORS_ORIGINS is empty");
  }

  warnings.forEach((message) => console.warn(`⚠️  Production warning: ${message}`));
}
