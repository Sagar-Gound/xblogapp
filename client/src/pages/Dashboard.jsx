import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/users/me/posts');
      setPosts(res.data);
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await API.delete(`/api/posts/${postId}`);
        setPosts((prev) => prev.filter((p) => p._id !== postId));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete post');
      }
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>My Posts</h2>
        <button
          type="button"
          onClick={() => navigate('/create-post')}
          className="btn-create-post"
        >
          + Create Post
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">You have no posts yet.</div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <div key={post._id} className="post-card">
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="post-card-image"
                />
              )}
              <div className="post-card-content">
                <h3 className="post-card-title">{post.title}</h3>
                <div className="post-metrics-row">
                  <span>❤️ {post.likes?.length || 0}</span>
                  <span>|</span>
                  <span>
                    💬{' '}
                    {post.commentCount !== undefined
                      ? post.commentCount
                      : post.comments?.length || 0}
                  </span>
                </div>
                <div className="post-card-actions">
                  <button
                    type="button"
                    onClick={() => navigate(`/posts/${post._id}`)}
                    className="btn-card-action btn-card-view"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/edit-post/${post._id}`)}
                    className="btn-card-action btn-card-edit"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(post._id)}
                    className="btn-card-action btn-card-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
