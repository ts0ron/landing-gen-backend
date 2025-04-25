import { Role } from "../../models/auth/role";

export interface UserCredentials {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}

export interface AuthenticationResult {
  user: AuthenticatedUser;
  token: string;
}

export abstract class AuthenticationService {
  abstract signUp(credentials: UserCredentials): Promise<AuthenticationResult>;
  abstract signIn(credentials: UserCredentials): Promise<AuthenticationResult>;
  abstract verifyToken(token: string): Promise<AuthenticatedUser | null>;
  abstract getUserById(userId: string): Promise<AuthenticatedUser | null>;
}
