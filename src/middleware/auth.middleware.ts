import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { Role } from "../models/auth/role";
import { FirebaseAuthService } from "../services/authentication/firebase-auth.service";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
      };
    }
  }
}

const authService = new FirebaseAuthService();

/**
 * Middleware to authenticate requests using Firebase
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Authentication failed: No token provided");
      res.status(401).json({ error: "Access denied. No token provided." });
      return;
    }

    const token = authHeader.split(" ")[1];
    const user = await authService.verifyToken(token);

    if (!user) {
      logger.warn("Authentication failed: Invalid token");
      res.status(401).json({ error: "Invalid token." });
      return;
    }

    req.user = user;
    logger.debug(`User authenticated: ${user.id}`);
    next();
  } catch (error) {
    logger.error(
      `Authentication error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    res.status(401).json({ error: "Invalid token." });
  }
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    logger.warn("Admin check failed: User not authenticated");
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  if (req.user.role !== Role.ADMIN) {
    logger.warn(`Admin access denied for user: ${req.user.id}`);
    res
      .status(403)
      .json({ error: "Access denied. Admin privileges required." });
    return;
  }

  logger.debug(`Admin access granted to user: ${req.user.id}`);
  next();
};
