export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type ProgrammingLanguage = 'javascript' | 'python' | 'java' | 'cpp';

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface StarterCode {
  javascript?: string;
  python?: string;
  java?: string;
  cpp?: string;
}

export interface TestCase {
  input: any;
  expectedOutput: any;
  isHidden?: boolean;
}

export interface ProblemSolution {
  approach?: string;
  explanation?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  code?: string;
}

export interface Problem {
  _id: string;
  title: string;
  slug: string;
  difficulty: DifficultyLevel;
  concepts: string[];
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  starterCode: StarterCode;
  testCases: TestCase[];
  hints: string[];
  solution: ProblemSolution;
  relatedProblems?: string[];
  companyTags?: string[];
  acceptanceRate?: number;
  totalAttempts?: number;
  totalSolves?: number;
  createdBy?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CreateProblemInput {
  title: string;
  slug: string;
  difficulty: DifficultyLevel;
  concepts: string[];
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  starterCode?: StarterCode;
  testCases: TestCase[];
  hints?: string[];
  solution?: ProblemSolution;
  relatedProblems?: string[];
  companyTags?: string[];
}

export interface UpdateProblemInput {
  title?: string;
  slug?: string;
  difficulty?: DifficultyLevel;
  concepts?: string[];
  description?: string;
  examples?: ProblemExample[];
  constraints?: string[];
  starterCode?: StarterCode;
  testCases?: TestCase[];
  hints?: string[];
  solution?: ProblemSolution;
  relatedProblems?: string[];
  companyTags?: string[];
}

export interface ProblemFilterQuery {
  difficulty?: string | string[];
  concepts?: string[];
  companyTags?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'recent' | 'acceptance' | 'difficulty';
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ProblemsResponse {
  success: boolean;
  message: string;
  data: {
    problems: Problem[];
    pagination: PaginationInfo;
  };
}

export interface ProblemResponse {
  success: boolean;
  message: string;
  data: Problem;
}

export interface ProblemStats {
  totalProblems: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  conceptsDistribution: Record<string, number>;
}

export interface ProblemStatsResponse {
  success: boolean;
  message: string;
  data: ProblemStats;
}
