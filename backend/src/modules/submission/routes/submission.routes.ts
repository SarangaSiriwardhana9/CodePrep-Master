import express from 'express';
import {
  submitSolution,
  getSubmissionById,
  getUserSubmissions,
  getProblemSubmissions,
  getUserSubmissionStats,
  getProblemAcceptanceStats,
  updateSubmissionFeedback,
  deleteSubmission,
} from '../controllers/submission.controller';
import { authMiddleware } from '../../auth/middleware/auth.middleware';
import { adminMiddleware } from '../../auth/middleware/admin.middleware';

const router = express.Router();

// User submission routes
router.post('/submit', authMiddleware, submitSolution);
router.get('/user/:submissionId', authMiddleware, getSubmissionById);
router.get('/user/list', authMiddleware, getUserSubmissions);
router.get('/stats/user', authMiddleware, getUserSubmissionStats);
router.delete('/:submissionId', authMiddleware, deleteSubmission);

// Problem submission routes
router.get('/problem/:problemId/list', getProblemSubmissions);
router.get('/problem/:problemId/stats', getProblemAcceptanceStats);

// Admin routes
router.patch('/:submissionId/feedback', authMiddleware, adminMiddleware, updateSubmissionFeedback);

export default router;