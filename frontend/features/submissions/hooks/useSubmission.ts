'use client';

import { useState, useCallback } from 'react';
import { submissionService } from '../services/submission.service';
import type {
  Submission,
  SubmissionInput,
  SubmissionStats,
  ProblemSubmissionStats,
  UpdateSubmissionFeedbackInput,
} from '../types/submission.types';

interface UseSubmissionReturn {
  submission: Submission | null;
  submissions: Submission[];
  stats: SubmissionStats | null;
  problemStats: ProblemSubmissionStats | null;
  isLoading: boolean;
  error: string | null;
  submitSolution: (data: SubmissionInput) => Promise<Submission | null>;
  getSubmissionById: (id: string) => Promise<Submission | null>;
  getUserSubmissions: (params?: { page?: number; limit?: number }) => Promise<void>;
  getUserSubmissionStats: () => Promise<void>;
  getProblemSubmissions: (problemId: string, params?: { page?: number; limit?: number }) => Promise<void>;
  getProblemAcceptanceStats: (problemId: string) => Promise<void>;
  deleteSubmission: (id: string) => Promise<boolean>;
  updateSubmissionFeedback: (id: string, data: UpdateSubmissionFeedbackInput) => Promise<Submission | null>;
  clearError: () => void;
}

export const useSubmission = (): UseSubmissionReturn => {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<SubmissionStats | null>(null);
  const [problemStats, setProblemStats] = useState<ProblemSubmissionStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const submitSolution = useCallback(async (data: SubmissionInput): Promise<Submission | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await submissionService.submitSolution(data);
      
      if (response.success && response.data) {
        setSubmission(response.data);
        return response.data;
      }
      
      return null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to submit solution';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSubmissionById = useCallback(async (id: string): Promise<Submission | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await submissionService.getSubmissionById(id);
      
      if (response.success && response.data) {
        setSubmission(response.data);
        return response.data;
      }
      
      return null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch submission';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserSubmissions = useCallback(async (params?: { page?: number; limit?: number }): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await submissionService.getUserSubmissions(params);
      
      if (response.success && response.data) {
        setSubmissions(response.data.submissions);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch submissions';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserSubmissionStats = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await submissionService.getUserSubmissionStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch submission stats';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProblemSubmissions = useCallback(async (problemId: string, params?: { page?: number; limit?: number }): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await submissionService.getProblemSubmissions(problemId, params);
      
      if (response.success && response.data) {
        setSubmissions(response.data.submissions);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch problem submissions';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProblemAcceptanceStats = useCallback(async (problemId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await submissionService.getProblemAcceptanceStats(problemId);
      
      if (response.success && response.data) {
        setProblemStats(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch problem stats';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSubmission = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await submissionService.deleteSubmission(id);
      
      if (response.success) {
        setSubmission(null);
        return true;
      }
      
      return false;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to delete submission';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSubmissionFeedback = useCallback(async (id: string, data: UpdateSubmissionFeedbackInput): Promise<Submission | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await submissionService.updateSubmissionFeedback(id, data);
      
      if (response.success && response.data) {
        setSubmission(response.data);
        return response.data;
      }
      
      return null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to update feedback';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    submission,
    submissions,
    stats,
    problemStats,
    isLoading,
    error,
    submitSolution,
    getSubmissionById,
    getUserSubmissions,
    getUserSubmissionStats,
    getProblemSubmissions,
    getProblemAcceptanceStats,
    deleteSubmission,
    updateSubmissionFeedback,
    clearError,
  };
};
