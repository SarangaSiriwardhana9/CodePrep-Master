import { Request, Response } from 'express';
import { User } from '../../auth/models/User.model';
import {
  UserStats,
  UserProfile,
  Achievement,
  ConceptMastery,
  DailyActivity,
} from '../models/UserStats.model';
import { Submission } from '../../submission/models/Submission.model';
import { ContestParticipation } from '../../contests/models/contest.model';
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../../../config/constants';
import {
  UserStatsResponse,
  UserProfileResponse,
  UpdateUserProfileInput,
  UserDashboardResponse,
  ConceptMasteryResponse,
  ComparisonResponse,
} from '../types/userStats.types';

// Helper function to calculate level
const calculateLevel = (points: number): string => {
  if (points < 100) return 'Beginner';
  if (points < 500) return 'Intermediate';
  if (points < 1500) return 'Advanced';
  if (points < 3000) return 'Expert';
  return 'Legend';
};

// Helper function to calculate acceptance rate
const calculateAcceptanceRate = async (userId: string): Promise<number> => {
  const submissions = await Submission.find({ userId });
  if (submissions.length === 0) return 0;
  const accepted = submissions.filter((s) => s.status === 'accepted').length;
  return (accepted / submissions.length) * 100;
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.userId;

    const user = await User.findById(userId);
    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: ERROR_MESSAGES.USER_NOT_FOUND,
        },
      });
      return;
    }

    const profile = await UserProfile.findOne({ userId });

    const profileData: UserProfileResponse = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      profilePicture: profile?.profilePicture,
      bio: profile?.bio,
      location: profile?.location,
      company: profile?.company,
      languages: profile?.languages || [],
      skillLevel: profile?.skillLevel || 'Beginner',
      createdAt: user.createdAt!,
      updatedAt: profile?.updatedAt || user.updatedAt!,
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User profile fetched successfully',
      data: profileData,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const updateData: UpdateUserProfileInput = req.body;

    // Update auth user data if needed
    if (updateData.name) {
      await User.findByIdAndUpdate(userId, { name: updateData.name });
    }

    // Update profile data
    let profile = await UserProfile.findOne({ userId });

    if (!profile) {
      profile = await UserProfile.create({
        userId,
        ...updateData,
      });
    } else {
      Object.assign(profile, updateData);
      await profile.save();
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User profile updated successfully',
      data: {
        _id: userId,
        bio: profile.bio,
        location: profile.location,
        company: profile.company,
        languages: profile.languages,
        skillLevel: profile.skillLevel,
      },
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.userId;

    let stats = await UserStats.findOne({ userId });

    if (!stats) {
      // Initialize stats if not exists
      const submissions = await Submission.find({ userId });
      const accepted = submissions.filter((s) => s.status === 'accepted').length;
      const acceptanceRate = submissions.length > 0 ? (accepted / submissions.length) * 100 : 0;
      const totalTimeSpent = submissions.reduce((sum, s) => sum + (s.executionTime || 0), 0);

      stats = await UserStats.create({
        userId,
        totalProblemsSolved: accepted,
        totalProblemsAttempted: submissions.length,
        acceptanceRate: Number(acceptanceRate.toFixed(2)),
        totalTimeSpent,
        bestContestRank: 0,
        totalContestScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        achievementsUnlocked: 0,
        levelPoints: 0,
        currentLevel: 'Beginner',
      });
    }

    const statsData: UserStatsResponse = {
      _id: stats._id.toString(),
      userId: stats.userId.toString(),
      totalProblemsSolved: stats.totalProblemsSolved,
      totalProblemsAttempted: stats.totalProblemsAttempted,
      acceptanceRate: stats.acceptanceRate,
      totalTimeSpent: stats.totalTimeSpent,
      lastActiveAt: stats.lastActiveAt,
      bestContestRank: stats.bestContestRank,
      totalContestScore: stats.totalContestScore,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      achievementsUnlocked: stats.achievementsUnlocked,
      levelPoints: stats.levelPoints,
      currentLevel: stats.currentLevel,
      updatedAt: stats.updatedAt!,
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User statistics fetched successfully',
      data: statsData,
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getUserDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: ERROR_MESSAGES.USER_NOT_FOUND,
        },
      });
      return;
    }

    // Get or create user profile
    let profile = await UserProfile.findOne({ userId });
    if (!profile) {
      profile = await UserProfile.create({ userId });
    }

    // Get or create stats
    let stats = await UserStats.findOne({ userId });
    if (!stats) {
      const submissions = await Submission.find({ userId });
      const accepted = submissions.filter((s) => s.status === 'accepted').length;
      const acceptanceRate = submissions.length > 0 ? (accepted / submissions.length) * 100 : 0;

      stats = await UserStats.create({
        userId,
        totalProblemsSolved: accepted,
        totalProblemsAttempted: submissions.length,
        acceptanceRate: Number(acceptanceRate.toFixed(2)),
      });
    }

    // Get top concepts
    const topConcepts = await ConceptMastery.find({ userId })
      .sort({ masteryScore: -1 })
      .limit(5);

    // Get achievements
    const achievements = await Achievement.find({ userId, isUnlocked: true }).limit(5);

    // Get recent activity
    const recentSubmissions = await Submission.find({ userId })
      .sort({ submittedAt: -1 })
      .limit(5)
      .populate('problemId', 'title');

    const dashboard: UserDashboardResponse = {
      profile: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        profilePicture: profile.profilePicture,
        bio: profile.bio,
        location: profile.location,
        company: profile.company,
        languages: profile.languages || [],
        skillLevel: profile.skillLevel,
        createdAt: user.createdAt!,
        updatedAt: profile.updatedAt!,
      },
      stats: {
        _id: stats._id.toString(),
        userId: stats.userId.toString(),
        totalProblemsSolved: stats.totalProblemsSolved,
        totalProblemsAttempted: stats.totalProblemsAttempted,
        acceptanceRate: stats.acceptanceRate,
        totalTimeSpent: stats.totalTimeSpent,
        lastActiveAt: stats.lastActiveAt,
        bestContestRank: stats.bestContestRank,
        totalContestScore: stats.totalContestScore,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        achievementsUnlocked: stats.achievementsUnlocked,
        levelPoints: stats.levelPoints,
        currentLevel: stats.currentLevel,
        updatedAt: stats.updatedAt!,
      },
      topConcepts: topConcepts.map((c) => ({
        concept: c.concept,
        masteryScore: c.masteryScore,
        problemsSolved: c.problemsSolved,
        problemsTotal: c.problemsTotal,
        timeSpent: c.timeSpent,
        averageAccuracy: c.averageAccuracy,
        lastPracticedAt: c.lastPracticedAt,
        level: c.level,
      })),
      recentActivity: recentSubmissions.map((s) => ({
        _id: s._id.toString(),
        status: s.status,
        submittedAt: s.submittedAt,
      })),
      achievements: achievements.map((a) => ({
        _id: a._id.toString(),
        userId: a.userId.toString(),
        achievementId: a.achievementId,
        name: a.name,
        description: a.description,
        icon: a.icon,
        category: a.category,
        progress: a.progress,
        progressMax: a.progressMax,
        unlockedAt: a.unlockedAt,
        isUnlocked: a.isUnlocked,
      })),
      suggestedProblems: [],
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User dashboard fetched successfully',
      data: dashboard,
    });
  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getConceptMastery = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.userId;

    const conceptMastery = await ConceptMastery.find({ userId }).sort({ masteryScore: -1 });

    const data = conceptMastery.map((c) => ({
      concept: c.concept,
      masteryScore: c.masteryScore,
      problemsSolved: c.problemsSolved,
      problemsTotal: c.problemsTotal,
      timeSpent: c.timeSpent,
      averageAccuracy: c.averageAccuracy,
      lastPracticedAt: c.lastPracticedAt,
      level: c.level,
    }));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Concept mastery fetched successfully',
      data,
    });
  } catch (error) {
    console.error('Get concept mastery error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getAchievements = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.userId;
    const { unlockedOnly = false } = req.query;

    const filter: any = { userId };
    if (unlockedOnly === 'true') {
      filter.isUnlocked = true;
    }

    const achievements = await Achievement.find(filter).sort({ unlockedAt: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Achievements fetched successfully',
      data: achievements.map((a) => ({
        _id: a._id.toString(),
        achievementId: a.achievementId,
        name: a.name,
        description: a.description,
        icon: a.icon,
        category: a.category,
        progress: a.progress,
        progressMax: a.progressMax,
        unlockedAt: a.unlockedAt,
        isUnlocked: a.isUnlocked,
      })),
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getActivityCalendar = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { days = 30 } = req.query;

    const daysNum = Math.min(Number(days), 365); // Max 365 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const activities = await DailyActivity.find({
      userId,
      date: { $gte: startDate },
    }).sort({ date: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Activity calendar fetched successfully',
      data: activities.map((a) => ({
        date: a.date.toISOString().split('T')[0],
        problemsSolved: a.problemsSolved,
        attemptsMade: a.attemptsMade,
        timeSpent: a.timeSpent,
        streak: a.streak,
        submissions: a.submissions,
      })),
    });
  } catch (error) {
    console.error('Get activity calendar error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const compareUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { comparedWithUserId } = req.params;

    if (!comparedWithUserId) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'comparedWithUserId is required',
        },
      });
      return;
    }

    const userStats = await UserStats.findOne({ userId });
    const comparedStats = await UserStats.findOne({ userId: comparedWithUserId });

    if (!userStats || !comparedStats) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'One or both users not found',
        },
      });
      return;
    }

    const userContestParticipations = await ContestParticipation.find({ userId }).sort({
      rank: 1,
    });
    const comparedContestParticipations = await ContestParticipation.find({
      userId: comparedWithUserId,
    }).sort({ rank: 1 });

    const userAverageRank =
      userContestParticipations.length > 0
        ? userContestParticipations.reduce((sum, p) => sum + p.rank, 0) /
          userContestParticipations.length
        : 0;

    const comparedAverageRank =
      comparedContestParticipations.length > 0
        ? comparedContestParticipations.reduce((sum, p) => sum + p.rank, 0) /
          comparedContestParticipations.length
        : 0;

    const comparison: ComparisonResponse = {
      userId: userId!,
      comparedWithUserId: comparedWithUserId,
      comparison: {
        problemsSolved: {
          yours: userStats.totalProblemsSolved,
          theirs: comparedStats.totalProblemsSolved,
        },
        acceptanceRate: {
          yours: userStats.acceptanceRate,
          theirs: comparedStats.acceptanceRate,
        },
        currentStreak: {
          yours: userStats.currentStreak,
          theirs: comparedStats.currentStreak,
        },
        totalContestScore: {
          yours: userStats.totalContestScore,
          theirs: comparedStats.totalContestScore,
        },
        averageRank: {
          yours: Number(userAverageRank.toFixed(2)),
          theirs: Number(comparedAverageRank.toFixed(2)),
        },
      },
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User comparison fetched successfully',
      data: comparison,
    });
  } catch (error) {
    console.error('Compare users error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const updateConceptMastery = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { concept, masteryScore, problemsSolved, averageAccuracy } = req.body;

    if (!concept || masteryScore === undefined) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'concept and masteryScore are required',
        },
      });
      return;
    }

    let conceptMastery = await ConceptMastery.findOne({ userId, concept });

    if (!conceptMastery) {
      conceptMastery = await ConceptMastery.create({
        userId,
        concept,
        masteryScore,
        problemsSolved: problemsSolved || 0,
        averageAccuracy: averageAccuracy || 0,
        level: masteryScore < 30 ? 'Beginner' : masteryScore < 60 ? 'Intermediate' : masteryScore < 85 ? 'Advanced' : 'Expert',
      });
    } else {
      conceptMastery.masteryScore = masteryScore;
      if (problemsSolved !== undefined) conceptMastery.problemsSolved = problemsSolved;
      if (averageAccuracy !== undefined) conceptMastery.averageAccuracy = averageAccuracy;
      conceptMastery.level =
        masteryScore < 30 ? 'Beginner' : masteryScore < 60 ? 'Intermediate' : masteryScore < 85 ? 'Advanced' : 'Expert';
      conceptMastery.lastPracticedAt = new Date();
      await conceptMastery.save();
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Concept mastery updated successfully',
      data: {
        concept: conceptMastery.concept,
        masteryScore: conceptMastery.masteryScore,
        level: conceptMastery.level,
        problemsSolved: conceptMastery.problemsSolved,
      },
    });
  } catch (error) {
    console.error('Update concept mastery error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const unlockAchievement = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { achievementId, name, description, icon = '🏆', category } = req.body;

    if (!achievementId || !name || !category) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'achievementId, name, and category are required',
        },
      });
      return;
    }

    let achievement = await Achievement.findOne({ userId, achievementId });

    if (!achievement) {
      achievement = await Achievement.create({
        userId,
        achievementId,
        name,
        description,
        icon,
        category,
        progress: 100,
        progressMax: 100,
        isUnlocked: true,
        unlockedAt: new Date(),
      });
    } else if (!achievement.isUnlocked) {
      achievement.isUnlocked = true;
      achievement.unlockedAt = new Date();
      await achievement.save();
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Achievement unlocked successfully',
      data: {
        achievementId: achievement.achievementId,
        name: achievement.name,
        icon: achievement.icon,
        unlockedAt: achievement.unlockedAt,
      },
    });
  } catch (error) {
    console.error('Unlock achievement error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 100, skip = 0 } = req.query;

    const leaderboard = await UserStats.find({})
      .sort({ levelPoints: -1, totalProblemsSolved: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .populate('userId', 'name');

    const total = await UserStats.countDocuments();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Global leaderboard fetched successfully',
      data: {
        leaderboard: leaderboard.map((stat, index) => ({
          rank: Number(skip) + index + 1,
          userId: stat.userId.toString(),
          problemsSolved: stat.totalProblemsSolved,
          levelPoints: stat.levelPoints,
          currentLevel: stat.currentLevel,
          acceptanceRate: stat.acceptanceRate,
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
    console.error('Get leaderboard error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};