import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

export const createPost = async (req, res) => {
  try {
    const { title, content, tags, image } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    let parsedTags = [];
    if (Array.isArray(tags)) {
      parsedTags = tags.map((t) => t.trim()).filter(Boolean);
    } else if (typeof tags === 'string') {
      parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    const post = await Post.create({
      title,
      content,
      tags: parsedTags,
      image: image || 'https://picsum.photos/seed/picsum/200/300',
      author: req.user.id,
      likes: [],
      comments: []
    });

    return res.status(201).json({
      title: post.title,
      content: post.content,
      tags: post.tags,
      image: post.image,
      author: post.author.toString(),
      likes: post.likes,
      _id: post._id.toString(),
      comments: post.comments,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      __v: post.__v
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', '_id name email avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const postObj = post.toObject();
    const currentUserId = req.user?.id ? req.user.id.toString() : null;

    const likedByCurrentUser = currentUserId
      ? post.likes.some((id) => id.toString() === currentUserId)
      : false;

    return res.status(200).json({
      ...postObj,
      totalLikes: post.likes ? post.likes.length : 0,
      likedByCurrentUser
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (
      post.author.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    if (req.body.title !== undefined) post.title = req.body.title;
    if (req.body.content !== undefined) post.content = req.body.content;
    if (req.body.image !== undefined) post.image = req.body.image;
    if (req.body.tags !== undefined) {
      if (Array.isArray(req.body.tags)) {
        post.tags = req.body.tags.map((t) => t.trim()).filter(Boolean);
      } else if (typeof req.body.tags === 'string') {
        post.tags = req.body.tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    const updated = await post.save();

    return res.status(200).json({
      _id: updated._id.toString(),
      title: updated.title,
      content: updated.content,
      tags: updated.tags,
      image: updated.image,
      author: updated.author.toString(),
      likes: updated.likes,
      comments: updated.comments,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      __v: updated.__v
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const { search, tag, tags } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const tagFilter = tag || tags;
    if (tagFilter) {
      if (Array.isArray(tagFilter)) {
        filter.tags = { $in: tagFilter };
      } else {
        const tagList = tagFilter.split(',').map((t) => t.trim()).filter(Boolean);
        filter.tags = { $in: tagList };
      }
    }

    const posts = await Post.find(filter)
      .populate('author', '_id name email avatar')
      .sort({ createdAt: -1 });

    const currentUserId = req.user?.id ? req.user.id.toString() : null;

    const formattedPosts = posts.map((p) => {
      const obj = p.toObject();
      const likedByCurrentUser = currentUserId
        ? p.likes.some((id) => id.toString() === currentUserId)
        : false;
      return {
        ...obj,
        totalLikes: p.likes ? p.likes.length : 0,
        likedByCurrentUser
      };
    });

    return res.status(200).json(formattedPosts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (
      post.author.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Comment.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(post._id);

    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userIdStr = req.user.id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userIdStr);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userIdStr);
      await post.save();
      return res.status(200).json({
        message: 'Post unliked',
        totalLikes: post.likes.length
      });
    } else {
      post.likes.push(req.user.id);
      await post.save();
      return res.status(200).json({
        message: 'Post liked',
        totalLikes: post.likes.length
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
