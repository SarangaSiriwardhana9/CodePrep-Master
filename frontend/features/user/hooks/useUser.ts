'use client';

import { useState, useCallback } from 'react';
import { userService } from '../services/user.service';
import type {
  UpdateUserInput,
  UserProfile,
} from '../types/user.types';

interface UseUserReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  getUserProfile: () => Promise<UserProfile | null>;
  updateProfile: (data: UpdateUserInput) => Promise<UserProfile | null>;
  deleteAccount: () => Promise<boolean>;
  clearError: () => void;
}

export const useUser = (): UseUserReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userService.getUserProfile();
      
      if (response.success && response.user) {
        setProfile(response.user);
        return response.user;
      }
      
      return null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch profile';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateUserInput): Promise<UserProfile | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userService.updateUserProfile(data);
      
      if (response.success && response.user) {
        setProfile(response.user);
        return response.user;
      }
      
      return null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to update profile';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAccount = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userService.deleteUserAccount();
      
      if (response.success) {
        setProfile(null);
        return true;
      }
      
      return false;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to delete account';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    profile,
    isLoading,
    error,
    getUserProfile,
    updateProfile,
    deleteAccount,
    clearError,
  };
};
