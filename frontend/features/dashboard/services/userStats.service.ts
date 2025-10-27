import apiClient from '@/core/api/axios.config';
import { API_ENDPOINTS } from '@/shared/constants/api.constants';
import type {
  UserStatsResponse,
  UserDashboardResponse,
  DailyActivityResponse,
  UpdateUserProfileInput,
} from '../types/userStats.types';

export const userStatsService = {
  getUserStats: async (userId: string): Promise<UserStatsResponse> => {
    const response = await apiClient.get<UserStatsResponse>(
      API_ENDPOINTS.USER_STATS.GET(userId)
    );
    return response.data;
  },

  updateUserStats: async (userId: string, data: any): Promise<UserStatsResponse> => {
    const response = await apiClient.patch<UserStatsResponse>(
      API_ENDPOINTS.USER_STATS.UPDATE(userId),
      data
    );
    return response.data;
  },

  getUserDashboard: async (userId: string): Promise<UserDashboardResponse> => {
    const response = await apiClient.get<UserDashboardResponse>(
      API_ENDPOINTS.USER_STATS.DASHBOARD(userId)
    );
    return response.data;
  },

  getUserAchievements: async (userId: string): Promise<any> => {
    const response = await apiClient.get(
      API_ENDPOINTS.USER_STATS.ACHIEVEMENTS(userId)
    );
    return response.data;
  },

  getConceptMastery: async (userId: string): Promise<any> => {
    const response = await apiClient.get(
      API_ENDPOINTS.USER_STATS.CONCEPT_MASTERY(userId)
    );
    return response.data;
  },

  getDailyActivity: async (userId: string, params?: { startDate?: string; endDate?: string }): Promise<DailyActivityResponse> => {
    const response = await apiClient.get<DailyActivityResponse>(
      API_ENDPOINTS.USER_STATS.DAILY_ACTIVITY(userId),
      { params }
    );
    return response.data;
  },

  compareUsers: async (userId: string, compareWithId: string): Promise<any> => {
    const response = await apiClient.get(
      API_ENDPOINTS.USER_STATS.COMPARE(userId, compareWithId)
    );
    return response.data;
  },
};
