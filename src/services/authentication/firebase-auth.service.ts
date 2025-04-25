import { firebaseAuth } from "../../config/firebase.config";
import { Role } from "../../models/auth/role";
import { logger } from "../../utils/logger";
import {
  AuthenticationService,
  UserCredentials,
  AuthenticationResult,
  AuthenticatedUser,
} from "./authentication.service";

export class FirebaseAuthService implements AuthenticationService {
  async signUp(credentials: UserCredentials): Promise<AuthenticationResult> {
    try {
      const userRecord = await firebaseAuth.createUser({
        email: credentials.email,
        password: credentials.password,
      });

      // Set default custom claims (role)
      await firebaseAuth.setCustomUserClaims(userRecord.uid, {
        role: Role.CONSUMER,
      });

      const token = await firebaseAuth.createCustomToken(userRecord.uid);

      const user: AuthenticatedUser = {
        id: userRecord.uid,
        email: userRecord.email!,
        role: Role.CONSUMER,
      };

      return { user, token };
    } catch (error) {
      logger.error("Error creating user:", error);
      throw error;
    }
  }

  async signIn(credentials: UserCredentials): Promise<AuthenticationResult> {
    try {
      const userRecord = await firebaseAuth.getUserByEmail(credentials.email);
      const customClaims = (userRecord.customClaims || {}) as { role?: Role };

      const token = await firebaseAuth.createCustomToken(userRecord.uid);

      const user: AuthenticatedUser = {
        id: userRecord.uid,
        email: userRecord.email!,
        role: customClaims.role || Role.CONSUMER,
      };

      return { user, token };
    } catch (error) {
      logger.error("Error signing in user:", error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<AuthenticatedUser | null> {
    try {
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      const userRecord = await firebaseAuth.getUser(decodedToken.uid);
      const customClaims = (userRecord.customClaims || {}) as { role?: Role };

      return {
        id: userRecord.uid,
        email: userRecord.email!,
        role: customClaims.role || Role.CONSUMER,
      };
    } catch (error) {
      logger.error("Error verifying token:", error);
      return null;
    }
  }

  async getUserById(userId: string): Promise<AuthenticatedUser | null> {
    try {
      const userRecord = await firebaseAuth.getUser(userId);
      const customClaims = (userRecord.customClaims || {}) as { role?: Role };

      return {
        id: userRecord.uid,
        email: userRecord.email!,
        role: customClaims.role || Role.CONSUMER,
      };
    } catch (error) {
      logger.error("Error getting user by ID:", error);
      return null;
    }
  }
}
