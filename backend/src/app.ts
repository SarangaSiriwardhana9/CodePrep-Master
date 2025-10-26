import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './modules/auth/routes/auth.routes';
import userRoutes from './modules/user/routes/user.routes';
import problemRoutes from './modules/problem/routes/problem.routes';
import submissionRoutes from './modules/submission/routes/submission.routes';
import contestRoutes from './modules/contests/routes/contest.routes';
import adminRoutes from './modules/admin/routes/admin.routes';
import discussionRoutes from './modules/discussion/routes/discussion.routes';
import analyticsRoutes from './modules/analytics/routes/analytics.routes';
import bookmarkRoutes from './modules/bookmark/routes/bookmark.routes';
import leaderboardRoutes from './modules/leaderboard/routes/leaderboard.routes';
import tagRoutes from './modules/tag/routes/tag.routes';
import userStatsRoutes from './modules/userStats/routes/userStats.routes';

dotenv.config();

const app: Express = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/user-stats', userStatsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

export default app;