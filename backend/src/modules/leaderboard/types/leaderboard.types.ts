export interface GlobalLeaderboardResponse {
  rank: number;
  userId: string;
  userName: string;
  profilePicture?: string;
  totalProblemsSolved: number;
  acceptanceRate: number;
  currentLevel: string;
  levelPoints: number;
  currentStreak: number;
  bestRank?: number;
}

export interface ConceptLeaderboardResponse {
  rank: number;
  userId: string;
  userName: string;
  concept: string;
  masteryScore: number;
  problemsSolved: number;
  proficiencyLevel: string;
}

export interface ContestLeaderboardResponse {
  rank: number;
  userId: string;
  userName: string;
  contestId: string;
  score: number;
  solutionsSubmitted: number;
  timeSpent: number;
  submittedAt: Date;
}

export interface TimePeriodLeaderboardResponse {
  rank: number;
  userId: string;
  userName: string;
  problemsSolvedInPeriod: number;
  pointsEarned: number;
  submissionsInPeriod: number;
  streakInPeriod: number;
}

export interface FriendLeaderboardResponse {
  userId: string;
  userName: string;
  profilePicture?: string;
  rank: number;
  totalProblemsSolved: number;
  acceptanceRate: number;
  currentLevel: string;
  levelPoints: number;
  isFriend: boolean;
}

export interface LeaderboardFilterInput {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'allTime';
  category?: 'algorithm' | 'data-structure' | 'pattern' | 'technique';
  difficulty?: 'easy' | 'medium' | 'hard';
  limit?: number;
  skip?: number;
}

export interface UserRankResponse {
  userId: string;
  userName: string;
  globalRank: number;
  totalProblems: number;
  acceptanceRate: number;
  levelPoints: number;
  topConcepts: Array<{
    concept: string;
    rank: number;
    masteryScore: number;
  }>;
  bestContest?: {
    rank: number;
    score: number;
  };
}

export interface LeaderboardTrendResponse {
  period: string;
  rank: number;
  rankChange: number;
  pointsEarned: number;
  problemsSolved: number;
}

export interface LeaderboardStatisticsResponse {
  totalUsers: number;
  averageProblems: number;
  averageAcceptanceRate: number;
  averageLevelPoints: number;
  medianRank: number;
  topUser: {
    rank: 1;
    userName: string;
    problemsSolved: number;
  };
}