import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, googleAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    }
  };

  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    try {
      const sampleEmail = email || `user_${Date.now()}@gmail.com`;
      const sampleName = sampleEmail.split('@')[0];
      await googleAuth(
        sampleName,
        sampleEmail,
        'https://picsum.photos/seed/picsum/200/300',
        'user'
      );
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" className="btn-purple full-width">
            Login
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="btn-red"
          >
            Login with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
