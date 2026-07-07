
import { httpServer } from "./socket/socketServer";
import { env } from "./config/env";
import { bootstrapDatabase, validateProductionEnv } from "./config/bootstrap";

const PORT = env.port;

const startServer = async () => {
  try {
    await validateProductionEnv();
    await bootstrapDatabase();

    httpServer.listen(PORT, () => {
      console.log(`🚀 VIXXY D'ORANCE API & Socket.IO server is running on port ${PORT}`);
      console.log(`📡 Environment: ${env.nodeEnv}`);
      console.log(`🌐 CORS origins: ${env.corsOrigins.join(", ")}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
