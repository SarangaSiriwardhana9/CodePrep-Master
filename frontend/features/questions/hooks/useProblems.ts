'use client';

import { useState, useCallback } from 'react';
import { problemService } from '../services/problem.service';
import type {
  Problem,
  ProblemFilterQuery,
  CreateProblemInput,
  UpdateProblemInput,
  PaginationInfo,
  ProblemStats,
} from '../types/problem.types';

interface UseProblemsReturn {
  problems: Problem[];
  pagination: PaginationInfo | null;
  stats: ProblemStats | null;
  isLoading: boolean;
  error: string | null;
  getAllProblems: (filters?: ProblemFilterQuery) => Promise<void>;
  searchProblems: (query: string, filters?: ProblemFilterQuery) => Promise<void>;
  getProblemsByConcept: (concept: string, filters?: ProblemFilterQuery) => Promise<void>;
  getProblemStats: () => Promise<void>;
  clearError: () => void;
}

export const useProblems = (): UseProblemsReturn => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [stats, setStats] = useState<ProblemStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getAllProblems = useCallback(async (filters?: ProblemFilterQuery): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await problemService.getAllProblems(filters);
      
      if (response.success) {
        setProblems(response.data.problems);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch problems';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchProblems = useCallback(async (query: string, filters?: ProblemFilterQuery): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await problemService.searchProblems(query, filters);
      
      if (response.success) {
        setProblems(response.data.problems);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to search problems';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProblemsByConcept = useCallback(async (concept: string, filters?: ProblemFilterQuery): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await problemService.getProblemsByConcept(concept, filters);
      
      if (response.success) {
        setProblems(response.data.problems);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch problems by concept';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProblemStats = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await problemService.getProblemStats();
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch problem stats';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    problems,
    pagination,
    stats,
    isLoading,
    error,
    getAllProblems,
    searchProblems,
    getProblemsByConcept,
    getProblemStats,
    clearError,
  };
};
