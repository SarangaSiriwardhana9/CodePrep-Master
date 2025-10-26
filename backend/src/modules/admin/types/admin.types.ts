export interface AdminDashboardResponse {
  totalUsers: number;
  totalProblems: number;
  totalSubmissions: number;
  totalContests: number;
  pendingReports: number;
  systemHealth: {
    uptime: number;
    avgResponseTime: number;
    errorRate: number;
  };
}

export interface UserManagementResponse {
  _id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'banned';
  role: 'user' | 'admin' | 'moderator';
  createdAt: Date;
  lastLogin: Date;
  problemsSolved: number;
  discussionCount: number;
  actions: string[];
}

export interface ProblemManagementResponse {
  _id: string;
  title: string;
  difficulty: string;
  status: 'draft' | 'published' | 'archived';
  submissionCount: number;
  acceptanceRate: number;
  createdBy: string;
  createdAt: Date;
  actions: string[];
}

export interface ModerationReportResponse {
  _id: string;
  reportType: 'discussion' | 'comment' | 'problem' | 'user';
  reason: string;
  reportedContent: string;
  reportedBy: string;
  status: 'pending' | 'reviewing' | 'resolved';
  createdAt: Date;
  actions: string[];
}

export interface AdminActionLogResponse {
  _id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
}

export interface UpdateUserStatusInput {
  status: 'active' | 'suspended' | 'banned';
  reason?: string;
}

export interface UpdateProblemStatusInput {
  status: 'draft' | 'published' | 'archived';
}

export interface ResolveModerationInput {
  status: 'reviewing' | 'resolved';
  action: 'approve' | 'reject' | 'delete' | 'warn';
  reason: string;
}

export interface SystemConfigInput {
  maintenanceMode?: boolean;
  rateLimitEnabled?: boolean;
  rateLimitRequests?: number;
  rateLimitWindow?: number;
}

export interface BulkActionInput {
  userIds?: string[];
  problemIds?: string[];
  action: string;
  params?: any;
}

export interface AnalyticsDataResponse {
  period: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  totalSubmissions: number;
  totalContests: number;
  averageAcceptanceRate: number;
}