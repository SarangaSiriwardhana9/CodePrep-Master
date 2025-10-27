export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
} as const;

export const PROBLEM_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export const REPORT_STATUS = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  RESOLVED: 'resolved',
} as const;

export const MODERATION_ACTION = {
  APPROVE: 'approve',
  REJECT: 'reject',
  DELETE: 'delete',
  WARN: 'warn',
} as const;
