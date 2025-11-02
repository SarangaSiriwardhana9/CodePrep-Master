import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { adminService } from '@/features/admin/services/admin.service';
import type {
  AdminDashboard,
  UserManagement,
  ModerationReport,
  UpdateUserStatusInput,
  UpdateProblemStatusInput,
  ResolveModerationInput,
  SystemConfigInput,
  BulkActionInput,
} from '@/features/admin/types/admin.types';

interface AdminState {
  dashboard: AdminDashboard | null;
  users: UserManagement[];
  reports: ModerationReport[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  filters: {
    status?: string;
    role?: string;
    search?: string;
  };
  isLoading: boolean;
  error: string | null;
  getDashboard: () => Promise<void>;
  getUsers: (params?: { page?: number; limit?: number; status?: string; role?: string; search?: string }) => Promise<void>;
  updateUserStatus: (userId: string, data: UpdateUserStatusInput) => Promise<boolean>;
  getReports: (params?: { page?: number; limit?: number }) => Promise<void>;
  resolveReport: (reportId: string, data: ResolveModerationInput) => Promise<boolean>;
  updateSystemConfig: (data: SystemConfigInput) => Promise<boolean>;
  bulkAction: (data: BulkActionInput) => Promise<boolean>;
  setFilters: (filters: { status?: string; role?: string; search?: string }) => void;
  clearError: () => void;
}

export const useAdminStore = create<AdminState>()(
  devtools(
    (set, get) => ({
      dashboard: null,
      users: [],
      reports: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 20,
        pages: 0,
      },
      filters: {},
      isLoading: false,
      error: null,

      getDashboard: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminService.getDashboard();
          if (response.success && response.data) {
            set({ dashboard: response.data, isLoading: false });
          } else {
            set({ isLoading: false, error: 'Failed to fetch dashboard' });
          }
        } catch (err: any) {
          const errorMessage = err.response?.data?.error?.message || 'Failed to fetch dashboard';
          set({ error: errorMessage, isLoading: false });
        }
      },

      getUsers: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
          const currentFilters = get().filters;
          const queryParams = {
            page: params.page || get().pagination.page,
            limit: params.limit || get().pagination.limit,
            status: params.status || currentFilters.status,
            role: params.role || currentFilters.role,
            search: params.search !== undefined ? params.search : currentFilters.search,
          };

          const response = await adminService.getUsers(queryParams);
          
          if (response.success && response.data) {
            const backendPagination = response.data.pagination;
            const paginationData = backendPagination ? {
              total: backendPagination.total,
              page: queryParams.page || 1,
              limit: backendPagination.limit,
              pages: backendPagination.pages || Math.ceil((backendPagination.total || 0) / backendPagination.limit),
            } : {
              total: response.data.users?.length || 0,
              page: queryParams.page || 1,
              limit: queryParams.limit || 20,
              pages: 1,
            };
            set({
              users: response.data.users || [],
              pagination: paginationData,
              isLoading: false,
            });
          } else {
            set({ isLoading: false, error: 'Failed to fetch users' });
          }
        } catch (err: any) {
          const errorMessage = err.response?.data?.error?.message || 'Failed to fetch users';
          set({ error: errorMessage, isLoading: false });
        }
      },

      updateUserStatus: async (userId: string, data: UpdateUserStatusInput) => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminService.updateUserStatus(userId, data);
          if (response.success) {
            await get().getUsers();
            set({ isLoading: false });
            return true;
          }
          set({ isLoading: false, error: response.message || 'Failed to update user status' });
          return false;
        } catch (err: any) {
          const errorMessage = err.response?.data?.error?.message || 'Failed to update user status';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      getReports: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminService.getReports(params);
          if (response.success && response.data) {
            set({
              reports: response.data.reports,
              pagination: response.data.pagination || get().pagination,
              isLoading: false,
            });
          } else {
            set({ isLoading: false, error: 'Failed to fetch reports' });
          }
        } catch (err: any) {
          const errorMessage = err.response?.data?.error?.message || 'Failed to fetch reports';
          set({ error: errorMessage, isLoading: false });
        }
      },

      resolveReport: async (reportId: string, data: ResolveModerationInput) => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminService.resolveReport(reportId, data);
          if (response.success) {
            await get().getReports();
            set({ isLoading: false });
            return true;
          }
          set({ isLoading: false, error: response.message || 'Failed to resolve report' });
          return false;
        } catch (err: any) {
          const errorMessage = err.response?.data?.error?.message || 'Failed to resolve report';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      updateSystemConfig: async (data: SystemConfigInput) => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminService.updateSystemConfig(data);
          set({ isLoading: false });
          return response.success;
        } catch (err: any) {
          const errorMessage = err.response?.data?.error?.message || 'Failed to update system config';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      bulkAction: async (data: BulkActionInput) => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminService.bulkAction(data);
          if (response.success && data.userIds) {
            await get().getUsers();
          }
          set({ isLoading: false });
          return response.success;
        } catch (err: any) {
          const errorMessage = err.response?.data?.error?.message || 'Failed to perform bulk action';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      setFilters: (filters) => {
        set({ filters });
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'AdminStore' }
  )
);

export const useAdmin = () => {
  const store = useAdminStore();
  return {
    dashboard: store.dashboard,
    users: store.users,
    reports: store.reports,
    pagination: store.pagination,
    filters: store.filters,
    isLoading: store.isLoading,
    error: store.error,
    getDashboard: store.getDashboard,
    getUsers: store.getUsers,
    updateUserStatus: store.updateUserStatus,
    getReports: store.getReports,
    resolveReport: store.resolveReport,
    updateSystemConfig: store.updateSystemConfig,
    bulkAction: store.bulkAction,
    setFilters: store.setFilters,
    clearError: store.clearError,
  };
};

