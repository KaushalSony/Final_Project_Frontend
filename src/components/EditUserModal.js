import React, { useState, useEffect } from 'react';

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalBoxStyle = {
  background: '#fff',
  borderRadius: '10px',
  padding: '2rem 2.5rem',
  minWidth: '320px',
  boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
  position: 'relative',
};

const closeButtonStyle = {
  position: 'absolute',
  top: '0.7rem',
  right: '1.2rem',
  fontSize: '1.5rem',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#888',
};

const EditUserModal = ({ open, onClose, user, onSave, mode = 'edit' }) => {
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && mode === 'edit') {
      setForm({ name: user.name || '', email: user.email || '' });
      setError('');
    } else if (mode === 'add') {
      setForm({ name: '', email: '' });
      setError('');
    }
  }, [user, mode]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSave({ ...form });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalBoxStyle}>
        <button style={closeButtonStyle} onClick={onClose} disabled={loading}>&times;</button>
        <h2>{mode === 'add' ? 'Add User' : 'Edit User'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.4rem', marginTop: '0.2rem' }}
              disabled={loading}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.4rem', marginTop: '0.2rem' }}
              disabled={loading}
            />
          </div>
          {error && <div style={{ color: 'red', marginBottom: '0.7rem' }}>{error}</div>}
          <button type="submit" className="edit-btn" style={{ minWidth: 90 }} disabled={loading}>
            {loading ? (mode === 'add' ? 'Adding...' : 'Save') : (mode === 'add' ? 'Add' : 'Save')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal; 