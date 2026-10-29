import express from 'express';
import { deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.delete('/:comment_id', protect, deleteComment);

export default router;
