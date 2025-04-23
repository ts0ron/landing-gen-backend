import mongoose from "mongoose";
import { config } from "./env.config";
import { logger } from "../utils/logger";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  logger.error("MongoDB error:", err);
});
