export interface TagInput {
  name: string;
  description?: string;
  category?: 'algorithm' | 'data-structure' | 'pattern' | 'technique';
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface TagResponse {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category?: 'algorithm' | 'data-structure' | 'pattern' | 'technique';
  difficulty?: 'easy' | 'medium' | 'hard';
  problemCount: number;
  usersMastered: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserTagResponse {
  _id: string;
  userId: string;
  tagId: string;
  tagName: string;
  masteryLevel: number;
  problemsSolved: number;
  problemsTotal: number;
  averageAccuracy: number;
  averageTime: number;
  lastPracticedAt: Date;
  proficiencyLevel: 'Novice' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface ProblemTagResponse {
  _id: string;
  problemId: string;
  tagIds: string[];
  tagNames: string[];
  difficulty: string;
  frequency: number;  
  createdAt: Date;
  updatedAt: Date;
}

export interface TagStatisticsResponse {
  tagId: string;
  tagName: string;
  totalProblems: number;
  solvedProblems: number;
  averageDifficulty: string;
  totalUsers: number;
  masteredUsers: number;
  successRate: number;
  averageMasteryScore: number;
}

export interface UpdateTagInput {
  name?: string;
  description?: string;
  category?: 'algorithm' | 'data-structure' | 'pattern' | 'technique';
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface LearningPathResponse {
  _id: string;
  pathName: string;
  description: string;
  tags: TagResponse[];
  recommendedOrder: string[];
  estimatedHours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completedBy: number;
  createdAt: Date;
}

export interface TagSearchResponse {
  tags: TagResponse[];
  total: number;
  matchedCount: number;
}