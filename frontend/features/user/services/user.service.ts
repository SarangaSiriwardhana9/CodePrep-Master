import apiClient from '@/core/api/axios.config';
import { API_ENDPOINTS } from '@/shared/constants/api.constants';
import type {
  UpdateUserInput,
  UserProfileResponse,
  UpdateUserResponse,
  DeleteAccountResponse,
} from '../types/user.types';

export const userService = {
  getUserProfile: async (): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>(
      API_ENDPOINTS.USER.PROFILE
    );
    return response.data;
  },

  updateUserProfile: async (data: UpdateUserInput): Promise<UpdateUserResponse> => {
    const response = await apiClient.patch<UpdateUserResponse>(
      API_ENDPOINTS.USER.UPDATE_PROFILE,
      data
    );
    return response.data;
  },

  deleteUserAccount: async (): Promise<DeleteAccountResponse> => {
    const response = await apiClient.delete<DeleteAccountResponse>(
      API_ENDPOINTS.USER.DELETE_ACCOUNT
    );
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    return response.data;
  },
};
