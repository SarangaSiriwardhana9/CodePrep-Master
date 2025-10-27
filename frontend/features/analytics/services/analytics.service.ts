import apiClient from '@/core/api/axios.config';
import { API_ENDPOINTS } from '@/shared/constants/api.constants';
import type {
  AnalyticsInput,
  UserAnalyticsResponse,
  PlatformAnalyticsResponse,
  ProblemAnalyticsResponse,
} from '../types/analytics.types';

export const analyticsService = {
  getUserAnalytics: async (userId: string, params?: AnalyticsInput): Promise<UserAnalyticsResponse> => {
    const response = await apiClient.get<UserAnalyticsResponse>(
      API_ENDPOINTS.ANALYTICS.USER(userId),
      { params }
    );
    return response.data;
  },

  getPlatformAnalytics: async (params?: AnalyticsInput): Promise<PlatformAnalyticsResponse> => {
    const response = await apiClient.get<PlatformAnalyticsResponse>(
      API_ENDPOINTS.ANALYTICS.PLATFORM,
      { params }
    );
    return response.data;
  },

  getProblemAnalytics: async (problemId: string, params?: AnalyticsInput): Promise<ProblemAnalyticsResponse> => {
    const response = await apiClient.get<ProblemAnalyticsResponse>(
      API_ENDPOINTS.ANALYTICS.PROBLEM(problemId),
      { params }
    );
    return response.data;
  },

  getConceptAnalytics: async (concept: string, params?: AnalyticsInput): Promise<any> => {
    const response = await apiClient.get(
      API_ENDPOINTS.ANALYTICS.CONCEPT(concept),
      { params }
    );
    return response.data;
  },

  getContestAnalytics: async (contestId: string, params?: AnalyticsInput): Promise<any> => {
    const response = await apiClient.get(
      API_ENDPOINTS.ANALYTICS.CONTEST(contestId),
      { params }
    );
    return response.data;
  },

  getPerformanceMetrics: async (): Promise<any> => {
    const response = await apiClient.get(
      API_ENDPOINTS.ANALYTICS.PERFORMANCE
    );
    return response.data;
  },

  getUserBehaviorAnalytics: async (userId: string, params?: AnalyticsInput): Promise<any> => {
    const response = await apiClient.get(
      API_ENDPOINTS.ANALYTICS.USER_BEHAVIOR(userId),
      { params }
    );
    return response.data;
  },

  generateReport: async (data: any): Promise<any> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ANALYTICS.REPORT,
      data
    );
    return response.data;
  },
};
