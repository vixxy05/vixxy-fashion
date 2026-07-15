
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import xss from "xss";
import authRoutes from "./routes/authRoutes";
import passwordRoutes from "./routes/passwordRoutes";
import roleRoutes from "./routes/roleRoutes";
import permissionRoutes from "./routes/permissionRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import chatRoutes from "./routes/chatRoutes";
import knowledgeRoutes from "./routes/knowledgeRoutes";
import chatSessionRoutes from "./routes/chatSessionRoutes";
import chatMessageRoutes from "./routes/chatMessageRoutes";
import cartRoutes from "./routes/cartRoutes";
import aiSellingRoutes from "./routes/aiSellingRoutes";
import mockPaymentRoutes from "./routes/mockPaymentRoutes";
import swaggerSpec from "./config/swagger";
import { errorHandler } from "./middleware/error.middleware";
import {
  helmetConfig,
  generalLimiter,
  authLimiter,
  xssProtection,
} from "./middleware/security.middleware";

const app = express();

if (env.nodeEnv === "production") {
  app.set("trust proxy", 1);
}

// Security Middleware
app.use(helmetConfig);

// Rate Limiting
app.use(generalLimiter);

// CORS
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        env.corsOrigins.includes(origin) ||
        env.nodeEnv !== "production"
      ) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// XSS Protection
app.use(xssProtection);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes - Apply stricter rate limit to auth routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/password", authLimiter, passwordRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai-knowledge", knowledgeRoutes);
app.use("/api/chat-sessions", chatSessionRoutes);
app.use("/api/chat-messages", chatMessageRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/ai-selling", aiSellingRoutes);
app.use("/api", mockPaymentRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "VIXXY D'ORANCE API Server",
    status: "ok",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Error handler middleware (must come after routes)
app.use(errorHandler);

export default app;
