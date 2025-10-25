 
export interface User {
  name: string;
  email: string;
  password: string;
  loginAttempts?: number;
  lastLoginAttempt?: Date | null;
  lockedUntil?: Date | null;
  lastLogin?: Date | null;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JwtPayload {
  id: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  user?: Omit<User, 'password' | 'resetToken' | 'resetTokenExpiry'> & { _id?: string };
}