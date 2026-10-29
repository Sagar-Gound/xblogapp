import User from '../models/User.js';
import Post from '../models/Post.js';

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const postCount = await Post.countDocuments({ author: user._id });

    return res.status(200).json({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      postCount
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (user_id === 'me') {
      return getMe(req, res);
    }
    const user = await User.findById(user_id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const postCount = await Post.countDocuments({ author: user._id });

    return res.status(200).json({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      postCount
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;

    const updatedUser = await user.save();

    return res.status(200).json({
      _id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id }).sort({ createdAt: -1 });

    const formattedPosts = posts.map((post) => {
      const p = post.toObject();
      return {
        ...p,
        author: p.author.toString(),
        commentCount: p.comments ? p.comments.length : 0
      };
    });

    return res.status(200).json(formattedPosts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
