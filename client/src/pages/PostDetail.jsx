import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchPostAndComments = async () => {
    try {
      setLoading(true);
      const postRes = await API.get(`/api/posts/${id}`);
      setPost(postRes.data);

      const commentRes = await API.get(`/api/posts/${id}/comments`);
      setComments(commentRes.data);
    } catch (err) {
      setError('Failed to load post details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostAndComments();
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await API.post(`/api/posts/${id}/like`);
      setPost((prev) => ({
        ...prev,
        totalLikes: res.data.totalLikes,
        likedByCurrentUser: res.data.message === 'Post liked'
      }));
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await API.post(`/api/posts/${id}/comments`, {
        text: commentText.trim()
      });
      const commentRes = await API.get(`/api/posts/${id}/comments`);
      setComments(commentRes.data);
      setCommentText('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await API.delete(`/api/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading post details...</div>;
  }

  if (error || !post) {
    return <div className="alert-error">{error || 'Post not found'}</div>;
  }

  const currentUserId = user?._id || user?.id;
  const isLiked = Boolean(post.likedByCurrentUser);
  const likeCount = post.totalLikes !== undefined ? post.totalLikes : (post.likes?.length || 0);

  return (
    <div className="post-detail-container">
      <article className="post-detail-card">
        <h1 className="post-detail-title">{post.title}</h1>

        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="post-detail-image"
          />
        )}

        <div className="post-detail-content">
          <p>{post.content}</p>
        </div>

        <div className="post-tags">
          {post.tags?.map((tag, idx) => (
            <span key={idx} className="tag-badge">
              #{tag}
            </span>
          ))}
        </div>

        <button
          type="submit"
          onClick={handleLike}
          className={`btn-like-full ${isLiked ? 'btn-like-solid' : 'btn-like-outline'}`}
        >
          {isLiked ? `Unlike (${likeCount})` : `Like (${likeCount})`}
        </button>

        <section className="comments-section">
          <h3>Comments ({comments.length})</h3>

          <div className="comments-list">
            {comments.map((comment) => {
              const commentAuthorId = comment.author?._id || comment.author;
              const canDelete =
                currentUserId &&
                (commentAuthorId === currentUserId || user?.role === 'admin');

              return (
                <div key={comment._id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">
                      {comment.author?.name || 'User'}
                    </span>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                  {canDelete && (
                    <button
                      type="submit"
                      onClick={() => handleDeleteComment(comment._id)}
                      className="btn-delete-comment"
                    >
                      Delete
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleAddComment} className="comment-form-row">
            <input
              type="text"
              name="content"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="comment-input"
              required
            />
            <button type="submit" className="btn-add-comment">
              Add Comment
            </button>
          </form>
        </section>
      </article>
    </div>
  );
};

export default PostDetail;
