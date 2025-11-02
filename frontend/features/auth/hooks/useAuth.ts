'use client';

import { useState, useCallback } from 'react';
import { authService } from '../services/auth.service';
import type {
  SignupRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User,
  AuthResponse,
} from '../types/auth.types';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signup: (data: SignupRequest) => Promise<AuthResponse | null>;
  login: (data: LoginRequest) => Promise<AuthResponse | null>;
  logout: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<boolean>;
  resetPassword: (data: ResetPasswordRequest) => Promise<boolean>;
  getProfile: () => Promise<User | null>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signup = useCallback(async (data: SignupRequest): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.signup(data);
      
      if (response.success && response.user) {
        setUser(response.user);
      }
      
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Signup failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (data: LoginRequest): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(data);
      
      if (response.success && response.user) {
        setUser(response.user);
      }
      
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Login failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.logout();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Logout failed';
      setError(errorMessage);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (data: ForgotPasswordRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.forgotPassword(data);
      return response.success;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to send reset email';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.resetPassword(data);
      return response.success;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to reset password';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProfile = useCallback(async (): Promise<User | null> => {
    const token = authService.getAccessToken();
    if (!token) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.getProfile();
      
      if (response.success && response.user) {
        setUser(response.user);
        return response.user;
      }
      
      setUser(null);
      return null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch profile';
      setError(errorMessage);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    signup,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getProfile,
    clearError,
  };
};
