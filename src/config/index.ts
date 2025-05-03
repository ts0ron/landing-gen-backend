import dotenv from "dotenv";
import { logger } from "../utils/logger";

// Load environment variables from .env file
dotenv.config();

interface Config {
  DEEPSEEK_API_KEY: string;
  OLLAMA_API_URL: string;
  // Add other environment variables as needed
}

export const config: Config = {
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || "",
  OLLAMA_API_URL: process.env.OLLAMA_API_URL || "http://localhost:11434/api",
  // Add other environment variables as needed
};

// Log warning if required environment variables are missing
if (!config.DEEPSEEK_API_KEY) {
  logger.warn("DEEPSEEK_API_KEY environment variable is not set");
}
