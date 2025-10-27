'use client';

import { useState, useCallback } from 'react';
import { problemService } from '../services/problem.service';
import type {
  Problem,
  CreateProblemInput,
  UpdateProblemInput,
} from '../types/problem.types';

interface UseProblemReturn {
  problem: Problem | null;
  isLoading: boolean;
  error: string | null;
  getProblemById: (id: string) => Promise<Problem | null>;
  createProblem: (data: CreateProblemInput) => Promise<Problem | null>;
  updateProblem: (id: string, data: UpdateProblemInput) => Promise<Problem | null>;
  deleteProblem: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useProblem = (): UseProblemReturn => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getProblemById = useCallback(async (id: string): Promise<Problem | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await problemService.getProblemById(id);
      
      if (response.success && response.data) {
        setProblem(response.data);
        return response.data;
      }
      
      return null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch problem';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProblem = useCallback(async (data: CreateProblemInput): Promise<Problem | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await problemService.createProblem(data);
      
      if (response.success && response.data) {
        setProblem(response.data);
        return response.data;
      }
      
      return null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to create problem';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProblem = useCallback(async (id: string, data: UpdateProblemInput): Promise<Problem | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await problemService.updateProblem(id, data);
      
      if (response.success && response.data) {
        setProblem(response.data);
        return response.data;
      }
      
      return null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to update problem';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProblem = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await problemService.deleteProblem(id);
      
      if (response.success) {
        setProblem(null);
        return true;
      }
      
      return false;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to delete problem';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    problem,
    isLoading,
    error,
    getProblemById,
    createProblem,
    updateProblem,
    deleteProblem,
    clearError,
  };
};
