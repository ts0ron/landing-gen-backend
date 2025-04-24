import express, { Request, Response } from "express";
import { UserDAO } from "../dao/user.dao";
import { JwtUtils } from "../utils/jwt.utils";
import {
  validateRequest,
  UserRegistrationValidator,
  EmailValidator,
  PasswordValidator,
} from "../middleware/validation.middleware";
import { logger } from "../utils/logger";
import { IUser } from "../models/user.model";

const router = express.Router();
const userDao = UserDAO.getInstance();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Email already registered
 */
router.post(
  "/register",
  validateRequest(new UserRegistrationValidator()),
  async (req: Request, res: Response) => {
    logger.info("Starting user registration process");
    logger.debug("Registration request body:", {
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });

    try {
      const { email, password, firstName, lastName } = req.body;

      logger.debug("Checking for existing user");
      const existingUser = await userDao.findByEmail(email);
      if (existingUser) {
        logger.warn(`Registration failed: Email ${email} already exists`);
        res.status(409).json({ error: "Email already registered" });
        return;
      }

      logger.debug("Creating new user");
      // Create user
      const user = await userDao.createUser({
        email,
        password,
        firstName,
        lastName,
      });
      logger.info(`User created successfully with ID: ${user._id}`);

      // Generate token
      logger.debug("Generating JWT token");
      const token = JwtUtils.generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
      });

      // Return user data without password
      const userObject = user.toObject();
      const { password: _, ...userWithoutPassword } = userObject;

      logger.info(`User registered successfully: ${user.email}`);
      res.status(201).json({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      logger.error("Registration process failed:", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      res.status(500).json({ error: "Registration failed" });
    }
  }
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Invalid credentials
 */
router.post(
  "/login",
  validateRequest(new EmailValidator()),
  validateRequest(new PasswordValidator()),
  async (req: Request, res: Response) => {
    logger.info("Starting user login process");
    logger.debug("Login request for email:", req.body.email);

    try {
      const { email, password } = req.body;

      // Find user by email
      logger.debug("Looking up user by email");
      const user = await userDao.findByEmail(email);
      if (!user) {
        logger.warn(`Login failed: No user found with email ${email}`);
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Check password
      logger.debug("Verifying password");
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        logger.warn(`Login failed: Invalid password for user ${email}`);
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Generate token
      logger.debug("Generating JWT token");
      const token = JwtUtils.generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
      });

      // Return user data without password
      const userObject = user.toObject();
      const { password: _, ...userWithoutPassword } = userObject;

      logger.info(`User logged in successfully: ${user.email}`);
      res.json({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      logger.error("Login process failed:", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      res.status(500).json({ error: "Login failed" });
    }
  }
);

export default router;
