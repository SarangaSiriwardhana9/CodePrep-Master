import { Request, Response } from 'express';
import { Submission } from '../models/Submission.model';
import { Problem } from '../../problem/models/Problem.model';
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../../../config/constants';
import {
  SubmissionInput,
  SubmissionStats,
  ProblemSubmissionStats,
} from '../types/Submission.types';

export const submitSolution = async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemId, code, language, testCasesPassed, totalTestCases, executionTime, memoryUsed } = req.body as SubmissionInput;
    const userId = req.userId;

    // Validation
    if (!problemId || !code || !language) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide problemId, code, and language',
          details: ['problemId', 'code', 'language'],
        },
      });
      return;
    }

    // Validate language
    const validLanguages = ['javascript', 'python', 'java', 'cpp'];
    if (!validLanguages.includes(language)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid programming language',
        },
      });
      return;
    }

    // Check if problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: ERROR_MESSAGES.PROBLEM_NOT_FOUND,
        },
      });
      return;
    }

    // Validate code length (not empty and reasonable size)
    if (code.trim().length === 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Code cannot be empty',
        },
      });
      return;
    }

    if (code.length > 100000) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Code is too large (max 100KB)',
        },
      });
      return;
    }

    // Create submission
    const submission = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: testCasesPassed === totalTestCases ? 'accepted' : 'wrong_answer',
      testCasesPassed: testCasesPassed || 0,
      totalTestCases: totalTestCases || 0,
      executionTime: executionTime || 0,
      memoryUsed: memoryUsed || 0,
      submittedAt: new Date(),
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Solution submitted successfully',
      data: {
        _id: submission._id.toString(),
        userId: submission.userId.toString(),
        problemId: submission.problemId.toString(),
        language: submission.language,
        status: submission.status,
        testCasesPassed: submission.testCasesPassed,
        totalTestCases: submission.totalTestCases,
        executionTime: submission.executionTime,
        memoryUsed: submission.memoryUsed,
        submittedAt: submission.submittedAt,
      },
    });
  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getSubmissionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const userId = req.userId;

    const submission = await Submission.findById(submissionId).populate('problemId', 'title');

    if (!submission) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Submission not found',
        },
      });
      return;
    }

    // Check if user owns this submission
    if (submission.userId.toString() !== userId) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: ERROR_MESSAGES.UNAUTHORIZED,
        },
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Submission fetched successfully',
      data: {
        _id: submission._id.toString(),
        userId: submission.userId.toString(),
        problemId: submission.problemId.toString(),
        code: submission.code,
        language: submission.language,
        status: submission.status,
        testCasesPassed: submission.testCasesPassed,
        totalTestCases: submission.totalTestCases,
        executionTime: submission.executionTime,
        memoryUsed: submission.memoryUsed,
        feedback: submission.feedback,
        submittedAt: submission.submittedAt,
      },
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getUserSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { problemId, status, limit = 10, skip = 0 } = req.query;

    // Build filter
    interface FilterQuery {
      userId: string;
      problemId?: string;
      status?: string;
    }
    
    const filter: FilterQuery = { userId };

    if (problemId) {
      filter.problemId = problemId as string;
    }

    if (status && ['accepted', 'wrong_answer', 'runtime_error', 'time_limit_exceeded', 'memory_limit_exceeded', 'pending'].includes(status as string)) {
      filter.status = status as string;
    }

    const submissions = await Submission.find(filter)
      .populate('problemId', 'title difficulty')
      .sort({ submittedAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Submission.countDocuments(filter);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User submissions fetched successfully',
      data: {
        submissions: submissions.map((sub) => ({
          _id: sub._id.toString(),
          userId: sub.userId.toString(),
          problemId: sub.problemId.toString(),
          language: sub.language,
          status: sub.status,
          testCasesPassed: sub.testCasesPassed,
          totalTestCases: sub.totalTestCases,
          executionTime: sub.executionTime,
          memoryUsed: sub.memoryUsed,
          submittedAt: sub.submittedAt,
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
    console.error('Get user submissions error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getProblemSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    // Check if problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: ERROR_MESSAGES.PROBLEM_NOT_FOUND,
        },
      });
      return;
    }

    const submissions = await Submission.find({ problemId })
      .populate('userId', 'name email')
      .sort({ submittedAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Submission.countDocuments({ problemId });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Problem submissions fetched successfully',
      data: {
        submissions: submissions.map((sub) => ({
          _id: sub._id.toString(),
          userId: sub.userId.toString(),
          problemId: sub.problemId.toString(),
          language: sub.language,
          status: sub.status,
          testCasesPassed: sub.testCasesPassed,
          totalTestCases: sub.totalTestCases,
          executionTime: sub.executionTime,
          memoryUsed: sub.memoryUsed,
          submittedAt: sub.submittedAt,
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
    console.error('Get problem submissions error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getUserSubmissionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const submissions = await Submission.find({ userId });

    if (submissions.length === 0) {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Submission stats fetched successfully',
        data: {
          totalSubmissions: 0,
          acceptedSubmissions: 0,
          rejectedSubmissions: 0,
          acceptanceRate: 0,
          lastSubmission: null,
          averageExecutionTime: 0,
          averageMemoryUsed: 0,
        },
      });
      return;
    }

    const acceptedSubmissions = submissions.filter((s) => s.status === 'accepted').length;
    const rejectedSubmissions = submissions.length - acceptedSubmissions;
    const acceptanceRate = (acceptedSubmissions / submissions.length) * 100;

    const totalExecutionTime = submissions.reduce((sum, s) => sum + (s.executionTime || 0), 0);
    const averageExecutionTime = totalExecutionTime / submissions.length;

    const totalMemoryUsed = submissions.reduce((sum, s) => sum + (s.memoryUsed || 0), 0);
    const averageMemoryUsed = totalMemoryUsed / submissions.length;

    const lastSubmission = submissions.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())[0];

    const stats: SubmissionStats = {
      totalSubmissions: submissions.length,
      acceptedSubmissions,
      rejectedSubmissions,
      acceptanceRate: Number(acceptanceRate.toFixed(2)),
      lastSubmission: lastSubmission.submittedAt,
      averageExecutionTime: Number(averageExecutionTime.toFixed(2)),
      averageMemoryUsed: Number(averageMemoryUsed.toFixed(2)),
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Submission stats fetched successfully',
      data: stats,
    });
  } catch (error) {
    console.error('Get submission stats error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getProblemAcceptanceStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemId } = req.params;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: ERROR_MESSAGES.PROBLEM_NOT_FOUND,
        },
      });
      return;
    }

    const submissions = await Submission.find({ problemId });

    if (submissions.length === 0) {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Problem acceptance stats fetched',
        data: {
          problemId: problemId,
          title: problem.title,
          totalSubmissions: 0,
          acceptedCount: 0,
          rejectionRate: 0,
          averageExecutionTime: 0,
        },
      });
      return;
    }

    const acceptedCount = submissions.filter((s) => s.status === 'accepted').length;
    const rejectionRate = ((submissions.length - acceptedCount) / submissions.length) * 100;

    const totalExecutionTime = submissions.reduce((sum, s) => sum + (s.executionTime || 0), 0);
    const averageExecutionTime = totalExecutionTime / submissions.length;

    const stats: ProblemSubmissionStats = {
      problemId: problemId,
      title: problem.title,
      totalSubmissions: submissions.length,
      acceptedCount,
      rejectionRate: Number(rejectionRate.toFixed(2)),
      averageExecutionTime: Number(averageExecutionTime.toFixed(2)),
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Problem acceptance stats fetched',
      data: stats,
    });
  } catch (error) {
    console.error('Get problem stats error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const updateSubmissionFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const { feedback, status } = req.body;

    if (!feedback && !status) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Provide at least one field to update',
        },
      });
      return;
    }

    const validStatuses = ['accepted', 'wrong_answer', 'runtime_error', 'time_limit_exceeded', 'memory_limit_exceeded', 'pending'];
    
    if (status && !validStatuses.includes(status)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid status value',
        },
      });
      return;
    }

    const updateData: any = {};
    if (feedback) updateData.feedback = feedback;
    if (status) updateData.status = status;

    const submission = await Submission.findByIdAndUpdate(submissionId, updateData, { new: true });

    if (!submission) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Submission not found',
        },
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Submission updated successfully',
      data: {
        _id: submission._id.toString(),
        feedback: submission.feedback,
        status: submission.status,
      },
    });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const deleteSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const userId = req.userId;

    const submission = await Submission.findById(submissionId);

    if (!submission) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Submission not found',
        },
      });
      return;
    }

    // Check ownership
    if (submission.userId.toString() !== userId) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: ERROR_MESSAGES.UNAUTHORIZED,
        },
      });
      return;
    }

    await Submission.findByIdAndDelete(submissionId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Submission deleted successfully',
    });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};