import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authService } from '@/features/auth/services/auth.service';
import type { User, SignupRequest, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest } from '@/features/auth/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signup: (data: SignupRequest) => Promise<any>;
  login: (data: LoginRequest) => Promise<any>;
  logout: () => Promise<void>;
  getProfile: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<boolean>;
  resetPassword: (data: ResetPasswordRequest) => Promise<boolean>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isLoading: false,
        error: null,
        isInitialized: false,

        setUser: (user) => set({ user }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        clearError: () => set({ error: null }),

        signup: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.signup(data);
            if (response.success && response.user) {
              set({ user: response.user, isLoading: false });
            } else {
              set({ isLoading: false, error: 'Signup failed' });
            }
            return response;
          } catch (err: any) {
            const errorMessage = err.response?.data?.error?.message || 'Signup failed';
            set({ error: errorMessage, isLoading: false });
            return null;
          }
        },

        login: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.login(data);
            if (response.success && response.user) {
              set({ user: response.user, isLoading: false });
            } else {
              set({ isLoading: false, error: 'Login failed' });
            }
            return response;
          } catch (err: any) {
            const errorMessage = err.response?.data?.error?.message || 'Login failed';
            set({ error: errorMessage, isLoading: false });
            return null;
          }
        },

        logout: async () => {
          set({ isLoading: true });
          try {
            await authService.logout();
            set({ user: null, isLoading: false, error: null });
          } catch (err: any) {
            set({ user: null, isLoading: false });
            console.error('Logout error:', err);
          }
        },

        getProfile: async () => {
          const token = authService.getAccessToken();
          if (!token) {
            set({ user: null, isInitialized: true });
            return;
          }

          set({ isLoading: true, error: null });
          try {
            const response = await authService.getProfile();
            if (response.success && response.user) {
              set({ user: response.user, isLoading: false, isInitialized: true });
            } else {
              set({ user: null, isLoading: false, isInitialized: true });
            }
          } catch (err: any) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
            }
            set({ user: null, isLoading: false, isInitialized: true });
            console.error('Failed to load user profile:', err);
          }
        },

        forgotPassword: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.forgotPassword(data);
            set({ isLoading: false });
            return response.success;
          } catch (err: any) {
            const errorMessage = err.response?.data?.error?.message || 'Failed to send reset email';
            set({ error: errorMessage, isLoading: false });
            return false;
          }
        },

        resetPassword: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.resetPassword(data);
            set({ isLoading: false });
            return response.success;
          } catch (err: any) {
            const errorMessage = err.response?.data?.error?.message || 'Failed to reset password';
            set({ error: errorMessage, isLoading: false });
            return false;
          }
        },

        initialize: async () => {
          const { isInitialized } = get();
          if (isInitialized) return;

          const token = typeof window !== 'undefined' ? authService.getAccessToken() : null;
          if (token) {
            await get().getProfile();
          } else {
            set({ isInitialized: true, user: null });
          }
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ user: state.user }),
      }
    ),
    { name: 'AuthStore' }
  )
);

export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    isLoading: store.isLoading || !store.isInitialized,
    isAuthenticated: !!store.user,
    error: store.error,
    signup: store.signup,
    login: store.login,
    logout: store.logout,
    getProfile: store.getProfile,
    forgotPassword: store.forgotPassword,
    resetPassword: store.resetPassword,
    clearError: store.clearError,
    initialize: store.initialize,
  };
};

