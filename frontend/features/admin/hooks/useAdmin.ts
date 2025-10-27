'use client';

import { useState, useCallback } from 'react';
import { adminService } from '../services/admin.service';
import type {
  AdminDashboard,
  UserManagement,
  ModerationReport,
  UpdateUserStatusInput,
  UpdateProblemStatusInput,
  ResolveModerationInput,
  SystemConfigInput,
  BulkActionInput,
} from '../types/admin.types';

interface UseAdminReturn {
  dashboard: AdminDashboard | null;
  users: UserManagement[];
  reports: ModerationReport[];
  isLoading: boolean;
  error: string | null;
  getDashboard: () => Promise<void>;
  getUsers: (params?: { page?: number; limit?: number }) => Promise<void>;
  updateUserStatus: (userId: string, data: UpdateUserStatusInput) => Promise<boolean>;
  getReports: (params?: { page?: number; limit?: number }) => Promise<void>;
  resolveReport: (reportId: string, data: ResolveModerationInput) => Promise<boolean>;
  updateSystemConfig: (data: SystemConfigInput) => Promise<boolean>;
  bulkAction: (data: BulkActionInput) => Promise<boolean>;
  clearError: () => void;
}

export const useAdmin = (): UseAdminReturn => {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getDashboard = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adminService.getDashboard();
      
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

  const getUsers = useCallback(async (params?: { page?: number; limit?: number }): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adminService.getUsers(params);
      
      if (response.success && response.data) {
        setUsers(response.data.users);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch users';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserStatus = useCallback(async (userId: string, data: UpdateUserStatusInput): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adminService.updateUserStatus(userId, data);
      return response.success;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to update user status';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getReports = useCallback(async (params?: { page?: number; limit?: number }): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adminService.getReports(params);
      
      if (response.success && response.data) {
        setReports(response.data.reports);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch reports';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resolveReport = useCallback(async (reportId: string, data: ResolveModerationInput): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adminService.resolveReport(reportId, data);
      return response.success;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to resolve report';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSystemConfig = useCallback(async (data: SystemConfigInput): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adminService.updateSystemConfig(data);
      return response.success;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to update system config';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bulkAction = useCallback(async (data: BulkActionInput): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adminService.bulkAction(data);
      return response.success;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to perform bulk action';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    dashboard,
    users,
    reports,
    isLoading,
    error,
    getDashboard,
    getUsers,
    updateUserStatus,
    getReports,
    resolveReport,
    updateSystemConfig,
    bulkAction,
    clearError,
  };
};
