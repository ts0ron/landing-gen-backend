import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

/**
 * Validation error response interface
 */
interface ValidationError {
  field: string;
  message: string;
}

/**
 * Base validator interface
 */
export interface RequestValidator {
  validate(data: any): ValidationError[];
}

/**
 * Middleware factory for request validation
 * @param validator - Validator instance to use
 * @param target - Request property to validate ('body' | 'query' | 'params')
 */
export const validateRequest = (
  validator: RequestValidator,
  target: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = req[target];
    const errors = validator.validate(data);

    if (errors.length > 0) {
      logger.warn("Validation failed:", { errors, [target]: data });
      res.status(400).json({
        error: "Validation failed",
        errors,
      });
      return;
    }

    next();
  };
};

/**
 * Email validator
 */
export class EmailValidator implements RequestValidator {
  validate(data: any): ValidationError[] {
    const errors: ValidationError[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.email) {
      errors.push({
        field: "email",
        message: "Email is required",
      });
    } else if (!emailRegex.test(data.email)) {
      errors.push({
        field: "email",
        message: "Invalid email format",
      });
    }

    return errors;
  }
}

/**
 * Password validator
 */
export class PasswordValidator implements RequestValidator {
  validate(data: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!data.password) {
      errors.push({
        field: "password",
        message: "Password is required",
      });
    } else if (data.password.length < 6) {
      errors.push({
        field: "password",
        message: "Password must be at least 6 characters long",
      });
    }

    return errors;
  }
}

/**
 * User registration validator
 */
export class UserRegistrationValidator implements RequestValidator {
  private emailValidator = new EmailValidator();
  private passwordValidator = new PasswordValidator();

  validate(data: any): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate email and password
    errors.push(...this.emailValidator.validate(data));
    errors.push(...this.passwordValidator.validate(data));

    // Validate first name
    if (!data.firstName) {
      errors.push({
        field: "firstName",
        message: "First name is required",
      });
    }

    // Validate last name
    if (!data.lastName) {
      errors.push({
        field: "lastName",
        message: "Last name is required",
      });
    }

    return errors;
  }
}

/**
 * Place ID validator
 */
export class PlaceIdValidator implements RequestValidator {
  validate(data: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!data.placeId) {
      errors.push({
        field: "placeId",
        message: "Place ID is required",
      });
    }

    return errors;
  }
}
