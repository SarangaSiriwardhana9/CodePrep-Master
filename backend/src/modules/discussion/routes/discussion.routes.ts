import express from 'express';
import {
  createDiscussion,
  getDiscussions,
  getDiscussionById,
  updateDiscussion,
  deleteDiscussion,
  addComment,
  updateComment,
  deleteComment,
  likeDiscussionOrComment,
  reportDiscussion,
  getDiscussionStats,
} from '../controllers/discussion.controller';
import { authMiddleware } from '../../auth/middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', getDiscussions);
router.get('/:discussionId', getDiscussionById);
router.get('/stats/overview', getDiscussionStats);

// Authenticated user routes
router.post('/create', authMiddleware, createDiscussion);
router.patch('/:discussionId', authMiddleware, updateDiscussion);
router.delete('/:discussionId', authMiddleware, deleteDiscussion);

// Comments
router.post('/:discussionId/comments', authMiddleware, addComment);
router.patch('/comment/:commentId', authMiddleware, updateComment);
router.delete('/comment/:commentId', authMiddleware, deleteComment);

// Likes
router.post('/like', authMiddleware, likeDiscussionOrComment);

// Reports
router.post('/:discussionId/report', authMiddleware, reportDiscussion);

export default router;