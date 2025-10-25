import express from 'express';
import {
  createContest,
  getContests,
  getContestById,
  registerForContest,
  submitDuringContest,
  getContestLeaderboard,
  getUserContestStats,
  updateContest,
  deleteContest,
  getContestResults,
} from '../controllers/contest.controller';
import { authMiddleware } from '../../auth/middleware/auth.middleware';
import { adminMiddleware } from '../../auth/middleware/admin.middleware';

const router = express.Router();

// Public routes
router.get('/', getContests);
router.get('/:contestId', getContestById);
router.get('/:contestId/leaderboard', getContestLeaderboard);

// Authenticated user routes
router.post('/:contestId/register', authMiddleware, registerForContest);
router.post('/:contestId/submit', authMiddleware, submitDuringContest);
router.get('/:contestId/results', authMiddleware, getContestResults);
router.get('/stats/user', authMiddleware, getUserContestStats);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, createContest);
router.patch('/:contestId', authMiddleware, adminMiddleware, updateContest);
router.delete('/:contestId', authMiddleware, adminMiddleware, deleteContest);

export default router;