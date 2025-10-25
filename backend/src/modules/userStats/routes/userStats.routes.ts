import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserStats,
  getUserDashboard,
  getConceptMastery,
  getAchievements,
  getActivityCalendar,
  compareUsers,
  updateConceptMastery,
  unlockAchievement,
  getLeaderboard,
} from '../controllers/userStats.controller';
import { authMiddleware } from '../../auth/middleware/auth.middleware';
import { adminMiddleware } from '../../auth/middleware/admin.middleware';

const router = express.Router();

// Public routes
router.get('/profile/:userId', getUserProfile);
router.get('/stats/:userId', getUserStats);
router.get('/leaderboard', getLeaderboard);

// Authenticated user routes
router.patch('/profile', authMiddleware, updateUserProfile);
router.get('/dashboard', authMiddleware, getUserDashboard);
router.get('/concepts', authMiddleware, getConceptMastery);
router.get('/achievements', authMiddleware, getAchievements);
router.get('/calendar', authMiddleware, getActivityCalendar);
router.get('/compare/:comparedWithUserId', authMiddleware, compareUsers);

// Admin/Internal routes
router.patch('/concepts/update', authMiddleware, updateConceptMastery);
router.post('/achievements/unlock', authMiddleware, unlockAchievement);

export default router;