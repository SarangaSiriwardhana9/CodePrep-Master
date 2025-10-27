import apiClient from '@/core/api/axios.config';
import { API_ENDPOINTS } from '@/shared/constants/api.constants';
import type {
  SubmissionInput,
  SubmissionResponse,
  SubmissionsListResponse,
  SubmissionStatsResponse,
  ProblemSubmissionStatsResponse,
  UpdateSubmissionFeedbackInput,
} from '../types/submission.types';

export const submissionService = {
  submitSolution: async (data: SubmissionInput): Promise<SubmissionResponse> => {
    const response = await apiClient.post<SubmissionResponse>(
      API_ENDPOINTS.SUBMISSION.SUBMIT,
      data
    );
    return response.data;
  },

  getSubmissionById: async (id: string): Promise<SubmissionResponse> => {
    const response = await apiClient.get<SubmissionResponse>(
      API_ENDPOINTS.SUBMISSION.GET_BY_ID(id)
    );
    return response.data;
  },

  getUserSubmissions: async (params?: { page?: number; limit?: number }): Promise<SubmissionsListResponse> => {
    const response = await apiClient.get<SubmissionsListResponse>(
      API_ENDPOINTS.SUBMISSION.GET_USER_SUBMISSIONS,
      { params }
    );
    return response.data;
  },

  getUserSubmissionStats: async (): Promise<SubmissionStatsResponse> => {
    const response = await apiClient.get<SubmissionStatsResponse>(
      API_ENDPOINTS.SUBMISSION.GET_USER_STATS
    );
    return response.data;
  },

  deleteSubmission: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(
      API_ENDPOINTS.SUBMISSION.DELETE(id)
    );
    return response.data;
  },

  getProblemSubmissions: async (problemId: string, params?: { page?: number; limit?: number }): Promise<SubmissionsListResponse> => {
    const response = await apiClient.get<SubmissionsListResponse>(
      API_ENDPOINTS.SUBMISSION.GET_PROBLEM_SUBMISSIONS(problemId),
      { params }
    );
    return response.data;
  },

  getProblemAcceptanceStats: async (problemId: string): Promise<ProblemSubmissionStatsResponse> => {
    const response = await apiClient.get<ProblemSubmissionStatsResponse>(
      API_ENDPOINTS.SUBMISSION.GET_PROBLEM_STATS(problemId)
    );
    return response.data;
  },

  updateSubmissionFeedback: async (id: string, data: UpdateSubmissionFeedbackInput): Promise<SubmissionResponse> => {
    const response = await apiClient.patch<SubmissionResponse>(
      API_ENDPOINTS.SUBMISSION.UPDATE_FEEDBACK(id),
      data
    );
    return response.data;
  },
};
