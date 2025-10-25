import express from 'express';
import {
  createTag,
  getTags,
  getTagById,
  getTagProblems,
  getUserTagMastery,
  updateUserTagProgress,
  getTagStatistics,
  createLearningPath,
  getLearningPaths,
  getLearningPathDetails,
  getRecommendedTags,
  updateTag,
  deleteTag,
} from '../controllers/tag.controller';
import { authMiddleware } from '../../auth/middleware/auth.middleware';
import { adminMiddleware } from '../../auth/middleware/admin.middleware';

const router = express.Router();

// Public routes
router.get('/', getTags);
router.get('/:tagId', getTagById);
router.get('/:tagId/problems', getTagProblems);
router.get('/:tagId/statistics', getTagStatistics);

// Learning paths (public)
router.get('/paths/list', getLearningPaths);
router.get('/paths/:pathId', getLearningPathDetails);

// Authenticated user routes
router.get('/user/mastery', authMiddleware, getUserTagMastery);
router.patch('/user/progress', authMiddleware, updateUserTagProgress);
router.get('/user/recommended', authMiddleware, getRecommendedTags);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, createTag);
router.patch('/:tagId', authMiddleware, adminMiddleware, updateTag);
router.delete('/:tagId', authMiddleware, adminMiddleware, deleteTag);
router.post('/paths/create', authMiddleware, adminMiddleware, createLearningPath);

export default router;