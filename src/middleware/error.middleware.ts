import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export interface ApiError extends Error {
  statusCode?: number;
  errors?: string[];
}

/**
 * Error handling middleware
 * Provides consistent error response format
 */
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || [];

  // Log error details
  logger.error("Error occurred:", {
    statusCode,
    message,
    errors,
    stack: err.stack,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
    user: req.user,
  });

  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      ...(errors.length > 0 && { errors }),
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    },
  });
};

/**
 * Not Found middleware
 * Handles 404 errors for undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error: ApiError = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
