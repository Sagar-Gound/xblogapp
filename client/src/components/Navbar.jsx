import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Blog App
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-item">
            Home
          </Link>
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-item">
                  Admin
                </Link>
              )}
              <Link to="/profile" className="nav-item">
                Profile
              </Link>
              <Link to="/dashboard" className="nav-item">
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item">
                Login
              </Link>
              <Link to="/signup" className="nav-item">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
