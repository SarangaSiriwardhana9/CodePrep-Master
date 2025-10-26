import express from 'express';
import {
  getUserAnalytics,
  getPlatformAnalytics,
  getProblemAnalytics,
  getConceptAnalytics,
  generateReport,
  getReports,
  getPerformanceMetrics,
  getUserEngagementAnalytics,
} from '../controllers/analytics.controller';
import { authMiddleware } from '../../auth/middleware/auth.middleware';

const router = express.Router();

// Public analytics
router.get('/platform', getPlatformAnalytics);
router.get('/problem/:problemId', getProblemAnalytics);
router.get('/concept/:concept', getConceptAnalytics);
router.get('/performance', getPerformanceMetrics);

// Authenticated user analytics
router.get('/user/:userId', authMiddleware, getUserAnalytics);
router.get('/user/:userId/engagement', authMiddleware, getUserEngagementAnalytics);

// Reports
router.post('/reports/generate', authMiddleware, generateReport);
router.get('/reports/list', authMiddleware, getReports);

export default router;