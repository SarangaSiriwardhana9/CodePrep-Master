import apiClient from '@/core/api/axios.config';
import { API_ENDPOINTS } from '@/shared/constants/api.constants';
import type {
  AdminDashboardResponse,
  UsersListResponse,
  ModerationReportsResponse,
  UpdateUserStatusInput,
  UpdateProblemStatusInput,
  ResolveModerationInput,
  SystemConfigInput,
  BulkActionInput,
} from '../types/admin.types';

export const adminService = {
  getDashboard: async (): Promise<AdminDashboardResponse> => {
    const response = await apiClient.get<AdminDashboardResponse>(
      API_ENDPOINTS.ADMIN.DASHBOARD
    );
    return response.data;
  },

  getUsers: async (params?: { page?: number; limit?: number; status?: string; role?: string; search?: string }): Promise<UsersListResponse> => {
    const limit = params?.limit || 20;
    const page = params?.page || 1;
    const skip = (page - 1) * limit;

    const queryParams: any = {
      limit,
      skip,
    };

    if (params?.status) queryParams.status = params.status;
    if (params?.role) queryParams.role = params.role;
    if (params?.search) queryParams.search = params.search;

    const response = await apiClient.get<UsersListResponse>(
      API_ENDPOINTS.ADMIN.USERS,
      { params: queryParams }
    );

    if (response.data.success && response.data.data?.pagination) {
      response.data.data.pagination.page = page;
    }

    return response.data;
  },

  updateUserStatus: async (userId: string, data: UpdateUserStatusInput): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch(
      API_ENDPOINTS.ADMIN.UPDATE_USER_STATUS(userId),
      data
    );
    return response.data;
  },

  getProblems: async (params?: { page?: number; limit?: number }): Promise<any> => {
    const response = await apiClient.get(
      API_ENDPOINTS.ADMIN.PROBLEMS,
      { params }
    );
    return response.data;
  },

  updateProblemStatus: async (problemId: string, data: UpdateProblemStatusInput): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch(
      API_ENDPOINTS.ADMIN.UPDATE_PROBLEM_STATUS(problemId),
      data
    );
    return response.data;
  },

  getReports: async (params?: { page?: number; limit?: number }): Promise<ModerationReportsResponse> => {
    const response = await apiClient.get<ModerationReportsResponse>(
      API_ENDPOINTS.ADMIN.REPORTS,
      { params }
    );
    return response.data;
  },

  resolveReport: async (reportId: string, data: ResolveModerationInput): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch(
      API_ENDPOINTS.ADMIN.RESOLVE_REPORT(reportId),
      data
    );
    return response.data;
  },

  getActionLogs: async (params?: { page?: number; limit?: number }): Promise<any> => {
    const response = await apiClient.get(
      API_ENDPOINTS.ADMIN.ACTION_LOGS,
      { params }
    );
    return response.data;
  },

  updateSystemConfig: async (data: SystemConfigInput): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch(
      API_ENDPOINTS.ADMIN.SYSTEM_CONFIG,
      data
    );
    return response.data;
  },

  bulkAction: async (data: BulkActionInput): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ADMIN.BULK_ACTION,
      data
    );
    return response.data;
  },
};
