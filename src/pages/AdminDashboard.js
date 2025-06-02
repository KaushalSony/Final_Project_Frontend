import React from 'react';
import '../styles/AdminDashboard.css';
import { useNavigate } from 'react-router-dom';

const cardData = [
  {
    title: 'Instructors',
    description: 'Manage all instructors',
    color: '#1976d2',
  },
  {
    title: 'Students',
    description: 'Manage all students',
    color: '#1976d2',
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleView = (type) => {
    if (type === 'Instructors') {
      navigate('/admin/instructors');
    } else if (type === 'Students') {
      navigate('/admin/students');
    } else {
      alert(`View ${type}`);
    }
  };

  return (
    <div className="admin-dashboard-container">
      {cardData.map((card) => (
        <div className="admin-card" key={card.title}>
          <div className="admin-card-title">{card.title}</div>
          <div className="admin-card-desc">{card.description}</div>
          <div className="admin-card-actions">
            <button className="view-btn" onClick={() => handleView(card.title)}>View</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard; 