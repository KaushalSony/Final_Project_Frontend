import React, { useState, useEffect } from 'react';
import { createCourse, getUserIdByEmail } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AddCourse = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userId, setUserId] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get email from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const email = payload.email || payload.Email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
        if (email) {
          getUserIdByEmail(email)
            .then(setUserId)
            .catch(() => setError('Failed to get user ID'))
            .finally(() => setLoadingUser(false));
        } else {
          setError('Email not found in token');
          setLoadingUser(false);
        }
      } catch {
        setError('Invalid token');
        setLoadingUser(false);
      }
    } else {
      setError('No authentication token found');
      setLoadingUser(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await createCourse({ title, description, mediaUrl, instructorId: userId });
      setSuccess('Course created successfully!');
      setTitle('');
      setDescription('');
      setMediaUrl('');
      setTimeout(() => navigate('/instructor/dashboard'), 1200);
    } catch (err) {
      setError(err.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: 420, margin: '3rem auto', padding: '2rem', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 8 }}>Add New Course</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bbb' }}
            placeholder="Enter course title"
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={4}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bbb', resize: 'vertical' }}
            placeholder="Enter course description"
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Media URL <span style={{ color: '#888', fontWeight: 400 }}>(optional)</span></label>
          <input
            type="url"
            value={mediaUrl}
            onChange={e => setMediaUrl(e.target.value)}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bbb' }}
            placeholder="https://..."
          />
        </div>
        {error && <div style={{ color: '#d32f2f', marginBottom: 12, textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: '#388e3c', marginBottom: 12, textAlign: 'center' }}>{success}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px 0', borderRadius: 8, background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 17, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}
        >
          {loading ? 'Creating...' : 'Add Course'}
        </button>
      </form>
    </div>
  );
};

export default AddCourse; 