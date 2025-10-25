import express from 'express';
import {
  getGlobalLeaderboard,
  getUserRank,
  getConceptLeaderboard,
  getContestLeaderboard,
  getTimePeriodLeaderboard,
  getFriendLeaderboard,
  getUserRankHistory,
  getLeaderboardStatistics,
  recordUserRankSnapshot,
} from '../controllers/leaderboard.controller';
import { authMiddleware } from '../../auth/middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', getGlobalLeaderboard);
router.get('/user/:userId', getUserRank);
router.get('/concept/:concept', getConceptLeaderboard);
router.get('/contest/:contestId', getContestLeaderboard);
router.get('/period', getTimePeriodLeaderboard);
router.get('/statistics', getLeaderboardStatistics);

// Authenticated user routes
router.get('/friend/nearby', authMiddleware, getFriendLeaderboard);
router.get('/history/:userId', authMiddleware, getUserRankHistory);
router.post('/snapshot/record', authMiddleware, recordUserRankSnapshot);

export default router;