# Problems & Submissions Integration Guide

## Overview

Frontend integration for Problem and Submission modules matching your backend API.

## 📦 Import Paths

```typescript
import { useProblems, useProblem } from '@/features/questions/hooks';
import { problemService } from '@/features/questions/services';
import type { Problem, ProblemFilterQuery, CreateProblemInput } from '@/features/questions/types';

import { useSubmission } from '@/features/submissions/hooks';
import { submissionService } from '@/features/submissions/services';
import type { Submission, SubmissionInput, SubmissionStats } from '@/features/submissions/types';
```

## 🎯 Problems Module

### useProblems Hook

```typescript
const {
  problems,          // Problem[]
  pagination,        // PaginationInfo | null
  stats,            // ProblemStats | null
  isLoading,        // boolean
  error,            // string | null
  getAllProblems,   // (filters?: ProblemFilterQuery) => Promise<void>
  searchProblems,   // (query: string, filters?: ProblemFilterQuery) => Promise<void>
  getProblemsByConcept, // (concept: string, filters?: ProblemFilterQuery) => Promise<void>
  getProblemStats,  // () => Promise<void>
  clearError,       // () => void
} = useProblems();
```

### useProblem Hook

```typescript
const {
  problem,          // Problem | null
  isLoading,        // boolean
  error,            // string | null
  getProblemById,   // (id: string) => Promise<Problem | null>
  createProblem,    // (data: CreateProblemInput) => Promise<Problem | null>
  updateProblem,    // (id: string, data: UpdateProblemInput) => Promise<Problem | null>
  deleteProblem,    // (id: string) => Promise<boolean>
  clearError,       // () => void
} = useProblem();
```

### Problem Service

```typescript
problemService.getAllProblems(filters)
problemService.getProblemById(id)
problemService.createProblem(data)
problemService.updateProblem(id, data)
problemService.deleteProblem(id)
problemService.getProblemStats()
problemService.searchProblems(query, filters)
problemService.getProblemsByConcept(concept, filters)
```

## 🚀 Submissions Module

### useSubmission Hook

```typescript
const {
  submission,       // Submission | null
  submissions,      // Submission[]
  stats,           // SubmissionStats | null
  problemStats,    // ProblemSubmissionStats | null
  isLoading,       // boolean
  error,           // string | null
  submitSolution,  // (data: SubmissionInput) => Promise<Submission | null>
  getSubmissionById, // (id: string) => Promise<Submission | null>
  getUserSubmissions, // (params?) => Promise<void>
  getUserSubmissionStats, // () => Promise<void>
  getProblemSubmissions, // (problemId: string, params?) => Promise<void>
  getProblemAcceptanceStats, // (problemId: string) => Promise<void>
  deleteSubmission, // (id: string) => Promise<boolean>
  updateSubmissionFeedback, // (id: string, data) => Promise<Submission | null>
  clearError,      // () => void
} = useSubmission();
```

### Submission Service

```typescript
submissionService.submitSolution(data)
submissionService.getSubmissionById(id)
submissionService.getUserSubmissions(params)
submissionService.getUserSubmissionStats()
submissionService.deleteSubmission(id)
submissionService.getProblemSubmissions(problemId, params)
submissionService.getProblemAcceptanceStats(problemId)
submissionService.updateSubmissionFeedback(id, data)
```

## 💡 Usage Examples

### Fetch All Problems

```typescript
'use client';
import { useProblems } from '@/features/questions/hooks';
import { useEffect } from 'react';

export default function ProblemsPage() {
  const { problems, pagination, getAllProblems, isLoading } = useProblems();

  useEffect(() => {
    getAllProblems({ 
      difficulty: 'Easy', 
      page: 1, 
      limit: 20,
      sortBy: 'recent' 
    });
  }, [getAllProblems]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {problems.map(problem => (
        <div key={problem._id}>
          <h3>{problem.title}</h3>
          <span>{problem.difficulty}</span>
        </div>
      ))}
    </div>
  );
}
```

### Get Single Problem

```typescript
'use client';
import { useProblem } from '@/features/questions/hooks';
import { useEffect } from 'react';

export default function ProblemDetailPage({ params }: { params: { id: string } }) {
  const { problem, getProblemById, isLoading } = useProblem();

  useEffect(() => {
    getProblemById(params.id);
  }, [params.id, getProblemById]);

  if (isLoading) return <div>Loading...</div>;
  if (!problem) return <div>Problem not found</div>;

  return (
    <div>
      <h1>{problem.title}</h1>
      <p>{problem.description}</p>
      <div>Difficulty: {problem.difficulty}</div>
      <div>Concepts: {problem.concepts.join(', ')}</div>
    </div>
  );
}
```

### Submit Solution

```typescript
'use client';
import { useSubmission } from '@/features/submissions/hooks';
import { useState } from 'react';

export default function CodeEditor({ problemId }: { problemId: string }) {
  const { submitSolution, submission, isLoading, error } = useSubmission();
  const [code, setCode] = useState('');

  const handleSubmit = async () => {
    const result = await submitSolution({
      problemId,
      code,
      language: 'javascript',
    });

    if (result) {
      alert(`Status: ${result.status}`);
    }
  };

  return (
    <div>
      <textarea 
        value={code} 
        onChange={(e) => setCode(e.target.value)}
        placeholder="Write your code here..."
      />
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit Solution'}
      </button>
      {error && <div className="error">{error}</div>}
      {submission && (
        <div>
          <p>Status: {submission.status}</p>
          <p>Test Cases: {submission.testCasesPassed}/{submission.totalTestCases}</p>
          <p>Execution Time: {submission.executionTime}ms</p>
        </div>
      )}
    </div>
  );
}
```

### Search Problems

```typescript
'use client';
import { useProblems } from '@/features/questions/hooks';
import { useState } from 'react';

export default function ProblemSearch() {
  const { problems, searchProblems, isLoading } = useProblems();
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    await searchProblems(query, { 
      difficulty: 'Medium',
      limit: 10 
    });
  };

  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search problems..."
      />
      <button onClick={handleSearch}>Search</button>
      
      {isLoading ? (
        <div>Searching...</div>
      ) : (
        <div>
          {problems.map(p => (
            <div key={p._id}>{p.title}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Get User Submission Stats

```typescript
'use client';
import { useSubmission } from '@/features/submissions/hooks';
import { useEffect } from 'react';

export default function UserStats() {
  const { stats, getUserSubmissionStats, isLoading } = useSubmission();

  useEffect(() => {
    getUserSubmissionStats();
  }, [getUserSubmissionStats]);

  if (isLoading) return <div>Loading stats...</div>;
  if (!stats) return null;

  return (
    <div>
      <h2>Your Statistics</h2>
      <p>Total Submissions: {stats.totalSubmissions}</p>
      <p>Accepted: {stats.acceptedSubmissions}</p>
      <p>Acceptance Rate: {stats.acceptanceRate}%</p>
      <p>Avg Execution Time: {stats.averageExecutionTime}ms</p>
    </div>
  );
}
```

### Filter Problems by Difficulty

```typescript
const { getAllProblems } = useProblems();

getAllProblems({ 
  difficulty: 'Easy',
  page: 1,
  limit: 20 
});

getAllProblems({ 
  difficulty: ['Easy', 'Medium'],
  concepts: ['array', 'string'],
  sortBy: 'acceptance'
});
```

### Get Problems by Concept

```typescript
const { getProblemsByConcept } = useProblems();

getProblemsByConcept('array', { 
  difficulty: 'Medium',
  limit: 10 
});
```

## 🔑 API Endpoints

### Problems
- `GET /problem` - Get all problems
- `GET /problem/:id` - Get problem by ID/slug
- `POST /problem` - Create problem (admin)
- `PATCH /problem/:id` - Update problem (admin)
- `DELETE /problem/:id` - Delete problem (admin)
- `GET /problem/stats` - Get problem statistics
- `GET /problem/search` - Search problems
- `GET /problem/concept/:concept` - Get problems by concept

### Submissions
- `POST /submission/submit` - Submit solution
- `GET /submission/user/:id` - Get submission by ID
- `GET /submission/user/list` - Get user submissions
- `GET /submission/stats/user` - Get user stats
- `DELETE /submission/:id` - Delete submission
- `GET /submission/problem/:problemId/list` - Get problem submissions
- `GET /submission/problem/:problemId/stats` - Get problem acceptance stats
- `PATCH /submission/:id/feedback` - Update feedback (admin)

## 📋 Type Definitions

### Problem
```typescript
interface Problem {
  _id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
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
}
```

### Submission
```typescript
interface Submission {
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
  submittedAt: Date | string;
}
```

## 🎨 Constants

```typescript
import { DIFFICULTY_LEVELS, PROGRAMMING_LANGUAGES, SORT_OPTIONS } from '@/features/questions/constants';
import { SUBMISSION_STATUS, SUBMISSION_STATUS_LABELS } from '@/features/submissions/constants';

DIFFICULTY_LEVELS.EASY    // 'Easy'
PROGRAMMING_LANGUAGES.JAVASCRIPT  // 'javascript'
SORT_OPTIONS.RECENT       // 'recent'
SUBMISSION_STATUS.ACCEPTED // 'accepted'
```

## ✅ Complete Integration

All files created and ready to use:
- ✅ Problem types, services, hooks
- ✅ Submission types, services, hooks
- ✅ API endpoints configured
- ✅ Constants defined
- ✅ Index files for easy imports

No need to check backend again - just import and use!
