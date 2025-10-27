export const SUBMISSION_STATUS = {
  ACCEPTED: 'accepted',
  WRONG_ANSWER: 'wrong_answer',
  RUNTIME_ERROR: 'runtime_error',
  TIME_LIMIT_EXCEEDED: 'time_limit_exceeded',
  MEMORY_LIMIT_EXCEEDED: 'memory_limit_exceeded',
  PENDING: 'pending',
} as const;

export const SUBMISSION_STATUS_LABELS = {
  accepted: 'Accepted',
  wrong_answer: 'Wrong Answer',
  runtime_error: 'Runtime Error',
  time_limit_exceeded: 'Time Limit Exceeded',
  memory_limit_exceeded: 'Memory Limit Exceeded',
  pending: 'Pending',
} as const;

export const SUBMISSION_STATUS_COLORS = {
  accepted: 'green',
  wrong_answer: 'red',
  runtime_error: 'orange',
  time_limit_exceeded: 'yellow',
  memory_limit_exceeded: 'purple',
  pending: 'blue',
} as const;
