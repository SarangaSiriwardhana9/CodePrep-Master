export interface User {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
  loginAttempts?: number;
  lastLoginAttempt?: Date | null;
  lockedUntil?: Date | null;
  lastLogin?: Date | null;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JwtPayload {
  id: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  user?: Omit<User, 'password' | 'resetToken' | 'resetTokenExpiry'> & { _id?: string };
}

// Problem Types
export interface IProblem {
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  concepts: string[];
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  starterCode: {
    javascript?: string;
    python?: string;
    java?: string;
    cpp?: string;
  };
  testCases: Array<{
    input: any;
    expectedOutput: any;
    isHidden?: boolean;
  }>;
  hints: string[];
  solution: {
    approach?: string;
    explanation?: string;
    timeComplexity?: string;
    spaceComplexity?: string;
    code?: string;
  };
  relatedProblems?: string[];
  companyTags?: string[];
  acceptanceRate?: number;
  totalAttempts?: number;
  totalSolves?: number;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateProblemInput {
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  concepts: string[];
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  starterCode?: {
    javascript?: string;
    python?: string;
    java?: string;
    cpp?: string;
  };
  testCases: Array<{
    input: any;
    expectedOutput: any;
    isHidden?: boolean;
  }>;
  hints?: string[];
  solution?: {
    approach?: string;
    explanation?: string;
    timeComplexity?: string;
    spaceComplexity?: string;
    code?: string;
  };
  relatedProblems?: string[];
  companyTags?: string[];
}

export interface UpdateProblemInput {
  title?: string;
  slug?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  concepts?: string[];
  description?: string;
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints?: string[];
  starterCode?: {
    javascript?: string;
    python?: string;
    java?: string;
    cpp?: string;
  };
  testCases?: Array<{
    input: any;
    expectedOutput: any;
    isHidden?: boolean;
  }>;
  hints?: string[];
  solution?: {
    approach?: string;
    explanation?: string;
    timeComplexity?: string;
    spaceComplexity?: string;
    code?: string;
  };
  relatedProblems?: string[];
  companyTags?: string[];
}

export interface ProblemFilterQuery {
  difficulty?: string;
  concepts?: string[];
  companyTags?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'recent' | 'acceptance' | 'difficulty';
}