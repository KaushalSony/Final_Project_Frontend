import React, { useEffect, useState } from 'react';
import '../styles/InstructorDashboard.css';
import { getInstructorCourses, getUserIdByEmail, deleteCourse, deleteFile } from '../services/api';
import { useNavigate } from 'react-router-dom';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [userId, setUserId] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get instructor's userId
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

  useEffect(() => {
    getInstructorCourses()
      .then(data => {
        setCourses(data);
      })
      .catch(err => setError(err.message));
  }, []);

  const handleCloseModal = () => setSelectedCourse(null);

  const handleEditCourse = (courseId) => {
    navigate(`/instructor/editcourse/${courseId}`);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      // Find the course to get its mediaUrl
      const course = courses.find(c => c.courseId === courseId);
      if (course && course.mediaUrl && course.mediaUrl.startsWith('http')) {
        const fileName = course.mediaUrl.split('/').pop().split('?')[0];
        if (fileName && fileName.trim() !== '') {
          await deleteFile(fileName);
        }
      }
      await deleteCourse(courseId);
      setCourses(prev => prev.filter(c => c.courseId !== courseId));
    } catch (err) {
      setError(err.message || 'Failed to delete course');
    }
  };

  if (loadingUser) {
    return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</div>;
  }

  // Only show courses created by this instructor
  const filteredCourses = courses.filter(course => String(course.instructorId) === String(userId));

  return (
    <div className="dashboard-container">
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {filteredCourses.map(course => (
        <div className="course-card" key={course.courseId}>
          <div className="course-title">{course.title}</div>
          <div className="course-desc">{course.description}</div>
          <div className="course-actions">
            <button className="view-btn" onClick={() => setSelectedCourse(course)}>View</button>
            <button className="view-btn" style={{ background: '#2563eb' }} onClick={() => handleEditCourse(course.courseId)}>Edit</button>
            <button className="view-btn" style={{ background: '#d32f2f' }} onClick={() => handleDeleteCourse(course.courseId)}>Delete</button>
          </div>
        </div>
      ))}
      <div
        className="course-card add-card"
        onClick={() => navigate('/instructor/addcourse')}
        style={{ cursor: 'pointer' }}
      >
        <span className="plus-btn">+</span>
      </div>

      {selectedCourse && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedCourse.title}</h2>
            <p>{selectedCourse.description}</p>
            <div className="modal-btn-row">
              <button
                className="modal-btn view-material"
                onClick={() => {
                  let url = selectedCourse.mediaUrl;
                  if (!url || url.trim() === '') {
                    alert('No course material available.');
                    return;
                  }
                  if (!/^https?:\/\//i.test(url)) {
                    url = 'https://' + url;
                  }
                  try {
                    new URL(url); // Validate URL
                    window.open(url, '_blank', 'noopener,noreferrer');
                  } catch {
                    alert('Invalid course material URL.');
                  }
                }}
              >
                View Course Material
              </button>
              <button
                className="modal-btn create-quiz"
                onClick={() => {
                  console.log("Navigating with state:", {
                    courseId: selectedCourse.courseId,
                    title: selectedCourse.title,
                    description: selectedCourse.description
                  });
                  navigate(`/instructor/assessment/${selectedCourse.courseId}`, {
                    state: {
                      title: selectedCourse.title,
                      description: selectedCourse.description
                    }
                  });
                }}
              >
                View Assessment
              </button>
              <button className="modal-btn back-btn" onClick={handleCloseModal}>Back to Courses</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard; 
