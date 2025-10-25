import express from 'express';
import {
  getAllProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemStats,
  searchProblems,
  getProblemsByConcept,
} from '../controllers/problem.controller';
import { authMiddleware } from '../../auth/middleware/auth.middleware';
import { adminMiddleware } from '../../auth/middleware/admin.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllProblems);
router.get('/stats', getProblemStats);
router.get('/search', searchProblems);
router.get('/concept/:concept', getProblemsByConcept);
router.get('/:id', getProblemById);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, createProblem);
router.patch('/:id', authMiddleware, adminMiddleware, updateProblem);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProblem);

export default router;
