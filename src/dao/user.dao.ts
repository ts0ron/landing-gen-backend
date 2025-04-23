import { MongoDataAccessObject } from "./mongo.dao";
import { IUser, User } from "../models/user.model";
import { logger } from "../utils/logger";

/**
 * User Data Access Object
 * Handles all database operations for users
 */
export class UserDAO extends MongoDataAccessObject<IUser> {
  private static instance: UserDAO;

  private constructor() {
    super(User);
    logger.info("UserDAO initialized");
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): UserDAO {
    if (!UserDAO.instance) {
      UserDAO.instance = new UserDAO();
    }
    return UserDAO.instance;
  }

  /**
   * Find a user by email
   * @param email - User's email address
   */
  async findByEmail(email: string): Promise<IUser | null> {
    logger.debug(`Finding user by email: ${email}`);
    return this.findOne({ email: email.toLowerCase() });
  }

  /**
   * Create a new user with validation
   * @param userData - User data to create
   */
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    logger.debug("Creating new user:", { email: userData.email });

    // Check if email already exists
    const existingUser = await this.findByEmail(userData.email!);
    if (existingUser) {
      logger.warn(
        `User creation failed: Email ${userData.email} already exists`
      );
      throw new Error("Email already registered");
    }

    // Create user
    const user = await this.create(userData);
    logger.info(`User created with ID: ${user._id}`);
    return user;
  }

  /**
   * Update user by ID
   * @param id - User ID
   * @param userData - User data to update
   */
  async updateUser(
    id: string,
    userData: Partial<IUser>
  ): Promise<IUser | null> {
    logger.debug(`Updating user ${id}:`, userData);

    // Remove password from update data if not modified
    if (userData.password === undefined) {
      delete userData.password;
    }

    const user = await this.update(id, userData);
    if (user) {
      logger.info(`User ${id} updated successfully`);
    } else {
      logger.warn(`User update failed: User ${id} not found`);
    }
    return user;
  }

  /**
   * Delete user by ID
   * @param id - User ID
   */
  async deleteUser(id: string): Promise<IUser | null> {
    logger.debug(`Deleting user: ${id}`);

    const user = await this.delete(id);
    if (user) {
      logger.info(`User ${id} deleted successfully`);
    } else {
      logger.warn(`User deletion failed: User ${id} not found`);
    }
    return user;
  }
}
