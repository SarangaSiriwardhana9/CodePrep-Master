import { Request, Response } from 'express';
import { Discussion, Comment, Like, DiscussionReport } from '../models/discussion.model';
import { User } from '../../auth/models/User.model';
import { Problem } from '../../problem/models/Problem.model';
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../../../config/constants';
import {
  DiscussionInput,
  DiscussionResponse,
  CommentInput,
  UpdateDiscussionInput,
  UpdateCommentInput,
  DiscussionStatsResponse,
} from '../types/discussion.types';

export const createDiscussion = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { problemId, title, content, tags } = req.body as DiscussionInput;

    if (!problemId || !title || !content) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'problemId, title, and content are required',
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

    const discussion = await Discussion.create({
      problemId,
      authorId: userId,
      title,
      content,
      tags: tags || [],
    });

    const user = await User.findById(userId);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Discussion created successfully',
      data: {
        _id: discussion._id.toString(),
        problemId: discussion.problemId.toString(),
        authorId: discussion.authorId.toString(),
        authorName: user?.name,
        title: discussion.title,
        content: discussion.content,
        tags: discussion.tags,
        isPinned: discussion.isPinned,
        views: 0,
        likes: 0,
        commentCount: 0,
        createdAt: discussion.createdAt,
      },
    });
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getDiscussions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemId, tags, limit = 20, skip = 0, sortBy = 'latest' } = req.query;

    interface FilterQuery {
      problemId?: string;
      tags?: any;
    }

    const filter: FilterQuery = {};

    if (problemId) {
      filter.problemId = problemId as string;
    }

    if (tags) {
      filter.tags = { $in: (tags as string).split(',') };
    }

    let sortOption: any = { createdAt: -1 };
    if (sortBy === 'popular') {
      sortOption = { likes: -1 };
    } else if (sortBy === 'trending') {
      sortOption = { views: -1, likes: -1 };
    }

    const discussions = await Discussion.find(filter)
      .populate('authorId', 'name profilePicture')
      .sort(sortOption)
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Discussion.countDocuments(filter);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Discussions fetched successfully',
      data: {
        discussions: discussions.map((d) => ({
          _id: d._id.toString(),
          problemId: d.problemId.toString(),
          authorId: d.authorId._id?.toString(),
          authorName: (d.authorId as any).name,
          authorProfilePicture: (d.authorId as any).profilePicture,
          title: d.title,
          content: d.content,
          tags: d.tags,
          isPinned: d.isPinned,
          views: d.views,
          likes: d.likes,
          commentCount: d.commentCount,
          createdAt: d.createdAt,
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
    console.error('Get discussions error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getDiscussionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { discussionId } = req.params;

    const discussion = await Discussion.findByIdAndUpdate(
      discussionId,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('authorId', 'name profilePicture');

    if (!discussion) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Discussion not found',
        },
      });
      return;
    }

    const comments = await Comment.find({
      discussionId,
      parentCommentId: null,
    })
      .populate('authorId', 'name profilePicture')
      .sort({ createdAt: -1 });

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          parentCommentId: comment._id,
        }).populate('authorId', 'name profilePicture');

        return {
          _id: comment._id.toString(),
          discussionId: comment.discussionId.toString(),
          authorId: comment.authorId._id?.toString(),
          authorName: (comment.authorId as any).name,
          authorProfilePicture: (comment.authorId as any).profilePicture,
          content: comment.content,
          likes: comment.likes,
          replies: replies.map((r) => ({
            _id: r._id.toString(),
            content: r.content,
            authorName: (r.authorId as any).name,
            likes: r.likes,
          })),
          createdAt: comment.createdAt,
        };
      })
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Discussion fetched successfully',
      data: {
        discussion: {
          _id: discussion._id.toString(),
          problemId: discussion.problemId.toString(),
          authorId: discussion.authorId._id?.toString(),
          authorName: (discussion.authorId as any).name,
          title: discussion.title,
          content: discussion.content,
          tags: discussion.tags,
          isPinned: discussion.isPinned,
          views: discussion.views,
          likes: discussion.likes,
          commentCount: discussion.commentCount,
          createdAt: discussion.createdAt,
        },
        comments: commentsWithReplies,
        totalComments: discussion.commentCount,
      },
    });
  } catch (error) {
    console.error('Get discussion error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const updateDiscussion = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { discussionId } = req.params;
    const updateData: UpdateDiscussionInput = req.body;

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Discussion not found',
        },
      });
      return;
    }

    if (discussion.authorId.toString() !== userId) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Cannot update this discussion',
        },
      });
      return;
    }

    Object.assign(discussion, updateData);
    await discussion.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Discussion updated successfully',
      data: {
        _id: discussion._id.toString(),
        title: discussion.title,
        content: discussion.content,
        tags: discussion.tags,
        isPinned: discussion.isPinned,
      },
    });
  } catch (error) {
    console.error('Update discussion error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const deleteDiscussion = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { discussionId } = req.params;

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Discussion not found',
        },
      });
      return;
    }

    if (discussion.authorId.toString() !== userId) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Cannot delete this discussion',
        },
      });
      return;
    }

    await Discussion.findByIdAndDelete(discussionId);
    await Comment.deleteMany({ discussionId });
    await Like.deleteMany({ targetId: discussionId });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Discussion deleted successfully',
    });
  } catch (error) {
    console.error('Delete discussion error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { discussionId } = req.params;
    const { content, parentCommentId } = req.body as CommentInput;

    if (!content) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'content is required',
        },
      });
      return;
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Discussion not found',
        },
      });
      return;
    }

    const comment = await Comment.create({
      discussionId,
      authorId: userId,
      content,
      parentCommentId: parentCommentId || null,
    });

    // Update discussion comment count
    await Discussion.findByIdAndUpdate(discussionId, { $inc: { commentCount: 1 } });

    const user = await User.findById(userId);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        _id: comment._id.toString(),
        discussionId: comment.discussionId.toString(),
        authorId: comment.authorId.toString(),
        authorName: user?.name,
        content: comment.content,
        likes: 0,
        createdAt: comment.createdAt,
      },
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const updateComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { commentId } = req.params;
    const { content } = req.body as UpdateCommentInput;

    if (!content) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'content is required',
        },
      });
      return;
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Comment not found',
        },
      });
      return;
    }

    if (comment.authorId.toString() !== userId) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Cannot update this comment',
        },
      });
      return;
    }

    comment.content = content;
    await comment.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Comment updated successfully',
      data: {
        _id: comment._id.toString(),
        content: comment.content,
        updatedAt: comment.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Comment not found',
        },
      });
      return;
    }

    if (comment.authorId.toString() !== userId) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Cannot delete this comment',
        },
      });
      return;
    }

    await Comment.findByIdAndDelete(commentId);
    await Discussion.findByIdAndUpdate(comment.discussionId, { $inc: { commentCount: -1 } });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const likeDiscussionOrComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { targetId, likeType } = req.body;

    if (!targetId || !likeType) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'targetId and likeType are required',
        },
      });
      return;
    }

    // Check if already liked
    const existing = await Like.findOne({ userId, targetId, likeType });
    if (existing) {
      // Unlike
      await Like.findByIdAndDelete(existing._id);
      if (likeType === 'discussion') {
        await Discussion.findByIdAndUpdate(targetId, { $inc: { likes: -1 } });
      } else {
        await Comment.findByIdAndUpdate(targetId, { $inc: { likes: -1 } });
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Unlike successful',
        data: { liked: false },
      });
    } else {
      // Like
      await Like.create({ userId, targetId, likeType });
      if (likeType === 'discussion') {
        await Discussion.findByIdAndUpdate(targetId, { $inc: { likes: 1 } });
      } else {
        await Comment.findByIdAndUpdate(targetId, { $inc: { likes: 1 } });
      }

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Like successful',
        data: { liked: true },
      });
    }
  } catch (error) {
    console.error('Like error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const reportDiscussion = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { discussionId } = req.params;
    const { reason, description } = req.body;

    if (!reason) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'reason is required',
        },
      });
      return;
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Discussion not found',
        },
      });
      return;
    }

    const report = await DiscussionReport.create({
      discussionId,
      reportedBy: userId,
      reason,
      description,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Discussion reported successfully',
      data: {
        _id: report._id.toString(),
        reason: report.reason,
        isResolved: report.isResolved,
      },
    });
  } catch (error) {
    console.error('Report discussion error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};

export const getDiscussionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalDiscussions = await Discussion.countDocuments();
    const totalComments = await Comment.countDocuments();

    const recentDiscussions = await Discussion.find({})
      .populate('authorId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const trending = await Discussion.find({})
      .populate('authorId', 'name')
      .sort({ views: -1, likes: -1 })
      .limit(5);

    const mostLiked = await Discussion.find({})
      .populate('authorId', 'name')
      .sort({ likes: -1 })
      .limit(5);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Discussion statistics fetched successfully',
      data: {
        totalDiscussions,
        totalComments,
        recentDiscussions: recentDiscussions.map((d) => ({
          _id: d._id.toString(),
          title: d.title,
          likes: d.likes,
          views: d.views,
        })),
        trending: trending.map((d) => ({
          _id: d._id.toString(),
          title: d.title,
          views: d.views,
        })),
        mostLiked: mostLiked.map((d) => ({
          _id: d._id.toString(),
          title: d.title,
          likes: d.likes,
        })),
      },
    });
  } catch (error) {
    console.error('Get discussion stats error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
    });
  }
};