import express from 'express';
import {
  createPost,
  getPostById,
  updatePost,
  getAllPosts,
  deletePost,
  likePost
} from '../controllers/postController.js';
import {
  addComment,
  getCommentsByPost
} from '../controllers/commentController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getAllPosts);
router.post('/', protect, createPost);

router.get('/:id', optionalAuth, getPostById);
router.put('/:id', protect, updatePost);
router.post('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

router.post('/:id/like', protect, likePost);

router.post('/:post_id/comments', protect, addComment);
router.get('/:post_id/comments', getCommentsByPost);

export default router;
