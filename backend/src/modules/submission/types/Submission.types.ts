export interface SubmissionInput {
  problemId: string;
  code: string;
  language: 'javascript' | 'python' | 'java' | 'cpp';
  testCasesPassed?: number;
  totalTestCases?: number;
  executionTime?: number;
  memoryUsed?: number;
}

export interface SubmissionResponse {
  _id: string;
  userId: string;
  problemId: string;
  code: string;
  language: 'javascript' | 'python' | 'java' | 'cpp';
  status: 'accepted' | 'wrong_answer' | 'runtime_error' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'pending';
  testCasesPassed: number;
  totalTestCases: number;
  executionTime: number;
  memoryUsed: number;
  feedback?: string;
  submittedAt: Date;
}

export interface SubmissionStats {
  totalSubmissions: number;
  acceptedSubmissions: number;
  rejectedSubmissions: number;
  acceptanceRate: number;
  lastSubmission?: Date;
  averageExecutionTime: number;
  averageMemoryUsed: number;
}

export interface ProblemSubmissionStats {
  problemId: string;
  title: string;
  totalSubmissions: number;
  acceptedCount: number;
  rejectionRate: number;
  averageExecutionTime: number;
}