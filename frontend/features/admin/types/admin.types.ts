export interface AdminDashboard {
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

export interface UserManagement {
  _id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'banned';
  role: 'user' | 'admin' | 'moderator';
  createdAt: Date | string;
  lastLogin?: Date | string | null;
  problemsSolved?: number;
  discussionCount?: number;
}

export interface ProblemManagement {
  _id: string;
  title: string;
  difficulty: string;
  status: 'draft' | 'published' | 'archived';
  submissionCount: number;
  acceptanceRate: number;
  createdBy: string;
  createdAt: Date | string;
  actions: string[];
}

export interface ModerationReport {
  _id: string;
  reportType: 'discussion' | 'comment' | 'problem' | 'user';
  reason: string;
  reportedContent: string;
  reportedBy: string;
  status: 'pending' | 'reviewing' | 'resolved';
  createdAt: Date | string;
  actions: string[];
}

export interface AdminActionLog {
  _id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date | string;
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

export interface AnalyticsData {
  period: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  totalSubmissions: number;
  totalContests: number;
  averageAcceptanceRate: number;
}

export interface AdminDashboardResponse {
  success: boolean;
  message: string;
  data: AdminDashboard;
}

export interface UsersListResponse {
  success: boolean;
  message: string;
  data: {
    users: UserManagement[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface ModerationReportsResponse {
  success: boolean;
  message: string;
  data: {
    reports: ModerationReport[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}
