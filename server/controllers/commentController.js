import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

export const addComment = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      text,
      post: post._id,
      author: req.user.id
    });

    post.comments.push(comment._id);
    await post.save();

    return res.status(201).json({
      text: comment.text,
      post: comment.post.toString(),
      author: comment.author.toString(),
      _id: comment._id.toString(),
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      __v: comment.__v
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCommentsByPost = async (req, res) => {
  try {
    const { post_id } = req.params;

    const comments = await Comment.find({ post: post_id })
      .populate('author', '_id name email avatar')
      .sort({ createdAt: -1 });

    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { comment_id } = req.params;

    const comment = await Comment.findById(comment_id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (
      comment.author.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id }
    });

    await Comment.findByIdAndDelete(comment._id);

    return res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
