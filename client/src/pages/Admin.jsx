import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Admin = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/posts');
      setPosts(res.data);
    } catch (err) {
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAllPosts();
  }, [user]);

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await API.delete(`/api/posts/${postId}`);
        setPosts((prev) => prev.filter((p) => p._id !== postId));
      } catch (err) {
        alert('Failed to delete post');
      }
    }
  };

  if (loading) {
    return <div className="loading-state">Loading...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-panel-card">
        <h2 className="admin-panel-title">Admin Panel – All Posts</h2>
        {error && <div className="alert-error">{error}</div>}
        <div className="admin-posts-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Likes</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post._id}>
                  <td>{post.title}</td>
                  <td>{post.author?.name || 'Unknown'}</td>
                  <td>{post.likes?.length || 0}</td>
                  <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        type="submit"
                        onClick={() => navigate(`/posts/${post._id}`)}
                        className="btn-card-action btn-card-view"
                      >
                        View
                      </button>
                      <button
                        type="submit"
                        onClick={() => handleDelete(post._id)}
                        className="btn-card-action btn-card-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
