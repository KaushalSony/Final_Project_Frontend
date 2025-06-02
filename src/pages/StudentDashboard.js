import React, { useEffect, useState } from 'react';
import '../styles/StudentDashboard.css';
import '../styles/InstructorDashboard.css';
import { getStudentCourses, getUserById } from '../services/api';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [instructorNames, setInstructorNames] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    getStudentCourses()
      .then(async (courses) => {
        setCourses(courses);
        // Fetch instructor names for all unique instructorIds
        const uniqueInstructorIds = [...new Set(courses.map(c => c.instructorId))];
        const namesMap = {};
        await Promise.all(uniqueInstructorIds.map(async (id) => {
          if (!id) return;
          try {
            const user = await getUserById(id);
            namesMap[id] = user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.name || user.email || 'Unknown Instructor';
          } catch {
            namesMap[id] = 'Unknown Instructor';
          }
        }));
        setInstructorNames(namesMap);
      })
      .catch(err => setError(err.message));
  }, []);

  const handleCloseModal = () => setSelectedCourse(null);

  return (
    <div className="student-dashboard-container">
      <h2 className="dashboard-title">Available Courses</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div className="student-courses-grid">
        {courses.map(course => (
          <div className="student-course-card" key={course.courseId} style={{ alignItems: 'center', textAlign: 'center' }}>
            <div className="student-course-title">{course.title}</div>
            <div className="student-course-desc">{course.description}</div>
            <div style={{ color: '#666', fontSize: '0.98rem', marginBottom: '1.1rem' }}>
              Instructor: {instructorNames[course.instructorId] || 'Loading...'}
            </div>
            <button
              className="student-view-btn"
              style={{ margin: '0 auto', display: 'block' }}
              onClick={() => setSelectedCourse(course)}
            >
              View
            </button>
          </div>
        ))}
      </div>
      {selectedCourse && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedCourse.title}</h2>
            <p>{selectedCourse.description}</p>
            <div style={{ color: '#666', fontSize: '0.98rem', marginBottom: '1.1rem' }}>
              Instructor: {instructorNames[selectedCourse.instructorId] || 'Loading...'}
            </div>
            <div className="modal-btn-row">
              <button
                className="modal-btn view-material"
                onClick={() => {
                  let url = selectedCourse.mediaUrl;
                  if (!/^https?:\/\//i.test(url)) {
                    url = 'https://' + url;
                  }
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
              >
                View Course Material
              </button>
              <button
                className="modal-btn create-quiz"
                onClick={() => {
                  // Navigate to student assessment page for this course
                  window.location.href = `/student/assessment/${selectedCourse.courseId}`;
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

export default StudentDashboard; 