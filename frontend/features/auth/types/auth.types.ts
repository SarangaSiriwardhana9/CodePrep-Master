export interface User {
  _id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  lastLogin?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface JwtPayload {
  id: string;
  email: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  user?: User;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
