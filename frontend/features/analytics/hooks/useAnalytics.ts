'use client';

import { useState, useCallback } from 'react';
import { analyticsService } from '../services/analytics.service';
import type {
  UserAnalytics,
  PlatformAnalytics,
  ProblemAnalytics,
  AnalyticsInput,
} from '../types/analytics.types';

interface UseAnalyticsReturn {
  userAnalytics: UserAnalytics | null;
  platformAnalytics: PlatformAnalytics | null;
  problemAnalytics: ProblemAnalytics | null;
  isLoading: boolean;
  error: string | null;
  getUserAnalytics: (userId: string, params?: AnalyticsInput) => Promise<void>;
  getPlatformAnalytics: (params?: AnalyticsInput) => Promise<void>;
  getProblemAnalytics: (problemId: string, params?: AnalyticsInput) => Promise<void>;
  clearError: () => void;
}

export const useAnalytics = (): UseAnalyticsReturn => {
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [platformAnalytics, setPlatformAnalytics] = useState<PlatformAnalytics | null>(null);
  const [problemAnalytics, setProblemAnalytics] = useState<ProblemAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getUserAnalytics = useCallback(async (userId: string, params?: AnalyticsInput): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await analyticsService.getUserAnalytics(userId, params);
      
      if (response.success && response.data) {
        setUserAnalytics(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch user analytics';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPlatformAnalytics = useCallback(async (params?: AnalyticsInput): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await analyticsService.getPlatformAnalytics(params);
      
      if (response.success && response.data) {
        setPlatformAnalytics(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch platform analytics';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProblemAnalytics = useCallback(async (problemId: string, params?: AnalyticsInput): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await analyticsService.getProblemAnalytics(problemId, params);
      
      if (response.success && response.data) {
        setProblemAnalytics(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch problem analytics';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    userAnalytics,
    platformAnalytics,
    problemAnalytics,
    isLoading,
    error,
    getUserAnalytics,
    getPlatformAnalytics,
    getProblemAnalytics,
    clearError,
  };
};
