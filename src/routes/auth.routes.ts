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
import { firebaseAuth } from "../config/firebase.config";
import axios from "axios";

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
router.post("/register", async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;
  try {
    const userRecord = await firebaseAuth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });
    res.status(201).json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

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
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const apiKey = process.env.FIREBASE_API_KEY;
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );
    const { idToken, localId } = response.data;
    res.json({
      uid: localId,
      email,
      idToken, // Firebase ID token
    });
  } catch (error: any) {
    res
      .status(401)
      .json({ error: error.response?.data?.error?.message || error.message });
  }
});

export default router;
