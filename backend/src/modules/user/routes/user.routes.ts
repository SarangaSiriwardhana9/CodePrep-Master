import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
} from '../controllers/user.controller';
import { authMiddleware } from '../../auth/middleware/auth.middleware';

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);
router.patch('/profile', authMiddleware, updateUserProfile);
router.delete('/account', authMiddleware, deleteUserAccount);

export default router;
