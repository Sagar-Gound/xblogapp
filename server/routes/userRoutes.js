import express from 'express';
import {
  getUserById,
  getMe,
  updateMe,
  getMyPosts
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.get('/me/posts', protect, getMyPosts);
router.get('/:user_id', getUserById);

export default router;
