import express from 'express';
import {
  getAdminDashboard,
  getAllUsers,
  updateUserStatus,
  getAllProblems,
  updateProblemStatus,
  getModerationQueue,
  resolveModerationCase,
  getSystemConfig,
  updateSystemConfig,
  getAdminActionLogs,
} from '../controllers/admin.controller';
import { authMiddleware } from '../../auth/middleware/auth.middleware';

const router = express.Router();

// Admin middleware check
const adminCheck = async (req: express.Request, res: express.Response, next: Function) => {
  const user = await require('../../auth/models/User.model').User.findById(req.userId);
  if (user?.role !== 'admin' && user?.role !== 'moderator') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'AUTHORIZATION_ERROR',
        message: 'Admin access required',
      },
    });
  }
  next();
};

// All routes require auth
router.use(authMiddleware);
router.use(adminCheck);

// Dashboard
router.get('/dashboard', getAdminDashboard);

// User Management
router.get('/users', getAllUsers);
router.patch('/users/:userId/status', updateUserStatus);

// Problem Management
router.get('/problems', getAllProblems);
router.patch('/problems/:problemId/status', updateProblemStatus);

// Moderation
router.get('/moderation/queue', getModerationQueue);
router.patch('/moderation/:caseId/resolve', resolveModerationCase);

// System Configuration
router.get('/config', getSystemConfig);
router.patch('/config/update', updateSystemConfig);

// Action Logs
router.get('/logs/actions', getAdminActionLogs);

export default router;