import apiClient from '@/core/api/axios.config';
import { API_ENDPOINTS } from '@/shared/constants/api.constants';
import type {
  Problem,
  CreateProblemInput,
  UpdateProblemInput,
  ProblemFilterQuery,
  ProblemsResponse,
  ProblemResponse,
  ProblemStatsResponse,
} from '../types/problem.types';

export const problemService = {
  getAllProblems: async (filters?: ProblemFilterQuery): Promise<ProblemsResponse> => {
    const response = await apiClient.get<ProblemsResponse>(
      API_ENDPOINTS.PROBLEM.GET_ALL,
      { params: filters }
    );
    return response.data;
  },

  getProblemById: async (id: string): Promise<ProblemResponse> => {
    const response = await apiClient.get<ProblemResponse>(
      API_ENDPOINTS.PROBLEM.GET_BY_ID(id)
    );
    return response.data;
  },

  createProblem: async (data: CreateProblemInput): Promise<ProblemResponse> => {
    const response = await apiClient.post<ProblemResponse>(
      API_ENDPOINTS.PROBLEM.CREATE,
      data
    );
    return response.data;
  },

  updateProblem: async (id: string, data: UpdateProblemInput): Promise<ProblemResponse> => {
    const response = await apiClient.patch<ProblemResponse>(
      API_ENDPOINTS.PROBLEM.UPDATE(id),
      data
    );
    return response.data;
  },

  deleteProblem: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(
      API_ENDPOINTS.PROBLEM.DELETE(id)
    );
    return response.data;
  },

  getProblemStats: async (): Promise<ProblemStatsResponse> => {
    const response = await apiClient.get<ProblemStatsResponse>(
      API_ENDPOINTS.PROBLEM.STATS
    );
    return response.data;
  },

  searchProblems: async (query: string, filters?: ProblemFilterQuery): Promise<ProblemsResponse> => {
    const response = await apiClient.get<ProblemsResponse>(
      API_ENDPOINTS.PROBLEM.SEARCH,
      { params: { search: query, ...filters } }
    );
    return response.data;
  },

  getProblemsByConcept: async (concept: string, filters?: ProblemFilterQuery): Promise<ProblemsResponse> => {
    const response = await apiClient.get<ProblemsResponse>(
      API_ENDPOINTS.PROBLEM.BY_CONCEPT(concept),
      { params: filters }
    );
    return response.data;
  },
};
