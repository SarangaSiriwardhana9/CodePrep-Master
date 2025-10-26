import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  UserAnalytics,
  PlatformAnalytics,
  ProblemAnalytics,
  ConceptAnalytics,
  AnalyticsReport,
} from '../models/analytics.model';
import { UserStats } from '../../userStats/models/UserStats.model';
import { Problem } from '../../problem/models/Problem.model';
import { Submission } from '../../submission/models/Submission.model';
import { User } from '../../auth/models/User.model';
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../../../config/constants';

export const getUserAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.userId;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const analytics = await UserAnalytics.find({
      userId,
      date: { $gte: startDate },
    }).sort({ date: -1 });

    const userStats = await UserStats.findOne({ userId });

    const trends = {
      weekly: analytics
        .filter((a) => {
          const daysAgo = (new Date().getTime() - a.date.getTime()) / (1000 * 60 * 60 * 24);
          return daysAgo <= 7;
        })
        .map((a) => a.problemsSolved),
      monthly: analytics.map((a) => a.problemsSolved),
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User analytics fetched successfully',
      data: {
        userId,
        totalProblems: userStats?.totalProblemsSolved || 0,
        totalSubmissions: userStats?.totalProblemsAttempted || 0,
        acceptanceRate: userStats?.acceptanceRate || 0,
        averageTimePerProblem: 0,  
        levelProgression: {
          level: userStats?.currentLevel || 'Beginner',
          progress: userStats?.levelPoints || 0,
        },
        skillDistribution: [],
        trends,
      },
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getPlatformAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const totalUsers = await User.countDocuments();
    const activeUsers = await UserStats.countDocuments({
      lastActiveAt: { $gte: startDate },
    });
    const totalProblems = await Problem.countDocuments();
    const totalSubmissions = await Submission.countDocuments();

    // Calculate average acceptance rate
    const submissions = await Submission.find({
      submittedAt: { $gte: startDate },
    });
    const accepted = submissions.filter((s) => s.status === 'accepted').length;
    const avgAcceptanceRate = submissions.length > 0 ? (accepted / submissions.length) * 100 : 0;

    // Get top problems
    const topProblems = await ProblemAnalytics.find({
      date: { $gte: startDate },
    })
      .sort({ totalAttempts: -1 })
      .limit(5)
      .populate('problemId', 'title');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Platform analytics fetched successfully',
      data: {
        totalUsers,
        activeUsers,
        totalProblems,
        totalSubmissions,
        averageAcceptanceRate: Number(avgAcceptanceRate.toFixed(2)),
        topProblems: topProblems.map((p) => ({
          problemId: p.problemId._id?.toString(),
          title: (p.problemId as any).title,
          attempts: p.totalAttempts,
          acceptanceRate: p.acceptanceRate,
        })),
        topContests: [],
        userGrowth: {
          daily: [],
          weekly: [],
          monthly: [],
        },
      },
    });
  } catch (error) {
    console.error('Get platform analytics error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getProblemAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

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

    const problemAnalytics = await ProblemAnalytics.findOne({
      problemId,
    }).sort({ date: -1 });

    const submissions = await Submission.find({
      problemId,
      submittedAt: { $gte: startDate },
    });

    const accepted = submissions.filter((s) => s.status === 'accepted').length;
    const acceptanceRate = submissions.length > 0 ? (accepted / submissions.length) * 100 : 0;

    const languageStats: { [key: string]: number } = {};
    submissions.forEach((s) => {
      languageStats[s.language] = (languageStats[s.language] || 0) + 1;
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Problem analytics fetched successfully',
      data: {
        problemId,
        title: problem.title,
        difficulty: problem.difficulty,
        totalAttempts: submissions.length,
        totalAccepted: accepted,
        acceptanceRate: Number(acceptanceRate.toFixed(2)),
        averageTimeSpent: 0,
        successTrend: [],
        languageDistribution: Object.entries(languageStats).map(([lang, count]) => ({
          language: lang,
          submissions: count,
        })),
        commonMistakes: [],
      },
    });
  } catch (error) {
    console.error('Get problem analytics error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getConceptAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { concept } = req.params;

    const conceptAnalytics = await ConceptAnalytics.findOne({
      concept,
    }).sort({ date: -1 });

    if (!conceptAnalytics) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Concept analytics not found',
        },
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Concept analytics fetched successfully',
      data: {
        concept: conceptAnalytics.concept,
        totalUsers: conceptAnalytics.totalUsers,
        usersMastered: conceptAnalytics.usersMastered,
        masteryRate:
          conceptAnalytics.totalUsers > 0
            ? (
                (conceptAnalytics.usersMastered / conceptAnalytics.totalUsers) *
                100
              ).toFixed(2)
            : 0,
        averageMasteryScore: conceptAnalytics.averageMasteryScore,
        difficulty: 'medium',
        trend: {
          increasing: true,
          percentageChange: 5.2,
        },
      },
    });
  } catch (error) {
    console.error('Get concept analytics error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const generateReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { reportType, period, startDate, endDate } = req.body;

    if (!reportType || !period) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'reportType and period are required',
        },
      });
      return;
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();

    let reportData: any = {};

    if (reportType === 'platform') {
      const totalUsers = await User.countDocuments();
      const totalProblems = await Problem.countDocuments();
      const totalSubmissions = await Submission.countDocuments();

      reportData = {
        totalUsers,
        totalProblems,
        totalSubmissions,
      };
    }

    const report = await AnalyticsReport.create({
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${period}`,
      reportType,
      period,
      startDate: start,
      endDate: end,
      data: reportData,
      generatedBy: new mongoose.Types.ObjectId(userId!),
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Report generated successfully',
      data: {
        reportId: report._id.toString(),
        title: report.title,
        generatedAt: report.createdAt,
        format: 'json',
      },
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportType, limit = 10, skip = 0 } = req.query;

    interface FilterQuery {
      reportType?: string;
    }

    const filter: FilterQuery = {};
    if (reportType) filter.reportType = reportType as string;

    const reports = await AnalyticsReport.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .populate('generatedBy', 'name');

    const total = await AnalyticsReport.countDocuments(filter);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Reports fetched successfully',
      data: {
        reports: reports.map((r) => ({
          _id: r._id.toString(),
          title: r.title,
          reportType: r.reportType,
          period: r.period,
          generatedAt: r.createdAt,
          generatedBy: (r.generatedBy as any)?.name,
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
    console.error('Get reports error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getPerformanceMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Performance metrics fetched successfully',
      data: {
        apiResponseTime: 125,  
        serverUptime: Math.floor(uptime),
        databaseQueryTime: 45,  
        cacheHitRate: 85,  
        errorRate: 0.5,  
        activeRequests: 42,  
        memoryUsage: {
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        },
      },
    });
  } catch (error) {
    console.error('Get performance metrics error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getUserEngagementAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.userId;

    const userStats = await UserStats.findOne({ userId });
    const submissions = await Submission.find({ userId });

    const totalSessions = submissions.length;
    const totalTime = submissions.reduce((sum, s) => sum + (s.executionTime || 0), 0);
    const averageSessionDuration = totalSessions > 0 ? totalTime / totalSessions : 0;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User engagement analytics fetched successfully',
      data: {
        userId,
        totalSessions,
        averageSessionDuration,
        preferredTimeOfDay: 'evening',
        mostActiveDaysOfWeek: ['Monday', 'Wednesday', 'Friday'],
        preferredDifficulty: 'medium',
        learningPath: {
          conceptsLearned: userStats?.currentStreak || 0,
          conceptsInProgress: 5,
        },
        engagementScore: 85,
      },
    });
  } catch (error) {
    console.error('Get user engagement analytics error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};