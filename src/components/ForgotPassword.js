import React, { useState } from 'react';
import { forgotPassword } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import '../styles/ForgotPassword.css';

function ForgotPasswordModal({ onClose, email = '' }) {
  const [formData, setFormData] = useState({ email });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      setStatus({
        type: 'error',
        message: 'Please enter your email address'
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const result = await forgotPassword(formData.email);
      setStatus({
        type: 'success',
        message: result.message || 'Password reset instructions have been sent to your email.'
      });
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      setStatus({
        type: 'error',
        message: err.message || 'Failed to process your request. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ email: e.target.value });
    if (status.type === 'error') {
      setStatus({ type: '', message: '' });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose} disabled={isLoading}>
          ×
        </button>
        
        <h2>Forgot Password</h2>
        <p className="modal-subtitle">
          Enter your email address and we'll send you instructions to reset your password.
        </p>

        {status.message && (
          <div className={`status-message ${status.type}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={isLoading || status.type === 'success'}
            />
          </div>

          <button 
            type="submit" 
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || status.type === 'success'}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                <span>Sending...</span>
              </>
            ) : (
              'Send Reset Instructions'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordModal; 