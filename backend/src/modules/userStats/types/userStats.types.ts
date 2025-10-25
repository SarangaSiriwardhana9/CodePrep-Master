export interface UserStatsInput {
  userId: string;
  problemsSolved?: number;
  problemsAttempted?: number;
  acceptanceRate?: number;
  totalTimeSpent?: number;
  bestContestRank?: number;
  totalContestScore?: number;
}

export interface UserStatsResponse {
  _id: string;
  userId: string;
  totalProblemsSolved: number;
  totalProblemsAttempted: number;
  acceptanceRate: number;
  totalTimeSpent: number;
  lastActiveAt: Date;
  bestContestRank: number;
  totalContestScore: number;
  currentStreak: number;
  longestStreak: number;
  achievementsUnlocked: number;
  levelPoints: number;
  currentLevel: string;
  updatedAt: Date;
}

export interface UserProfileResponse {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  company?: string;
  languages: string[];
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserProfileInput {
  name?: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  company?: string;
  languages?: string[];
  skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface UserAchievementResponse {
  _id: string;
  userId: string;
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'contest' | 'problem' | 'concept' | 'milestone';
  progress: number;
  progressMax: number;
  unlockedAt?: Date;
  isUnlocked: boolean;
}

export interface ConceptMasteryResponse {
  concept: string;
  masteryScore: number;
  problemsSolved: number;
  problemsTotal: number;
  timeSpent: number;
  averageAccuracy: number;
  lastPracticedAt: Date;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface UserDashboardResponse {
  profile: UserProfileResponse;
  stats: UserStatsResponse;
  topConcepts: ConceptMasteryResponse[];
  recentActivity: any[];
  achievements: UserAchievementResponse[];
  suggestedProblems: any[];
}

export interface DailyActivityResponse {
  date: string;
  problemsSolved: number;
  attemptsMade: number;
  timeSpent: number;
  streak: boolean;
  submissions: number;
}

export interface ComparisonResponse {
  userId: string;
  comparedWithUserId: string;
  comparison: {
    problemsSolved: { yours: number; theirs: number };
    acceptanceRate: { yours: number; theirs: number };
    currentStreak: { yours: number; theirs: number };
    totalContestScore: { yours: number; theirs: number };
    averageRank: { yours: number; theirs: number };
  };
}