'use client';

import { useState, useCallback } from 'react';
import { userStatsService } from '../services/userStats.service';
import type {
  UserStats,
  UserDashboard,
  DailyActivity,
} from '../types/userStats.types';

interface UseDashboardReturn {
  stats: UserStats | null;
  dashboard: UserDashboard | null;
  dailyActivity: DailyActivity[];
  isLoading: boolean;
  error: string | null;
  getUserStats: (userId: string) => Promise<void>;
  getUserDashboard: (userId: string) => Promise<void>;
  getDailyActivity: (userId: string, params?: { startDate?: string; endDate?: string }) => Promise<void>;
  clearError: () => void;
}

export const useDashboard = (): UseDashboardReturn => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [dashboard, setDashboard] = useState<UserDashboard | null>(null);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getUserStats = useCallback(async (userId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userStatsService.getUserStats(userId);
      
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch user stats';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserDashboard = useCallback(async (userId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userStatsService.getUserDashboard(userId);
      
      if (response.success && response.data) {
        setDashboard(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch dashboard';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDailyActivity = useCallback(async (userId: string, params?: { startDate?: string; endDate?: string }): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userStatsService.getDailyActivity(userId, params);
      
      if (response.success && response.data) {
        setDailyActivity(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch daily activity';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    stats,
    dashboard,
    dailyActivity,
    isLoading,
    error,
    getUserStats,
    getUserDashboard,
    getDailyActivity,
    clearError,
  };
};
