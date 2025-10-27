export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface AnalyticsInput {
  period: AnalyticsPeriod;
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface UserAnalytics {
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

export interface PlatformAnalytics {
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

export interface ProblemAnalytics {
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

export interface ConceptAnalytics {
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

export interface ContestAnalytics {
  contestId: string;
  contestName: string;
  totalParticipants: number;
  averageScore: number;
  topPerformers: Array<{
    rank: number;
    userName: string;
    score: number;
  }>;
  problemStats: Array<{
    problemId: string;
    acceptanceRate: number;
  }>;
}

export interface PerformanceMetrics {
  apiResponseTime: number;
  serverUptime: number;
  databaseQueryTime: number;
  cacheHitRate: number;
  errorRate: number;
  activeRequests: number;
}

export interface UserBehaviorAnalytics {
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

export interface AnalyticsReport {
  reportId: string;
  title: string;
  generatedAt: Date | string;
  period: string;
  content: any;
  format: 'json' | 'csv' | 'pdf';
}

export interface UserAnalyticsResponse {
  success: boolean;
  message: string;
  data: UserAnalytics;
}

export interface PlatformAnalyticsResponse {
  success: boolean;
  message: string;
  data: PlatformAnalytics;
}

export interface ProblemAnalyticsResponse {
  success: boolean;
  message: string;
  data: ProblemAnalytics;
}
