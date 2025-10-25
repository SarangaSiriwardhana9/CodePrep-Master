export type ContestStatus = 'upcoming' | 'ongoing' | 'ended';
export type ContestDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export interface ContestInput {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  difficulty: ContestDifficulty;
  totalProblems: number;
  problemIds: string[];
  maxParticipants?: number;
  rules?: string;
  rewards?: string;
}

export interface ContestResponse {
  _id: string;
  title: string;
  description: string;
  createdBy: string;
  startTime: Date;
  endTime: Date;
  status: ContestStatus;
  difficulty: ContestDifficulty;
  totalProblems: number;
  problemIds: string[];
  maxParticipants?: number;
  currentParticipants: number;
  rules?: string;
  rewards?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContestParticipantResponse {
  _id: string;
  userId: string;
  userName: string;
  contestId: string;
  joinedAt: Date;
  score: number;
  rank: number;
  solutionsSubmitted: number;
  timeSpent: number;
  totalScore: number;
}

export interface ContestLeaderboardResponse {
  rank: number;
  userId: string;
  userName: string;
  score: number;
  solutionsSubmitted: number;
  timeSpent: number;
  lastSubmissionTime: Date;
}

export interface ContestSubmissionInput {
  problemId: string;
  code: string;
  language: 'javascript' | 'python' | 'java' | 'cpp';
  testCasesPassed: number;
  totalTestCases: number;
  executionTime: number;
  memoryUsed: number;
}

export interface ContestSubmissionResponse {
  _id: string;
  contestId: string;
  userId: string;
  problemId: string;
  code: string;
  language: string;
  status: string;
  score: number;
  testCasesPassed: number;
  totalTestCases: number;
  executionTime: number;
  memoryUsed: number;
  submittedAt: Date;
}

export interface ContestStats {
  totalContests: number;
  participatedContests: number;
  wonContests: number;
  averageRank: number;
  bestRank: number;
  totalScore: number;
  averageScore: number;
}

export interface UpdateContestInput {
  title?: string;
  description?: string;
  difficulty?: ContestDifficulty;
  rules?: string;
  rewards?: string;
  maxParticipants?: number;
}