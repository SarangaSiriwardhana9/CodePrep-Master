export interface UserStats {
  _id: string;
  userId: string;
  totalProblemsSolved: number;
  totalProblemsAttempted: number;
  acceptanceRate: number;
  totalTimeSpent: number;
  lastActiveAt: Date | string;
  bestContestRank: number;
  totalContestScore: number;
  currentStreak: number;
  longestStreak: number;
  achievementsUnlocked: number;
  levelPoints: number;
  currentLevel: string;
  updatedAt: Date | string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  company?: string;
  languages: string[];
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  createdAt: Date | string;
  updatedAt: Date | string;
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

export interface UserAchievement {
  _id: string;
  userId: string;
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'contest' | 'problem' | 'concept' | 'milestone';
  progress: number;
  progressMax: number;
  unlockedAt?: Date | string;
  isUnlocked: boolean;
}

export interface ConceptMastery {
  concept: string;
  masteryScore: number;
  problemsSolved: number;
  problemsTotal: number;
  timeSpent: number;
  averageAccuracy: number;
  lastPracticedAt: Date | string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface UserDashboard {
  profile: UserProfile;
  stats: UserStats;
  topConcepts: ConceptMastery[];
  recentActivity: any[];
  achievements: UserAchievement[];
  suggestedProblems: any[];
}

export interface DailyActivity {
  date: string;
  problemsSolved: number;
  attemptsMade: number;
  timeSpent: number;
  streak: boolean;
  submissions: number;
}

export interface UserComparison {
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

export interface UserStatsResponse {
  success: boolean;
  message: string;
  data: UserStats;
}

export interface UserDashboardResponse {
  success: boolean;
  message: string;
  data: UserDashboard;
}

export interface DailyActivityResponse {
  success: boolean;
  message: string;
  data: DailyActivity[];
}
