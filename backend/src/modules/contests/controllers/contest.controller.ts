import { Request, Response } from 'express';
import {
  Contest,
  ContestParticipation,
  ContestSubmission,
} from '../models/contest.model';
import { Problem } from '../../problem/models/Problem.model';
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../../../config/constants';
import {
  ContestInput,
  ContestSubmissionInput,
  UpdateContestInput,
  ContestStats,
} from '../types/contest.types';

// Helper function to calculate contest status
const getContestStatus = (startTime: Date, endTime: Date) => {
  const now = new Date();
  if (now < startTime) {
    return 'upcoming';
  } else if (now >= startTime && now < endTime) {
    return 'ongoing';
  } else {
    return 'ended';
  }
};

// Helper function to calculate score
const calculateScore = (testCasesPassed: number, totalTestCases: number, executionTime: number): number => {
  if (testCasesPassed === 0) return 0;
  const accuracy = (testCasesPassed / totalTestCases) * 100;
  const timeBonus = Math.max(0, 100 - executionTime / 10);
  return Math.round((accuracy + timeBonus) / 2);
};

export const createContest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, startTime, endTime, difficulty, totalProblems, problemIds, maxParticipants, rules, rewards } = req.body as ContestInput;
    const userId = req.userId;

    // Validation
    if (!title || !description || !startTime || !endTime || !difficulty || !totalProblems || !problemIds) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide all required fields',
          details: ['title', 'description', 'startTime', 'endTime', 'difficulty', 'totalProblems', 'problemIds'],
        },
      });
      return;
    }

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Start time must be before end time',
        },
      });
      return;
    }

    if (start < new Date()) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Start time cannot be in the past',
        },
      });
      return;
    }

    // Validate problem count
    if (problemIds.length !== totalProblems) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Number of problem IDs must match totalProblems',
        },
      });
      return;
    }

    // Verify all problems exist
    const problems = await Problem.find({ _id: { $in: problemIds } });
    if (problems.length !== totalProblems) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Some problem IDs do not exist',
        },
      });
      return;
    }

    // Create contest
    const contest = await Contest.create({
      title,
      description,
      createdBy: userId,
      startTime: start,
      endTime: end,
      status: getContestStatus(start, end),
      difficulty,
      totalProblems,
      problemIds,
      maxParticipants,
      currentParticipants: 0,
      rules,
      rewards,
    });
    await contest.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Contest created successfully',
      data: {
        _id: (contest._id as any).toString(),
        title: contest.title,
        description: contest.description,
        createdBy: contest.createdBy.toString(),
        startTime: contest.startTime,
        endTime: contest.endTime,
        status: contest.status,
        difficulty: contest.difficulty,
        totalProblems: contest.totalProblems,
        currentParticipants: contest.currentParticipants,
        maxParticipants: contest.maxParticipants,
        createdAt: contest.createdAt,
      },
    });
  } catch (error) {
    console.error('Create contest error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getContests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, difficulty, limit = 10, skip = 0, search } = req.query;

    interface FilterQuery {
      status?: string;
      difficulty?: string;
      title?: { $regex: string; $options: string };
    }

    const filter: FilterQuery = {};

    if (status && ['upcoming', 'ongoing', 'ended'].includes(status as string)) {
      filter.status = status as string;
    }

    if (difficulty && ['easy', 'medium', 'hard', 'mixed'].includes(difficulty as string)) {
      filter.difficulty = difficulty as string;
    }

    if (search) {
      filter.title = { $regex: search as string, $options: 'i' };
    }

    const contests = await Contest.find(filter)
      .populate('createdBy', 'name email')
      .sort({ startTime: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Contest.countDocuments(filter);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Contests fetched successfully',
      data: {
        contests: contests.map((contest) => ({
          _id: (contest._id as any).toString(),
          title: contest.title,
          description: contest.description,
          createdBy: contest.createdBy.toString(),
          startTime: contest.startTime,
          endTime: contest.endTime,
          status: contest.status,
          difficulty: contest.difficulty,
          totalProblems: contest.totalProblems,
          currentParticipants: contest.currentParticipants,
          maxParticipants: contest.maxParticipants,
          createdAt: contest.createdAt,
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
    console.error('Get contests error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getContestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contestId } = req.params;

    const contest = await Contest.findById(contestId).populate('createdBy', 'name email').populate('problemIds', 'title difficulty');

    if (!contest) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Contest not found',
        },
      });
      return;
    }

    // Get participant count
    const participantCount = await ContestParticipation.countDocuments({ contestId });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Contest fetched successfully',
      data: {
        _id: (contest._id as any).toString(),
        title: contest.title,
        description: contest.description,
        createdBy: contest.createdBy.toString(),
        startTime: contest.startTime,
        endTime: contest.endTime,
        status: contest.status,
        difficulty: contest.difficulty,
        totalProblems: contest.totalProblems,
        problemIds: contest.problemIds,
        currentParticipants: participantCount,
        maxParticipants: contest.maxParticipants,
        rules: contest.rules,
        rewards: contest.rewards,
        createdAt: contest.createdAt,
      },
    });
  } catch (error) {
    console.error('Get contest error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const registerForContest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contestId } = req.params;
    const userId = req.userId;

    // Check if contest exists
    const contest = await Contest.findById(contestId);
    if (!contest) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Contest not found',
        },
      });
      return;
    }

    // Check if contest is not ended
    if (contest.status === 'ended') {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cannot register for ended contest',
        },
      });
      return;
    }

    // Check if already registered
    const existing = await ContestParticipation.findOne({ contestId, userId });
    if (existing) {
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: {
          code: 'DUPLICATE_RESOURCE',
          message: 'Already registered for this contest',
        },
      });
      return;
    }

    // Check max participants
    if (contest.maxParticipants) {
      const participantCount = await ContestParticipation.countDocuments({ contestId });
      if (participantCount >= contest.maxParticipants) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Contest is full',
          },
        });
        return;
      }
    }

    // Register user
    const participation = await ContestParticipation.create({
      contestId,
      userId,
      joinedAt: new Date(),
      score: 0,
      rank: 0,
      solutionsSubmitted: 0,
      timeSpent: 0,
      totalScore: 0,
    });

    // Increment participant count
    await Contest.findByIdAndUpdate(contestId, {
      $inc: { currentParticipants: 1 },
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Successfully registered for contest',
      data: {
        _id: (participation._id as any).toString(),
        contestId: participation.contestId.toString(),
        userId: participation.userId.toString(),
        joinedAt: participation.joinedAt,
      },
    });
  } catch (error) {
    console.error('Register for contest error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const submitDuringContest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contestId } = req.params;
    const { problemId, code, language, testCasesPassed, totalTestCases, executionTime, memoryUsed } = req.body as ContestSubmissionInput;
    const userId = req.userId;

    // Validation
    if (!problemId || !code || !language) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide problemId, code, and language',
        },
      });
      return;
    }

    // Check if contest exists and is ongoing
    const contest = await Contest.findById(contestId);
    if (!contest) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Contest not found',
        },
      });
      return;
    }

    if (contest.status !== 'ongoing') {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Contest is not ongoing',
        },
      });
      return;
    }

    // Check if user is registered
    const participation = await ContestParticipation.findOne({ contestId, userId });
    if (!participation) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Not registered for this contest',
        },
      });
      return;
    }

    // Check if problem is part of contest
    if (!contest.problemIds.includes(problemId as any)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Problem is not part of this contest',
        },
      });
      return;
    }

    // Calculate score
    const score = calculateScore(testCasesPassed, totalTestCases, executionTime);
    const status = testCasesPassed === totalTestCases ? 'accepted' : 'wrong_answer';

    // Create submission
    const submission = await ContestSubmission.create({
      contestId,
      userId,
      problemId,
      code,
      language,
      status,
      score,
      testCasesPassed,
      totalTestCases,
      executionTime,
      memoryUsed,
      submittedAt: new Date(),
    });

    // Update participation stats
    participation.score += score;
    participation.solutionsSubmitted += 1;
    participation.totalScore = participation.score;
    await participation.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Solution submitted successfully',
      data: {
        _id: (submission._id as any).toString(),
        contestId: submission.contestId.toString(),
        userId: submission.userId.toString(),
        problemId: submission.problemId.toString(),
        language: submission.language,
        status: submission.status,
        score: submission.score,
        testCasesPassed: submission.testCasesPassed,
        totalTestCases: submission.totalTestCases,
        submittedAt: submission.submittedAt,
      },
    });
  } catch (error) {
    console.error('Submit during contest error:', error);
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

    // Check if contest exists
    const contest = await Contest.findById(contestId);
    if (!contest) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Contest not found',
        },
      });
      return;
    }

    // Get leaderboard
    const participants = await ContestParticipation.find({ contestId })
      .populate('userId', 'name email')
      .sort({ score: -1, timeSpent: 1 })
      .limit(Number(limit))
      .skip(Number(skip));

    // Update ranks
    let rank = Number(skip) + 1;
    const leaderboard = participants.map((participant) => ({
      rank: rank++,
      userId: participant.userId.toString(),
      score: participant.score,
      solutionsSubmitted: participant.solutionsSubmitted,
      timeSpent: participant.timeSpent,
      joinedAt: participant.joinedAt,
    }));

    const total = await ContestParticipation.countDocuments({ contestId });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Leaderboard fetched successfully',
      data: {
        contestId: contestId,
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

export const getUserContestStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    // Get all participations
    const participations = await ContestParticipation.find({ userId });

    if (participations.length === 0) {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'User contest stats fetched',
        data: {
          totalContests: 0,
          participatedContests: 0,
          wonContests: 0,
          averageRank: 0,
          bestRank: 0,
          totalScore: 0,
          averageScore: 0,
        },
      });
      return;
    }

    const wonContests = participations.filter((p) => p.rank === 1).length;
    const bestRank = Math.min(...participations.map((p) => p.rank));
    const totalScore = participations.reduce((sum, p) => sum + p.score, 0);
    const averageScore = totalScore / participations.length;
    const averageRank = participations.reduce((sum, p) => sum + p.rank, 0) / participations.length;

    const stats: ContestStats = {
      totalContests: (await Contest.countDocuments({})),
      participatedContests: participations.length,
      wonContests,
      averageRank: Number(averageRank.toFixed(2)),
      bestRank,
      totalScore,
      averageScore: Number(averageScore.toFixed(2)),
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User contest stats fetched',
      data: stats,
    });
  } catch (error) {
    console.error('Get user contest stats error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const updateContest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contestId } = req.params;
    const updateData: UpdateContestInput = req.body;
    const userId = req.userId;

    // Check if contest exists
    const contest = await Contest.findById(contestId);
    if (!contest) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Contest not found',
        },
      });
      return;
    }

    // Check if user is creator
    if (contest.createdBy.toString() !== userId) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: ERROR_MESSAGES.UNAUTHORIZED,
        },
      });
      return;
    }

    // Check if contest has started (cannot update ongoing/ended contests)
    if (contest.status !== 'upcoming') {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cannot update ongoing or ended contests',
        },
      });
      return;
    }

    // Update fields
    const updatedContest = await Contest.findByIdAndUpdate(contestId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Contest updated successfully',
      data: {
        _id: (updatedContest!._id as any).toString(),
        title: updatedContest!.title,
        description: updatedContest!.description,
        difficulty: updatedContest!.difficulty,
        totalProblems: updatedContest!.totalProblems,
        currentParticipants: updatedContest!.currentParticipants,
        updatedAt: updatedContest!.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update contest error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const deleteContest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contestId } = req.params;
    const userId = req.userId;

    // Check if contest exists
    const contest = await Contest.findById(contestId);
    if (!contest) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Contest not found',
        },
      });
      return;
    }

    // Check if user is creator
    if (contest.createdBy.toString() !== userId) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: ERROR_MESSAGES.UNAUTHORIZED,
        },
      });
      return;
    }

    // Delete contest and related data
    await Contest.findByIdAndDelete(contestId);
    await ContestParticipation.deleteMany({ contestId });
    await ContestSubmission.deleteMany({ contestId });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Contest deleted successfully',
    });
  } catch (error) {
    console.error('Delete contest error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getContestResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contestId } = req.params;
    const userId = req.userId;

    // Get contest
    const contest = await Contest.findById(contestId);
    if (!contest) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Contest not found',
        },
      });
      return;
    }

    // Get user participation
    const participation = await ContestParticipation.findOne({ contestId, userId });
    if (!participation) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Not registered for this contest',
        },
      });
      return;
    }

    // Get user's submissions in this contest
    const submissions = await ContestSubmission.find({ contestId, userId });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Contest results fetched',
      data: {
        contestId: contestId,
        userId: userId,
        totalScore: participation.totalScore,
        rank: participation.rank,
        solutionsSubmitted: participation.solutionsSubmitted,
        totalProblems: contest.totalProblems,
        submissions: submissions.map((sub) => ({
          _id: (sub._id as any).toString(),
          problemId: sub.problemId.toString(),
          status: sub.status,
          score: sub.score,
          submittedAt: sub.submittedAt,
        })),
        contestTitle: contest.title,
        startTime: contest.startTime,
        endTime: contest.endTime,
      },
    });
  } catch (error) {
    console.error('Get contest results error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};