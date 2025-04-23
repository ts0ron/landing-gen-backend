import app from "./app";
import { config } from "./config/env.config";
import { logger } from "./utils/logger";

const server = app.listen(config.PORT, () => {
  logger.info(`Server is running on port ${config.PORT}`);
  logger.info(`Environment: ${config.NODE_ENV}`);
  logger.info(`API Documentation: http://localhost:${config.PORT}/api/docs`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Promise Rejection:", err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught Exception:", err);
  // Close server & exit process
  server.close(() => process.exit(1));
});
