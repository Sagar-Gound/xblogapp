import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (tags.trim()) params.tags = tags.trim();

      const res = await API.get('/api/posts', { params });
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPosts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, tags]);

  return (
    <div className="home-container">
      <section className="explore-section">
        <h2>Explore Posts</h2>
        <div className="filter-controls">
          <input
            type="text"
            name="search"
            placeholder="Search by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <input
            type="text"
            name="tags"
            placeholder="Filter by tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="filter-input"
          />
        </div>

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="empty-state">No posts found.</div>
        ) : (
          <div className="home-posts-grid">
            {posts.map((post) => (
              <article key={post._id} className="home-post-card">
                <div className="home-card-header">
                  <span className="home-card-author">
                    {post.author?.name || 'Unknown'}
                  </span>
                  <span className="home-card-date">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="home-card-image"
                  />
                )}

                <div className="home-card-body">
                  <h3 className="home-card-title">{post.title}</h3>
                  <p className="home-card-snippet">
                    {post.content
                      ? post.content.length > 50
                        ? `${post.content.substring(0, 50)}...`
                        : post.content
                      : ''}
                  </p>

                  <div className="home-card-footer">
                    <button
                      type="submit"
                      onClick={() => navigate(`/posts/${post._id}`)}
                      className="btn-read-more"
                    >
                      Read More
                    </button>
                    <div className="home-card-metrics">
                      <span>❤️ {post.likes?.length || 0}</span>
                      <span>
                        💬{' '}
                        {post.commentCount !== undefined
                          ? post.commentCount
                          : post.comments?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
