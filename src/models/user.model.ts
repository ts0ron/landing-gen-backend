import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import { logger } from "../utils/logger";

/**
 * User document interface
 */
export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * User schema definition
 */
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Password hash middleware
 */
UserSchema.pre("save", async function (next) {
  const user = this;

  // Only hash the password if it has been modified
  if (!user.isModified("password")) {
    return next();
  }

  try {
    logger.debug(`Hashing password for user: ${user.email}`);

    // Generate salt
    const salt = await bcrypt.genSalt(10);

    // Hash password
    const hashedPassword = await bcrypt.hash(user.password, salt);

    // Replace plaintext password with hash
    user.password = hashedPassword;
    next();
  } catch (error) {
    logger.error(
      `Password hashing failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    next(error);
  }
});

/**
 * Password comparison method
 */
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    logger.error(
      `Password comparison failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    throw error;
  }
};

// Create and export the User model
export const User = mongoose.model<IUser>("User", UserSchema);
