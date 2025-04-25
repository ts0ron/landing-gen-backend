import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { logger } from "../utils/logger";

// Initialize Firebase Admin
try {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
  logger.info("Firebase Admin initialized successfully");
} catch (error) {
  logger.error("Error initializing Firebase Admin:", error);
  throw error;
}

export const firebaseAuth = getAuth();
