import { Request, Response } from 'express';
import { Tag, UserTag, ProblemTag, LearningPath } from '../models/Tag.model';
import { Problem } from '../../problem/models/Problem.model';
import { Submission } from '../../submission/models/Submission.model';
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../../../config/constants';
import {
  TagInput,
  TagResponse,
  UserTagResponse,
  TagStatisticsResponse,
  UpdateTagInput,
  LearningPathResponse,
} from '../types/tag.types';

// Helper to create slug from name
const createSlug = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

// Helper to determine proficiency level
const getProficiencyLevel = (masteryLevel: number): 'Novice' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' => {
  if (masteryLevel < 20) return 'Novice';
  if (masteryLevel < 40) return 'Beginner';
  if (masteryLevel < 60) return 'Intermediate';
  if (masteryLevel < 80) return 'Advanced';
  return 'Expert';
};

export const createTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, category, difficulty } = req.body as TagInput;

    if (!name) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Tag name is required',
        },
      });
      return;
    }

    // Check if tag already exists
    const existingTag = await Tag.findOne({ name: name.toLowerCase() });
    if (existingTag) {
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: {
          code: 'DUPLICATE_RESOURCE',
          message: 'Tag already exists',
        },
      });
      return;
    }

    const slug = createSlug(name);

    const tag = await Tag.create({
      name,
      slug,
      description,
      category,
      difficulty,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Tag created successfully',
      data: {
        _id: tag._id.toString(),
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        category: tag.category,
        difficulty: tag.difficulty,
        problemCount: tag.problemCount,
        usersMastered: tag.usersMastered,
      },
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, difficulty, search, limit = 20, skip = 0 } = req.query;

    interface FilterQuery {
      category?: string;
      difficulty?: string;
      $or?: Array<{ name?: { $regex: string; $options: string }; description?: { $regex: string; $options: string } }>;
    }

    const filter: FilterQuery = {};

    if (category && ['algorithm', 'data-structure', 'pattern', 'technique'].includes(category as string)) {
      filter.category = category as string;
    }

    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty as string)) {
      filter.difficulty = difficulty as string;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } },
      ];
    }

    const tags = await Tag.find(filter)
      .sort({ problemCount: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Tag.countDocuments(filter);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Tags fetched successfully',
      data: {
        tags: tags.map((t) => ({
          _id: t._id.toString(),
          name: t.name,
          slug: t.slug,
          description: t.description,
          category: t.category,
          difficulty: t.difficulty,
          problemCount: t.problemCount,
          usersMastered: t.usersMastered,
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
    console.error('Get tags error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getTagById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tagId } = req.params;

    const tag = await Tag.findById(tagId);
    if (!tag) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Tag not found',
        },
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Tag fetched successfully',
      data: {
        _id: tag._id.toString(),
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        category: tag.category,
        difficulty: tag.difficulty,
        problemCount: tag.problemCount,
        usersMastered: tag.usersMastered,
      },
    });
  } catch (error) {
    console.error('Get tag error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getTagProblems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tagId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const tag = await Tag.findById(tagId);
    if (!tag) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Tag not found',
        },
      });
      return;
    }

    const problemTags = await ProblemTag.find({ tagIds: tagId })
      .populate('problemId', 'title difficulty')
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await ProblemTag.countDocuments({ tagIds: tagId });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Tag problems fetched successfully',
      data: {
        tagName: tag.name,
        problems: problemTags.map((pt) => {
          const problem = pt.problemId as any;
          return {
            _id: problem._id?.toString(),
            title: problem.title,
            difficulty: problem.difficulty,
          };
        }),
        pagination: {
          total,
          limit: Number(limit),
          skip: Number(skip),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get tag problems error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getUserTagMastery = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const userTags = await UserTag.find({ userId }).populate('tagId', 'name category').sort({ masteryLevel: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User tag mastery fetched successfully',
      data: userTags.map((ut) => {
        const tag = ut.tagId as any;
        return {
          _id: ut._id.toString(),
          userId: ut.userId.toString(),
          tagId: tag._id?.toString(),
          tagName: tag.name,
          masteryLevel: ut.masteryLevel,
          problemsSolved: ut.problemsSolved,
          problemsTotal: ut.problemsTotal,
          averageAccuracy: ut.averageAccuracy,
          averageTime: ut.averageTime,
          lastPracticedAt: ut.lastPracticedAt,
          proficiencyLevel: ut.proficiencyLevel,
        };
      }),
    });
  } catch (error) {
    console.error('Get user tag mastery error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const updateUserTagProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { tagId, masteryLevel, problemsSolved, averageAccuracy } = req.body;

    if (!tagId || masteryLevel === undefined) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'tagId and masteryLevel are required',
        },
      });
      return;
    }

    // Check if tag exists
    const tag = await Tag.findById(tagId);
    if (!tag) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Tag not found',
        },
      });
      return;
    }

    let userTag = await UserTag.findOne({ userId, tagId });

    if (!userTag) {
      userTag = await UserTag.create({
        userId,
        tagId,
        masteryLevel,
        problemsSolved: problemsSolved || 0,
        averageAccuracy: averageAccuracy || 0,
        proficiencyLevel: getProficiencyLevel(masteryLevel),
      });

      // Increment tag users mastered count
      if (masteryLevel >= 80) {
        await Tag.findByIdAndUpdate(tagId, { $inc: { usersMastered: 1 } });
      }
    } else {
      const wasMastered = userTag.masteryLevel >= 80;
      userTag.masteryLevel = masteryLevel;
      if (problemsSolved !== undefined) userTag.problemsSolved = problemsSolved;
      if (averageAccuracy !== undefined) userTag.averageAccuracy = averageAccuracy;
      userTag.proficiencyLevel = getProficiencyLevel(masteryLevel);
      userTag.lastPracticedAt = new Date();

      const isMastered = masteryLevel >= 80;
      if (!wasMastered && isMastered) {
        await Tag.findByIdAndUpdate(tagId, { $inc: { usersMastered: 1 } });
      }

      await userTag.save();
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User tag progress updated successfully',
      data: {
        tagId: userTag.tagId.toString(),
        masteryLevel: userTag.masteryLevel,
        proficiencyLevel: userTag.proficiencyLevel,
        problemsSolved: userTag.problemsSolved,
      },
    });
  } catch (error) {
    console.error('Update user tag progress error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getTagStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tagId } = req.params;

    const tag = await Tag.findById(tagId);
    if (!tag) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Tag not found',
        },
      });
      return;
    }

    const userTags = await UserTag.find({ tagId });
    const totalUsers = userTags.length;
    const masteredUsers = userTags.filter((ut) => ut.masteryLevel >= 80).length;
    const averageMasteryScore = totalUsers > 0 ? userTags.reduce((sum, ut) => sum + ut.masteryLevel, 0) / totalUsers : 0;

    const stats: TagStatisticsResponse = {
      tagId: tag._id.toString(),
      tagName: tag.name,
      totalProblems: tag.problemCount,
      solvedProblems: 0,
      averageDifficulty: tag.difficulty || 'medium',
      totalUsers,
      masteredUsers,
      successRate: totalUsers > 0 ? (masteredUsers / totalUsers) * 100 : 0,
      averageMasteryScore: Number(averageMasteryScore.toFixed(2)),
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Tag statistics fetched successfully',
      data: stats,
    });
  } catch (error) {
    console.error('Get tag statistics error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const createLearningPath = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pathName, description, tagIds, recommendedOrder, estimatedHours, difficulty } = req.body;

    if (!pathName || !description || !tagIds || !recommendedOrder || !estimatedHours || !difficulty) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'All fields are required',
        },
      });
      return;
    }

    const path = await LearningPath.create({
      pathName,
      description,
      tagIds,
      recommendedOrder,
      estimatedHours,
      difficulty,
      completedBy: 0,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Learning path created successfully',
      data: {
        _id: path._id.toString(),
        pathName: path.pathName,
        estimatedHours: path.estimatedHours,
        difficulty: path.difficulty,
      },
    });
  } catch (error) {
    console.error('Create learning path error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getLearningPaths = async (req: Request, res: Response): Promise<void> => {
  try {
    const { difficulty, limit = 10, skip = 0 } = req.query;

    interface FilterQuery {
      difficulty?: string;
    }

    const filter: FilterQuery = {};
    if (difficulty) {
      filter.difficulty = difficulty as string;
    }

    const paths = await LearningPath.find(filter)
      .populate('tagIds', 'name')
      .sort({ completedBy: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await LearningPath.countDocuments(filter);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Learning paths fetched successfully',
      data: {
        paths: paths.map((p) => ({
          _id: p._id.toString(),
          pathName: p.pathName,
          description: p.description,
          estimatedHours: p.estimatedHours,
          difficulty: p.difficulty,
          completedBy: p.completedBy,
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
    console.error('Get learning paths error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getLearningPathDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pathId } = req.params;

    const path = await LearningPath.findById(pathId).populate('tagIds', 'name description category');

    if (!path) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Learning path not found',
        },
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Learning path fetched successfully',
      data: {
        _id: path._id.toString(),
        pathName: path.pathName,
        description: path.description,
        tags: path.tagIds,
        recommendedOrder: path.recommendedOrder,
        estimatedHours: path.estimatedHours,
        difficulty: path.difficulty,
        completedBy: path.completedBy,
      },
    });
  } catch (error) {
    console.error('Get learning path details error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getRecommendedTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    // Get user's mastered tags
    const masteredTags = await UserTag.find({ userId, masteryLevel: { $gte: 80 } }).select('tagId');
    const masteredTagIds = masteredTags.map((t) => t.tagId.toString());

    // Get next level tags (not mastered yet but started)
    const userTags = await UserTag.find({ userId, masteryLevel: { $lt: 80 } }).sort({ masteryLevel: -1 }).limit(5);

    // Get suggested tags (not started but related to mastered)
    const allTags = await Tag.find({ _id: { $nin: [masteredTagIds, ...userTags.map((t) => t.tagId)] } })
      .sort({ usersMastered: -1 })
      .limit(5);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Recommended tags fetched successfully',
      data: {
        inProgress: userTags.map((t) => ({
          tagId: t.tagId.toString(),
          masteryLevel: t.masteryLevel,
          proficiencyLevel: t.proficiencyLevel,
        })),
        recommended: allTags.map((t) => ({
          _id: t._id.toString(),
          name: t.name,
          category: t.category,
          problemCount: t.problemCount,
        })),
      },
    });
  } catch (error) {
    console.error('Get recommended tags error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const updateTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tagId } = req.params;
    const updateData: UpdateTagInput = req.body;

    const tag = await Tag.findByIdAndUpdate(tagId, updateData, { new: true, runValidators: true });

    if (!tag) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Tag not found',
        },
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Tag updated successfully',
      data: {
        _id: tag._id.toString(),
        name: tag.name,
        description: tag.description,
        category: tag.category,
        difficulty: tag.difficulty,
      },
    });
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const deleteTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tagId } = req.params;

    await Tag.findByIdAndDelete(tagId);
    await ProblemTag.updateMany({ tagIds: tagId }, { $pull: { tagIds: tagId } });
    await UserTag.deleteMany({ tagId });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Tag deleted successfully',
    });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};