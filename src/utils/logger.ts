import * as winston from "winston";
import * as fs from "fs";
import * as path from "path";

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Define log level based on environment
const logLevel = process.env.NODE_ENV === "production" ? "info" : "debug";

// Create the logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || logLevel,
  format: logFormat,
  defaultMeta: { service: "places-api" },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // File transport for errors
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
    }),
  ],
});

logger.info(
  `Logger initialized in ${process.env.NODE_ENV || "development"} mode`
);
