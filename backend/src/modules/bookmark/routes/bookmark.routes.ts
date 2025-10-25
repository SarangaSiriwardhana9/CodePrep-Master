import express from 'express';
import {
  createBookmark,
  getBookmarks,
  updateBookmark,
  deleteBookmark,
  createFolder,
  getFolders,
  getFolder,
  updateFolder,
  deleteFolder,
  getBookmarkStats,
  shareFolder,
  getSharedFolders,
} from '../controllers/bookmark.controller';
import { authMiddleware } from '../../auth/middleware/auth.middleware';

const router = express.Router();

// Authenticated user routes
router.post('/add', authMiddleware, createBookmark);
router.get('/list', authMiddleware, getBookmarks);
router.patch('/:bookmarkId', authMiddleware, updateBookmark);
router.delete('/:bookmarkId', authMiddleware, deleteBookmark);

// Folder routes
router.post('/folders/create', authMiddleware, createFolder);
router.get('/folders/list', authMiddleware, getFolders);
router.get('/folders/:folderId', authMiddleware, getFolder);
router.patch('/folders/:folderId', authMiddleware, updateFolder);
router.delete('/folders/:folderId', authMiddleware, deleteFolder);

// Stats and sharing
router.get('/stats/summary', authMiddleware, getBookmarkStats);
router.post('/share/folder', authMiddleware, shareFolder);
router.get('/shared/with-me', authMiddleware, getSharedFolders);

export default router;