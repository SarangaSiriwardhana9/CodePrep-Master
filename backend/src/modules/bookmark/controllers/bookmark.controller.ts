import { Request, Response } from 'express';
import { Bookmark, BookmarkFolder, SharedFolder } from '../models/bookmark.model';
import { Problem } from '../../problem/models/Problem.model';
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../../../config/constants';
import {
  BookmarkInput,
  BookmarkResponse,
  BookmarkFolderInput,
  BookmarkFolderResponse,
  BookmarkStatsResponse,
  UpdateBookmarkInput,
  UpdateFolderInput,
  SharedFolderResponse,
} from '../types/bookmark.types';

export const createBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { problemId, folderId, notes, tags } = req.body as BookmarkInput;

    if (!problemId) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'problemId is required',
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
          message: 'Problem not found',
        },
      });
      return;
    }

    // Check if already bookmarked
    const existing = await Bookmark.findOne({ userId, problemId });
    if (existing) {
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: {
          code: 'DUPLICATE_RESOURCE',
          message: 'Problem already bookmarked',
        },
      });
      return;
    }

    // Validate folder if provided
    if (folderId) {
      const folder = await BookmarkFolder.findOne({ _id: folderId, userId });
      if (!folder) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Folder not found',
          },
        });
        return;
      }

      // Increment folder problem count
      await BookmarkFolder.findByIdAndUpdate(folderId, { $inc: { problemCount: 1 } });
    }

    const bookmark = await Bookmark.create({
      userId,
      problemId,
      folderId: folderId || null,
      notes,
      tags: tags || [],
      savedAt: new Date(),
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Bookmark created successfully',
      data: {
        _id: bookmark._id.toString(),
        userId: bookmark.userId.toString(),
        problemId: bookmark.problemId.toString(),
        problemTitle: problem.title,
        problemDifficulty: problem.difficulty,
        folderId: folderId,
        notes,
        tags,
        savedAt: bookmark.savedAt,
      },
    });
  } catch (error) {
    console.error('Create bookmark error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getBookmarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { folderId, tags, difficulty, limit = 20, skip = 0 } = req.query;

    interface FilterQuery {
      userId: string;
      folderId?: any;
      tags?: any;
    }

    const filter: FilterQuery = { userId: userId! };

    if (folderId) {
      filter.folderId = folderId;
    }

    if (tags) {
      filter.tags = { $in: (tags as string).split(',') };
    }

    const bookmarks = await Bookmark.find(filter)
      .populate('problemId', 'title difficulty')
      .sort({ savedAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    let filtered = bookmarks;
    if (difficulty) {
      filtered = bookmarks.filter((b) => (b.problemId as any).difficulty === difficulty);
    }

    const total = await Bookmark.countDocuments(filter);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Bookmarks fetched successfully',
      data: {
        bookmarks: filtered.map((b) => ({
          _id: b._id.toString(),
          userId: b.userId.toString(),
          problemId: b.problemId._id?.toString(),
          problemTitle: (b.problemId as any).title,
          problemDifficulty: (b.problemId as any).difficulty,
          folderId: b.folderId?.toString(),
          notes: b.notes,
          tags: b.tags,
          savedAt: b.savedAt,
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
    console.error('Get bookmarks error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const updateBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { bookmarkId } = req.params;
    const updateData: UpdateBookmarkInput = req.body;

    const bookmark = await Bookmark.findOne({ _id: bookmarkId, userId });
    if (!bookmark) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Bookmark not found',
        },
      });
      return;
    }

    // Handle folder change
    if (updateData.folderId !== undefined && updateData.folderId !== bookmark.folderId?.toString()) {
      if (bookmark.folderId) {
        await BookmarkFolder.findByIdAndUpdate(bookmark.folderId, { $inc: { problemCount: -1 } });
      }
      if (updateData.folderId) {
        await BookmarkFolder.findByIdAndUpdate(updateData.folderId, { $inc: { problemCount: 1 } });
      }
    }

    Object.assign(bookmark, updateData);
    await bookmark.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Bookmark updated successfully',
      data: {
        _id: bookmark._id.toString(),
        notes: bookmark.notes,
        tags: bookmark.tags,
        folderId: bookmark.folderId?.toString(),
      },
    });
  } catch (error) {
    console.error('Update bookmark error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const deleteBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { bookmarkId } = req.params;

    const bookmark = await Bookmark.findOne({ _id: bookmarkId, userId });
    if (!bookmark) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Bookmark not found',
        },
      });
      return;
    }

    // Decrement folder count
    if (bookmark.folderId) {
      await BookmarkFolder.findByIdAndUpdate(bookmark.folderId, { $inc: { problemCount: -1 } });
    }

    await Bookmark.findByIdAndDelete(bookmarkId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Bookmark deleted successfully',
    });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const createFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { folderName, description, color = '#3B82F6', isPublic = false } = req.body as BookmarkFolderInput;

    if (!folderName) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'folderName is required',
        },
      });
      return;
    }

    // Check if folder already exists
    const existing = await BookmarkFolder.findOne({ userId, folderName });
    if (existing) {
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: {
          code: 'DUPLICATE_RESOURCE',
          message: 'Folder with this name already exists',
        },
      });
      return;
    }

    const folder = await BookmarkFolder.create({
      userId,
      folderName,
      description,
      color,
      isPublic,
      problemCount: 0,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Folder created successfully',
      data: {
        _id: folder._id.toString(),
        userId: folder.userId.toString(),
        folderName: folder.folderName,
        description: folder.description,
        color: folder.color,
        isPublic: folder.isPublic,
        problemCount: 0,
      },
    });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getFolders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const folders = await BookmarkFolder.find({ userId }).sort({ createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Folders fetched successfully',
      data: folders.map((f) => ({
        _id: f._id.toString(),
        userId: f.userId.toString(),
        folderName: f.folderName,
        description: f.description,
        color: f.color,
        isPublic: f.isPublic,
        problemCount: f.problemCount,
        createdAt: f.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { folderId } = req.params;

    const folder = await BookmarkFolder.findOne({ _id: folderId, userId });
    if (!folder) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Folder not found',
        },
      });
      return;
    }

    const bookmarks = await Bookmark.find({ folderId })
      .populate('problemId', 'title difficulty')
      .sort({ savedAt: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Folder fetched successfully',
      data: {
        _id: folder._id.toString(),
        folderName: folder.folderName,
        description: folder.description,
        color: folder.color,
        problemCount: folder.problemCount,
        problems: bookmarks.map((b) => ({
          _id: b._id.toString(),
          problemId: b.problemId._id?.toString(),
          problemTitle: (b.problemId as any).title,
          problemDifficulty: (b.problemId as any).difficulty,
          notes: b.notes,
          tags: b.tags,
          savedAt: b.savedAt,
        })),
      },
    });
  } catch (error) {
    console.error('Get folder error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const updateFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { folderId } = req.params;
    const updateData: UpdateFolderInput = req.body;

    const folder = await BookmarkFolder.findOne({ _id: folderId, userId });
    if (!folder) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Folder not found',
        },
      });
      return;
    }

    Object.assign(folder, updateData);
    await folder.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Folder updated successfully',
      data: {
        _id: folder._id.toString(),
        folderName: folder.folderName,
        color: folder.color,
        isPublic: folder.isPublic,
      },
    });
  } catch (error) {
    console.error('Update folder error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const deleteFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { folderId } = req.params;

    const folder = await BookmarkFolder.findOne({ _id: folderId, userId });
    if (!folder) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Folder not found',
        },
      });
      return;
    }

    // Delete all bookmarks in folder
    await Bookmark.deleteMany({ folderId });
    await BookmarkFolder.findByIdAndDelete(folderId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Folder deleted successfully',
    });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getBookmarkStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const totalBookmarks = await Bookmark.countDocuments({ userId });
    const totalFolders = await BookmarkFolder.countDocuments({ userId });
    const recentBookmarks = await Bookmark.find({ userId })
      .populate('problemId', 'title difficulty')
      .sort({ savedAt: -1 })
      .limit(5);

    const allBookmarks = await Bookmark.find({ userId });
    const tags = allBookmarks
      .flatMap((b) => b.tags || [])
      .reduce((acc: { [key: string]: number }, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});

    const sortedTags = Object.entries(tags)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);

    const problems = await Problem.find({
      _id: { $in: allBookmarks.map((b) => b.problemId) },
    });

    const bookmarksByDifficulty = {
      easy: problems.filter((p) => p.difficulty === 'Easy').length,
      medium: problems.filter((p) => p.difficulty === 'Medium').length,
      hard: problems.filter((p) => p.difficulty === 'Hard').length,
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Bookmark statistics fetched successfully',
      data: {
        totalBookmarks,
        totalFolders,
        recentBookmarks: recentBookmarks.map((b) => ({
          _id: b._id.toString(),
          problemId: b.problemId._id?.toString(),
          problemTitle: (b.problemId as any).title,
          problemDifficulty: (b.problemId as any).difficulty,
          savedAt: b.savedAt,
        })),
        popularTags: sortedTags,
        bookmarksByDifficulty,
      },
    });
  } catch (error) {
    console.error('Get bookmark stats error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const shareFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { folderId, sharedWithUserId } = req.body;

    if (!folderId || !sharedWithUserId) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'folderId and sharedWithUserId are required',
        },
      });
      return;
    }

    const folder = await BookmarkFolder.findOne({ _id: folderId, userId });
    if (!folder || !folder.isPublic) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Cannot share this folder',
        },
      });
      return;
    }

    const existing = await SharedFolder.findOne({ folderId, sharedWith: sharedWithUserId });
    if (existing) {
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: {
          code: 'DUPLICATE_RESOURCE',
          message: 'Already shared with this user',
        },
      });
      return;
    }

    const share = await SharedFolder.create({
      folderId,
      sharedBy: userId,
      sharedWith: sharedWithUserId,
      sharedAt: new Date(),
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Folder shared successfully',
      data: {
        _id: share._id.toString(),
        folderId: share.folderId.toString(),
        sharedAt: share.sharedAt,
      },
    });
  } catch (error) {
    console.error('Share folder error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getSharedFolders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const sharedFolders = await SharedFolder.find({ sharedWith: userId })
      .populate('folderId', 'folderName description color problemCount')
      .populate('sharedBy', 'name')
      .sort({ sharedAt: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Shared folders fetched successfully',
      data: sharedFolders.map((sf) => ({
        _id: (sf.folderId as any)._id?.toString(),
        folderName: (sf.folderId as any).folderName,
        description: (sf.folderId as any).description,
        sharedBy: (sf.sharedBy as any).name,
        sharedByName: (sf.sharedBy as any).name,
        color: (sf.folderId as any).color,
        problemCount: (sf.folderId as any).problemCount,
        sharedAt: sf.sharedAt,
      })),
    });
  } catch (error) {
    console.error('Get shared folders error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};