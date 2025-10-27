export type SubmissionStatus = 
  | 'accepted' 
  | 'wrong_answer' 
  | 'runtime_error' 
  | 'time_limit_exceeded' 
  | 'memory_limit_exceeded' 
  | 'pending';

export type ProgrammingLanguage = 'javascript' | 'python' | 'java' | 'cpp';

export interface SubmissionInput {
  problemId: string;
  code: string;
  language: ProgrammingLanguage;
  testCasesPassed?: number;
  totalTestCases?: number;
  executionTime?: number;
  memoryUsed?: number;
}

export interface Submission {
  _id: string;
  userId: string;
  problemId: string;
  code: string;
  language: ProgrammingLanguage;
  status: SubmissionStatus;
  testCasesPassed: number;
  totalTestCases: number;
  executionTime: number;
  memoryUsed: number;
  feedback?: string;
  submittedAt: Date | string;
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
  data: Submission;
}

export interface SubmissionsListResponse {
  success: boolean;
  message: string;
  data: {
    submissions: Submission[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface SubmissionStats {
  totalSubmissions: number;
  acceptedSubmissions: number;
  rejectedSubmissions: number;
  acceptanceRate: number;
  lastSubmission?: Date | string;
  averageExecutionTime: number;
  averageMemoryUsed: number;
}

export interface SubmissionStatsResponse {
  success: boolean;
  message: string;
  data: SubmissionStats;
}

export interface ProblemSubmissionStats {
  problemId: string;
  title: string;
  totalSubmissions: number;
  acceptedCount: number;
  rejectionRate: number;
  averageExecutionTime: number;
}

export interface ProblemSubmissionStatsResponse {
  success: boolean;
  message: string;
  data: ProblemSubmissionStats;
}

export interface UpdateSubmissionFeedbackInput {
  feedback: string;
}
