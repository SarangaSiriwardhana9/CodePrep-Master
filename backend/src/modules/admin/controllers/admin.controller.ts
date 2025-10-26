import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AdminActionLog, SystemConfig, ModerationQueue } from '../models/admin.model';
import { User } from '../../auth/models/User.model';
import { Problem } from '../../problem/models/Problem.model';
import { Submission } from '../../submission/models/Submission.model';
import { Contest } from '../../contests/models/contest.model';
import { Discussion, DiscussionReport } from '../../discussion/models/discussion.model';
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../../../config/constants';
import {
  AdminDashboardResponse,
  UpdateUserStatusInput,
  UpdateProblemStatusInput,
  ResolveModerationInput,
  SystemConfigInput,
} from '../types/admin.types';

const adminMiddleware = async (req: Request, res: Response, next: Function) => {
  const user = await User.findById(req.userId);
  if (user?.role !== 'admin') {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: {
        code: 'AUTHORIZATION_ERROR',
        message: 'Admin access required',
      },
    });
  }
  next();
};

export const getAdminDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProblems = await Problem.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const totalContests = await Contest.countDocuments();
    const pendingReports = await DiscussionReport.countDocuments({ isResolved: false });

    const dashboard: AdminDashboardResponse = {
      totalUsers,
      totalProblems,
      totalSubmissions,
      totalContests,
      pendingReports,
      systemHealth: {
        uptime: process.uptime(),
        avgResponseTime: 125, // Mock value
        errorRate: 0.5, // Mock value
      },
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Admin dashboard fetched successfully',
      data: dashboard,
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, role, limit = 20, skip = 0, search } = req.query;

    interface FilterQuery {
      status?: string;
      role?: string;
      $or?: Array<any>;
    }

    const filter: FilterQuery = {};

    if (status) filter.status = status as string;
    if (role) filter.role = role as string;

    if (search) {
      filter.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { email: { $regex: search as string, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await User.countDocuments(filter);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Users fetched successfully',
      data: {
        users: users.map((u: any) => ({
          _id: u._id.toString(),
          name: u.name,
          email: u.email,
          status: u.status || 'active',
          role: u.role || 'user',
          createdAt: u.createdAt,
        })),
        pagination: {
          total,
          limit: Number(limit),
          skip: Number(skip),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = req.userId;
    const { userId } = req.params;
    const { status, reason } = req.body as UpdateUserStatusInput;

    if (!status) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'status is required',
        },
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'User not found',
        },
      });
      return;
    }

    const oldStatus = (user as any).status || 'active';
    (user as any).status = status;
    await user.save();

    // Log action
    await AdminActionLog.create({
      adminId,
      action: `user_${status}`,
      targetType: 'user',
      targetId: userId,
      oldValue: oldStatus,
      newValue: status,
      reason,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User status updated successfully',
      data: {
        userId,
        status,
        reason,
      },
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getAllProblems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, difficulty, limit = 20, skip = 0 } = req.query;

    interface FilterQuery {
      status?: string;
      difficulty?: string;
    }

    const filter: FilterQuery = {};
    if (status) filter.status = status as string;
    if (difficulty) filter.difficulty = difficulty as string;

    const problems = await Problem.find(filter)
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Problem.countDocuments(filter);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Problems fetched successfully',
      data: {
        problems: problems.map((p) => ({
          _id: p._id.toString(),
          title: p.title,
          difficulty: p.difficulty,
          status: (p as any).status || 'published',
          createdAt: p.createdAt,
        })),
        pagination: {
          total,
          limit: Number(limit),
          skip: Number(skip),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get all problems error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const updateProblemStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = req.userId;
    const { problemId } = req.params;
    const { status } = req.body as UpdateProblemStatusInput;

    if (!status) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'status is required',
        },
      });
      return;
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Problem not found',
        },
      });
      return;
    }

    const oldStatus = (problem as any).status || 'published';
    (problem as any).status = status;
    await problem.save();

    await AdminActionLog.create({
      adminId,
      action: `problem_${status}`,
      targetType: 'problem',
      targetId: problemId,
      oldValue: oldStatus,
      newValue: status,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Problem status updated successfully',
      data: { problemId, status },
    });
  } catch (error) {
    console.error('Update problem status error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getModerationQueue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status = 'pending', limit = 20, skip = 0 } = req.query;

    const queue = await ModerationQueue.find({ status })
      .populate('reportedBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await ModerationQueue.countDocuments({ status });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Moderation queue fetched successfully',
      data: {
        queue: queue.map((item) => ({
          _id: item._id.toString(),
          reportType: item.reportType,
          reason: item.reason,
          status: item.status,
          reportedBy: (item.reportedBy as any)?.name,
          assignedTo: (item.assignedTo as any)?.name,
          createdAt: item.createdAt,
        })),
        pagination: {
          total,
          limit: Number(limit),
          skip: Number(skip),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get moderation queue error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const resolveModerationCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = req.userId;
    const { caseId } = req.params;
    const { status, action, reason } = req.body as ResolveModerationInput;

    const moderationCase = await ModerationQueue.findById(caseId);
    if (!moderationCase) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Moderation case not found',
        },
      });
      return;
    }

    moderationCase.status = status;
    moderationCase.action = action;
    moderationCase.resolution = reason;
    moderationCase.resolvedAt = new Date();
    moderationCase.assignedTo = adminId ? new mongoose.Types.ObjectId(adminId) : undefined;
    await moderationCase.save();

    await AdminActionLog.create({
      adminId,
      action: 'moderation_resolved',
      targetType: 'moderation',
      targetId: caseId,
      newValue: { action, status },
      reason,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Moderation case resolved successfully',
      data: {
        caseId,
        status,
        action,
      },
    });
  } catch (error) {
    console.error('Resolve moderation case error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getSystemConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    let config = await SystemConfig.findOne();

    if (!config) {
      config = await SystemConfig.create({
        maintenanceMode: false,
        rateLimitEnabled: true,
        rateLimitRequests: 100,
        rateLimitWindow: 3600,
        maxFileSize: 50 * 1024 * 1024,
        allowedLanguages: ['javascript', 'python', 'java', 'cpp', 'csharp'],
        allowedImageFormats: ['jpg', 'jpeg', 'png', 'gif'],
        lastUpdatedBy: req.userId,
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'System config fetched successfully',
      data: {
        maintenanceMode: config.maintenanceMode,
        rateLimitEnabled: config.rateLimitEnabled,
        rateLimitRequests: config.rateLimitRequests,
        rateLimitWindow: config.rateLimitWindow,
        allowedLanguages: config.allowedLanguages,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get system config error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const updateSystemConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = req.userId;
    const updateData: SystemConfigInput = req.body;

    let config = await SystemConfig.findOne();

    if (!config) {
      config = await SystemConfig.create({
        ...updateData,
        lastUpdatedBy: new mongoose.Types.ObjectId(adminId!),
      });
    } else {
      Object.assign(config, updateData);
      config.lastUpdatedBy = new mongoose.Types.ObjectId(adminId!);
      await config.save();
    }

    await AdminActionLog.create({
      adminId,
      action: 'system_config_updated',
      targetType: 'system',
      targetId: config._id,
      newValue: updateData,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'System config updated successfully',
      data: {
        maintenanceMode: config.maintenanceMode,
        rateLimitEnabled: config.rateLimitEnabled,
      },
    });
  } catch (error) {
    console.error('Update system config error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getAdminActionLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { action, limit = 20, skip = 0 } = req.query;

    interface FilterQuery {
      action?: string;
    }

    const filter: FilterQuery = {};
    if (action) filter.action = action as string;

    const logs = await AdminActionLog.find(filter)
      .populate('adminId', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await AdminActionLog.countDocuments(filter);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Admin action logs fetched successfully',
      data: {
        logs: logs.map((log) => ({
          _id: log._id.toString(),
          adminName: (log.adminId as any).name,
          action: log.action,
          targetType: log.targetType,
          reason: log.reason,
          timestamp: log.createdAt,
        })),
        pagination: {
          total,
          limit: Number(limit),
          skip: Number(skip),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get admin action logs error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};