import dotenv from "dotenv";

dotenv.config();

const parseOrigins = (value?: string): string[] =>
  (value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3003,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  backendUrl:
    process.env.BACKEND_URL ||
    `http://localhost:${process.env.PORT || 3003}`,
  adminUrl: process.env.ADMIN_URL || "http://localhost:3001",
  corsOrigins: parseOrigins(
    process.env.CORS_ORIGINS ||
      [
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
      ]
        .filter(Boolean)
        .join(",")
  ),
  databaseUrl: process.env.DATABASE_URL,
  dbStorage: process.env.DB_STORAGE,
  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      process.env.JWT_SECRET ||
      "dev-refresh-secret",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  openRouterApiKey: process.env.OPENROUTER_API_KEY || "",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
};

export const isProduction = env.nodeEnv === "production";
