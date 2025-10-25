import { Request, Response } from 'express';
import { Problem } from '../models/Problem.model';
import { CreateProblemInput, UpdateProblemInput, ProblemFilterQuery } from '../types/problem.types';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../../config/constants';

// FR-PROB-002: Get All Problems with Filtering & Search
export const getAllProblems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { difficulty, concepts, companyTags, search, page = 1, limit = 20, sortBy = 'recent' } = req.query as any;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: any = {};

    if (difficulty) {
      if (Array.isArray(difficulty)) {
        filter.difficulty = { $in: difficulty };
      } else {
        filter.difficulty = difficulty;
      }
    }

    if (concepts) {
      const conceptArray = Array.isArray(concepts) ? concepts : [concepts];
      filter.concepts = { $in: conceptArray.map((c: string) => c.toLowerCase()) };
    }

    if (companyTags) {
      const tagsArray = Array.isArray(companyTags) ? companyTags : [companyTags];
      filter.companyTags = { $in: tagsArray };
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort query
    let sortQuery: any = {};
    switch (sortBy) {
      case 'acceptance':
        sortQuery = { acceptanceRate: -1 };
        break;
      case 'difficulty':
        sortQuery = { difficulty: 1 };
        break;
      case 'recent':
      default:
        sortQuery = { createdAt: -1 };
    }

    // Execute query
    const total = await Problem.countDocuments(filter);
    const problems = await Problem.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum)
      .select('-testCases -solution.code')
      .lean();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Problems fetched successfully',
      data: {
        problems,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
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

 
// FR-PROB-003: Get Problem by ID or Slug
export const getProblemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    let problem;

    // Check if it's a valid MongoDB ID or a slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      problem = await Problem.findById(id).lean();
    } else {
      // Treat as slug
      problem = await Problem.findOne({ slug: id }).lean();
    }

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

    // Hide hidden test cases for non-authenticated users
    if (problem.testCases) {
      problem.testCases = problem.testCases.map((tc: any) => ({
        input: tc.input,
        expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
        isHidden: tc.isHidden,
      }));
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Problem fetched successfully',
      data: { problem },
    });
  } catch (error) {
    console.error('Get problem by ID error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};
// FR-PROB-004: Create Problem (Admin Only)
export const createProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req;
    const problemData: CreateProblemInput = req.body;

    // Validate required fields
    const requiredFields = ['title', 'slug', 'difficulty', 'description', 'concepts', 'constraints', 'examples', 'testCases'];
    const missingFields = requiredFields.filter((field) => !problemData[field as keyof CreateProblemInput]);

    if (missingFields.length > 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields',
          details: missingFields,
        },
      });
      return;
    }

    // Check if slug already exists
    const existingProblem = await Problem.findOne({ slug: problemData.slug.toLowerCase() });
    if (existingProblem) {
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: {
          code: 'DUPLICATE_RESOURCE',
          message: 'Problem with this slug already exists',
        },
      });
      return;
    }

    // Create problem
    const newProblem = await Problem.create({
      ...problemData,
      slug: problemData.slug.toLowerCase(),
      concepts: problemData.concepts.map((c) => c.toLowerCase()),
      createdBy: userId,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Problem created successfully',
      data: { problem: newProblem },
    });
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

// FR-PROB-005: Update Problem (Admin Only)
export const updateProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateProblemInput = req.body;

    // Don't allow empty updates
    if (Object.keys(updateData).length === 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No fields to update',
        },
      });
      return;
    }

    // Check for duplicate slug if slug is being updated
    if (updateData.slug) {
      const existingProblem = await Problem.findOne({
        slug: updateData.slug.toLowerCase(),
        _id: { $ne: id },
      });

      if (existingProblem) {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          error: {
            code: 'DUPLICATE_RESOURCE',
            message: 'Problem with this slug already exists',
          },
        });
        return;
      }

      updateData.slug = updateData.slug.toLowerCase();
    }

    // Normalize concepts to lowercase
    if (updateData.concepts) {
      updateData.concepts = updateData.concepts.map((c) => c.toLowerCase());
    }

    const updatedProblem = await Problem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProblem) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Problem not found',
        },
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Problem updated successfully',
      data: { problem: updatedProblem },
    });
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

// FR-PROB-006: Delete Problem (Admin Only)
export const deleteProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedProblem = await Problem.findByIdAndDelete(id);

    if (!deletedProblem) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Problem not found',
        },
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Problem deleted successfully',
      data: { problem: deletedProblem },
    });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

// FR-PROB-007: Get Problem Stats
export const getProblemStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalProblems = await Problem.countDocuments();

    const statsByDifficulty = await Problem.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          avgAcceptance: { $avg: '$acceptanceRate' },
        },
      },
    ]);

    const totalAttempts = await Problem.aggregate([
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: '$totalAttempts' },
          totalSolves: { $sum: '$totalSolves' },
        },
      },
    ]);

    const conceptStats = await Problem.aggregate([
      {
        $unwind: '$concepts',
      },
      {
        $group: {
          _id: '$concepts',
          problemCount: { $sum: 1 },
        },
      },
      {
        $sort: { problemCount: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        totalProblems,
        statsByDifficulty,
        overall: totalAttempts[0] || { totalAttempts: 0, totalSolves: 0 },
        topConcepts: conceptStats,
      },
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

// FR-PROB-008: Search Problems
export const searchProblems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Search query is required',
        },
      });
      return;
    }

    const problems = await Problem.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(Math.min(parseInt(limit as string) || 10, 50))
      .select('-testCases -solution.code')
      .lean();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Search results',
      data: { problems, total: problems.length },
    });
  } catch (error) {
    console.error('Search problems error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

// FR-PROB-009: Get Problems by Concept
export const getProblemsByConcept = async (req: Request, res: Response): Promise<void> => {
  try {
    const { concept, difficulty, page = 1, limit = 20 } = req.query;

    if (!concept) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Concept parameter is required',
        },
      });
      return;
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { concepts: (concept as string).toLowerCase() };

    if (difficulty) {
      if (Array.isArray(difficulty)) {
        filter.difficulty = { $in: difficulty };
      } else {
        filter.difficulty = difficulty;
      }
    }

    const total = await Problem.countDocuments(filter);
    const problems = await Problem.find(filter)
      .sort({ difficulty: 1, acceptanceRate: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-testCases -solution.code')
      .lean();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        concept,
        problems,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get problems by concept error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};
