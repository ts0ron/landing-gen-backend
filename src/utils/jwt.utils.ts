import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config/env.config";
import { logger } from "./logger";
import { Role } from "../models/auth/role";

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}

/**
 * Utility class for JWT token generation and verification
 */
export class JwtUtils {
  /**
   * Generate a JWT token for a user
   * @param payload - User data to encode in the token
   * @returns JWT token string
   */
  static generateToken(payload: JwtPayload): string {
    logger.debug(`Generating JWT token for user: ${payload.id}`);

    const options: SignOptions = {
      expiresIn: config.JWT_EXPIRATION as jwt.SignOptions["expiresIn"],
    };

    return jwt.sign(payload, config.JWT_SECRET, options);
  }

  /**
   * Verify and decode a JWT token
   * @param token - JWT token string
   * @returns Decoded JWT payload or null if invalid
   */
  static verifyToken(token: string): JwtPayload | null {
    try {
      logger.debug("Verifying JWT token");
      return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    } catch (error) {
      logger.error(
        `JWT verification failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return null;
    }
  }
}
