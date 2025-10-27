import apiClient from '@/core/api/axios.config';
import { API_ENDPOINTS } from '@/shared/constants/api.constants';
import type {
  SignupRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  ProfileResponse,
} from '../types/auth.types';

export const authService = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.SIGNUP,
      data
    );
    
    // Store tokens in localStorage
    if (response.data.token) {
      localStorage.setItem('accessToken', response.data.token);
    }
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );
    
    if (response.data.token) {
      localStorage.setItem('accessToken', response.data.token);
    }
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data;
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    return response.data;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN
    );
    
    if (response.data.token) {
      localStorage.setItem('accessToken', response.data.token);
    }
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data;
  },

  getProfile: async (): Promise<ProfileResponse> => {
    const response = await apiClient.get<ProfileResponse>(
      API_ENDPOINTS.AUTH.PROFILE
    );
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      data
    );
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    );
    return response.data;
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('accessToken');
    return !!token;
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },
};
