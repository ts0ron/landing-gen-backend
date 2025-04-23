import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../../.env") });

interface Config {
  PORT: number;
  NODE_ENV: "development" | "production" | "test";
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
  GOOGLE_MAPS_API_KEY: string;
  OPENAI_API_KEY: string;
  LOG_LEVEL: string;
}

// Helper function to get required env variable
const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

// Export configuration object
export const config: Config = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  NODE_ENV: (process.env.NODE_ENV || "development") as Config["NODE_ENV"],
  MONGODB_URI: getRequiredEnv("MONGODB_URI"),
  JWT_SECRET: getRequiredEnv("JWT_SECRET"),
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || "24h",
  GOOGLE_MAPS_API_KEY: getRequiredEnv("GOOGLE_MAPS_API_KEY"),
  OPENAI_API_KEY: getRequiredEnv("OPENAI_API_KEY"),
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
};
