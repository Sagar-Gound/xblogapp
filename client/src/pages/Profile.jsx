import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(() => user);
  const [name, setName] = useState(() => user?.name || '');
  const [avatar, setAvatar] = useState(() => user?.avatar || '');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/api/users/me');
        setProfileData(res.data);
        setName(res.data.name || '');
        setAvatar(res.data.avatar || '');
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put('/api/users/me', { name, avatar });
      updateUser(res.data);
      setProfileData((prev) => ({ ...prev, ...res.data }));
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage('Failed to update profile.');
    }
  };

  const currentEmail = profileData?.email || user?.email || '';
  const currentName = profileData?.name || user?.name || '';
  const currentAvatar =
    profileData?.avatar || user?.avatar || 'https://picsum.photos/seed/picsum/200/300';
  const postCount = profileData?.postCount !== undefined ? profileData.postCount : 0;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-top">
          <img
            src={currentAvatar}
            alt={currentName}
            className="profile-avatar-img"
          />
          <h2 className="profile-user-name">{currentName}</h2>
          <p className="profile-user-email">{currentEmail}</p>
          <p className="profile-total-posts">Total Posts: {postCount}</p>
        </div>

        {message && <div className="alert-success">{message}</div>}

        <form onSubmit={handleUpdate} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="avatar">Avatar URL</label>
            <input
              type="url"
              id="avatar"
              name="avatar"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </div>

          <div className="profile-actions">
            <button type="submit" className="btn-update-profile">
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
