export interface AnalyticsInput {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate?: Date;
  endDate?: Date;
}

export interface UserAnalyticsResponse {
  userId: string;
  totalProblems: number;
  totalSubmissions: number;
  acceptanceRate: number;
  averageTimePerProblem: number;
  levelProgression: {
    level: string;
    progress: number;
  };
  skillDistribution: Array<{
    skill: string;
    proficiency: number;
  }>;
  trends: {
    weekly: number[];
    monthly: number[];
  };
}

export interface PlatformAnalyticsResponse {
  totalUsers: number;
  activeUsers: number;
  totalProblems: number;
  totalSubmissions: number;
  averageAcceptanceRate: number;
  topProblems: Array<{
    problemId: string;
    title: string;
    attempts: number;
    acceptanceRate: number;
  }>;
  topContests: Array<{
    contestId: string;
    name: string;
    participants: number;
  }>;
  userGrowth: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
}

export interface ProblemAnalyticsResponse {
  problemId: string;
  title: string;
  difficulty: string;
  totalAttempts: number;
  totalAccepted: number;
  acceptanceRate: number;
  averageTimeSpent: number;
  successTrend: number[];
  languageDistribution: Array<{
    language: string;
    submissions: number;
  }>;
  commonMistakes: string[];
}

export interface ConceptAnalyticsResponse {
  concept: string;
  totalUsers: number;
  usersMastered: number;
  masteryRate: number;
  averageMasteryScore: number;
  difficulty: string;
  trend: {
    increasing: boolean;
    percentageChange: number;
  };
}

export interface ContestAnalyticsResponse {
  contestId: string;
  contestName: string;
  totalParticipants: number;
  averageScore: number;
  topPerformers: Array<{
    rank: 1;
    userName: string;
    score: number;
  }>;
  problemStats: Array<{
    problemId: string;
    acceptanceRate: number;
  }>;
}

export interface PerformanceMetricsResponse {
  apiResponseTime: number;
  serverUptime: number;
  databaseQueryTime: number;
  cacheHitRate: number;
  errorRate: number;
  activeRequests: number;
}

export interface UserBehaviorAnalyticsResponse {
  userId: string;
  totalSessions: number;
  averageSessionDuration: number;
  preferredTimeOfDay: string;
  mostActiveDaysOfWeek: string[];
  preferredDifficulty: string;
  learningPath: {
    conceptsLearned: number;
    conceptsInProgress: number;
  };
  engagementScore: number;
}

export interface ReportResponse {
  reportId: string;
  title: string;
  generatedAt: Date;
  period: string;
  content: any;
  format: 'json' | 'csv' | 'pdf';
}