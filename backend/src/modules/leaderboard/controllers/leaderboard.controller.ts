import { Request, Response } from 'express';
import { UserStats } from '../../userStats/models/UserStats.model';
import { ConceptMastery } from '../../userStats/models/UserStats.model';
import { ContestParticipation } from '../../contests/models/contest.model';
import {
  LeaderboardSnapshot,
  UserRankHistory,
  ConceptLeaderboard,
  FriendRanking,
} from '../models/leaderboard.model';
import { User } from '../../auth/models/User.model';
import { Submission } from '../../submission/models/Submission.model';
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../../../config/constants';
import {
  GlobalLeaderboardResponse,
  ConceptLeaderboardResponse,
  ContestLeaderboardResponse,
  TimePeriodLeaderboardResponse,
  UserRankResponse,
  LeaderboardStatisticsResponse,
} from '../types/leaderboard.types';

export const getGlobalLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 100, skip = 0 } = req.query;

    const users = await UserStats.find({})
      .sort({ levelPoints: -1, totalProblemsSolved: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .populate('userId', 'name profilePicture');

    const total = await UserStats.countDocuments();

    const leaderboard = users.map((stat, index) => ({
      rank: Number(skip) + index + 1,
      userId: stat.userId._id?.toString(),
      userName: (stat.userId as any).name,
      profilePicture: (stat.userId as any).profilePicture,
      totalProblemsSolved: stat.totalProblemsSolved,
      acceptanceRate: stat.acceptanceRate,
      currentLevel: stat.currentLevel,
      levelPoints: stat.levelPoints,
      currentStreak: stat.currentStreak,
      bestRank: stat.bestContestRank,
    }));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Global leaderboard fetched successfully',
      data: {
        leaderboard,
        pagination: {
          total,
          limit: Number(limit),
          skip: Number(skip),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get global leaderboard error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getUserRank = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.userId;

    const userStats = await UserStats.findOne({ userId }).populate('userId', 'name');
    if (!userStats) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'User not found',
        },
      });
      return;
    }

    // Calculate global rank
    const betterUsers = await UserStats.countDocuments({
      levelPoints: { $gt: userStats.levelPoints },
    });

    const globalRank = betterUsers + 1;

    // Get top concepts
    const topConcepts = await ConceptMastery.find({ userId })
      .sort({ masteryScore: -1 })
      .limit(3);

    const conceptRanks = await Promise.all(
      topConcepts.map(async (concept) => {
        const betterInConcept = await ConceptMastery.countDocuments({
          concept: concept.concept,
          masteryScore: { $gt: concept.masteryScore },
        });
        return {
          concept: concept.concept,
          rank: betterInConcept + 1,
          masteryScore: concept.masteryScore,
        };
      })
    );

    // Get best contest
    const bestContestParticipation = await ContestParticipation.findOne({ userId }).sort({
      rank: 1,
    });

    const userRankData: UserRankResponse = {
      userId: userStats.userId.toString(),
      userName: (userStats.userId as any).name,
      globalRank,
      totalProblems: userStats.totalProblemsSolved,
      acceptanceRate: userStats.acceptanceRate,
      levelPoints: userStats.levelPoints,
      topConcepts: conceptRanks,
      bestContest: bestContestParticipation
        ? {
            rank: bestContestParticipation.rank,
            score: bestContestParticipation.score,
          }
        : undefined,
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User rank fetched successfully',
      data: userRankData,
    });
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getConceptLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { concept } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const conceptMasteries = await ConceptMastery.find({ concept })
      .sort({ masteryScore: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .populate('userId', 'name');

    const total = await ConceptMastery.countDocuments({ concept });

    const leaderboard = conceptMasteries.map((cm, index) => ({
      rank: Number(skip) + index + 1,
      userId: cm.userId._id?.toString(),
      userName: (cm.userId as any).name,
      concept: cm.concept,
      masteryScore: cm.masteryScore,
      problemsSolved: cm.problemsSolved,
      proficiencyLevel: cm.level,
    }));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Concept leaderboard fetched successfully',
      data: {
        concept,
        leaderboard,
        pagination: {
          total,
          limit: Number(limit),
          skip: Number(skip),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get concept leaderboard error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getContestLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contestId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const participations = await ContestParticipation.find({ contestId })
      .sort({ score: -1, timeSpent: 1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .populate('userId', 'name');

    const total = await ContestParticipation.countDocuments({ contestId });

    const leaderboard = participations.map((p, index) => ({
      rank: Number(skip) + index + 1,
      userId: p.userId._id?.toString(),
      userName: (p.userId as any).name,
      contestId: p.contestId.toString(),
      score: p.score,
      solutionsSubmitted: p.solutionsSubmitted,
      timeSpent: p.timeSpent,
      submittedAt: p.joinedAt,
    }));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Contest leaderboard fetched successfully',
      data: {
        contestId,
        leaderboard,
        pagination: {
          total,
          limit: Number(limit),
          skip: Number(skip),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get contest leaderboard error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getTimePeriodLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = 'weekly' } = req.query;
    const { limit = 50, skip = 0 } = req.query;

    let startDate = new Date();
    let periodName = 'Weekly';

    if (period === 'daily') {
      startDate.setDate(startDate.getDate() - 1);
      periodName = 'Daily';
    } else if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
      periodName = 'Weekly';
    } else if (period === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
      periodName = 'Monthly';
    } else if (period === 'yearly') {
      startDate.setFullYear(startDate.getFullYear() - 1);
      periodName = 'Yearly';
    }

    const submissions = await Submission.find({
      submittedAt: { $gte: startDate },
    });

    const userScores: { [key: string]: { userId: string; score: number; problems: number } } = {};

    submissions.forEach((sub) => {
      const userId = sub.userId.toString();
      if (!userScores[userId]) {
        userScores[userId] = { userId, score: 0, problems: 0 };
      }
      if (sub.status === 'accepted') {
        userScores[userId].score += 10;
        userScores[userId].problems += 1;
      }
    });

    const sortedUsers = Object.values(userScores)
      .sort((a, b) => b.score - a.score)
      .slice(Number(skip), Number(skip) + Number(limit));

    const leaderboard = await Promise.all(
      sortedUsers.map(async (user, index) => {
        const userData = await User.findById(user.userId).select('name');
        return {
          rank: Number(skip) + index + 1,
          userId: user.userId,
          userName: userData?.name || 'Unknown',
          problemsSolvedInPeriod: user.problems,
          pointsEarned: user.score,
          submissionsInPeriod: user.problems,
          streakInPeriod: 0,
        };
      })
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `${periodName} leaderboard fetched successfully`,
      data: {
        period: periodName,
        leaderboard,
        pagination: {
          total: Object.keys(userScores).length,
          limit: Number(limit),
          skip: Number(skip),
          pages: Math.ceil(Object.keys(userScores).length / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get time period leaderboard error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getFriendLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { limit = 50, skip = 0 } = req.query;

    // TODO: Implement friend system
    // For now, get top users nearby in rankings
    const userStats = await UserStats.findOne({ userId });
    if (!userStats) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'User not found',
        },
      });
      return;
    }

    const userRank = await UserStats.countDocuments({
      levelPoints: { $gt: userStats.levelPoints },
    });

    const friendStats = await UserStats.find({})
      .sort({ levelPoints: -1 })
      .limit(Number(limit))
      .skip(Math.max(0, userRank - 25))
      .populate('userId', 'name profilePicture');

    const leaderboard = await Promise.all(
      friendStats.map(async (stat, index) => {
        const rank = userRank - 25 + index + 1;
        return {
          userId: stat.userId._id?.toString(),
          userName: (stat.userId as any).name,
          profilePicture: (stat.userId as any).profilePicture,
          rank,
          totalProblemsSolved: stat.totalProblemsSolved,
          acceptanceRate: stat.acceptanceRate,
          currentLevel: stat.currentLevel,
          levelPoints: stat.levelPoints,
          isFriend: false, // TODO: Check if friend
        };
      })
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Friend leaderboard fetched successfully',
      data: {
        leaderboard,
      },
    });
  } catch (error) {
    console.error('Get friend leaderboard error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getUserRankHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.userId;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const history = await UserRankHistory.find({
      userId,
      date: { $gte: startDate },
    }).sort({ date: -1 });

    const trends = history.map((h) => ({
      period: h.date.toISOString().split('T')[0],
      rank: h.globalRank,
      pointsEarned: h.levelPoints,
      problemsSolved: h.problemsSolved,
    }));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User rank history fetched successfully',
      data: trends,
    });
  } catch (error) {
    console.error('Get user rank history error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getLeaderboardStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const allUsers = await UserStats.find({});

    if (allUsers.length === 0) {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Leaderboard statistics fetched',
        data: {
          totalUsers: 0,
          averageProblems: 0,
          averageAcceptanceRate: 0,
          averageLevelPoints: 0,
          medianRank: 0,
        },
      });
      return;
    }

    const totalProblems = allUsers.reduce((sum, u) => sum + u.totalProblemsSolved, 0);
    const totalAcceptance = allUsers.reduce((sum, u) => sum + u.acceptanceRate, 0);
    const totalPoints = allUsers.reduce((sum, u) => sum + u.levelPoints, 0);

    const topUser = allUsers[0];

    const stats: LeaderboardStatisticsResponse = {
      totalUsers: allUsers.length,
      averageProblems: Math.round(totalProblems / allUsers.length),
      averageAcceptanceRate: Number((totalAcceptance / allUsers.length).toFixed(2)),
      averageLevelPoints: Math.round(totalPoints / allUsers.length),
      medianRank: Math.round(allUsers.length / 2),
      topUser: {
        rank: 1,
        userName: 'Top Performer',
        problemsSolved: topUser.totalProblemsSolved,
      },
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Leaderboard statistics fetched successfully',
      data: stats,
    });
  } catch (error) {
    console.error('Get leaderboard statistics error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const recordUserRankSnapshot = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const userStats = await UserStats.findOne({ userId });
    if (!userStats) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'User not found',
        },
      });
      return;
    }

    const globalRank = (await UserStats.countDocuments({
      levelPoints: { $gt: userStats.levelPoints },
    })) + 1;

    const snapshot = await UserRankHistory.create({
      userId,
      date: new Date(),
      globalRank,
      levelPoints: userStats.levelPoints,
      problemsSolved: userStats.totalProblemsSolved,
      acceptanceRate: userStats.acceptanceRate,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Rank snapshot recorded successfully',
      data: {
        _id: snapshot._id.toString(),
        globalRank,
        date: snapshot.date,
      },
    });
  } catch (error) {
    console.error('Record rank snapshot error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};