import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import '../styles/Assessment.css';
import { getInstructorAssessments, getAssessmentById, deleteAssessment, getInstructorCourses, getUserIdByEmail } from '../services/api';

const Assessment = () => {
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [userId, setUserId] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Get courseId from URL query
  const queryParams = new URLSearchParams(location.search);
  const courseIdParam = queryParams.get('courseId');

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
      .then(setCourses)
      .catch(err => setError(err.message));
  }, []);

  useEffect(() => {
    getInstructorAssessments()
      .then(setAssessments)
      .catch(err => setError(err.message));
  }, []);

  const handleCreateAssessment = () => {
    navigate(`/instructor/assessment/${courseId}/create`);
  };

  // Fetch and display assessment details
  const handleViewAssessment = async (assessment) => {
    try {
      const id = assessment.id || assessment.assessmentId;
      const data = await getAssessmentById(id);
      // For now, just alert the JSON string. Replace with modal or details page as needed.
      alert(JSON.stringify(data, null, 2));
    } catch (err) {
      alert('Failed to fetch assessment details: ' + err.message);
    }
  };

  // Fetch and display assessment details for editing

  // Handler to remove an assessment
  const handleRemoveAssessment = async (assessmentId) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;
    try {
      await deleteAssessment(assessmentId);
      setAssessments(assessments.filter(a => (a.id || a.assessmentId) !== assessmentId));
    } catch (err) {
      alert('Failed to delete assessment: ' + err.message);
    }
  };

  if (loadingUser) {
    return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</div>;
  }

  // Get all courseIds owned by this instructor
  const myCourseIds = courses.filter(course => String(course.instructorId) === String(userId)).map(course => String(course.courseId));
  // Only show assessments for those courses
  let filteredAssessments = assessments.filter(a => myCourseIds.includes(String(a.courseId)));

  // If courseId is present in the URL, further filter to that course only
  if (courseId) {
    filteredAssessments = filteredAssessments.filter(a => String(a.courseId) === String(courseId));
  }

  return (
    <div className="assessment-dashboard-container">
      <h2 className="dashboard-title">Your Assessments</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!courseIdParam && (
        <div style={{ color: '#888', marginBottom: '1rem', textAlign: 'center' }}>
          Please select a course to view its assessments.
        </div>
      )}
      <div className="assessment-cards-grid">
        {filteredAssessments.map(assessment => (
          <div className="assessment-card" key={assessment.id || assessment.assessmentId}>
            <div className="assessment-title">{assessment.title || assessment.Title}</div>
            {assessment.description || assessment.Description ? (
              <div className="assessment-description" style={{ color: '#444', marginBottom: '1.2rem' }}>
                {assessment.description || assessment.Description}
              </div>
            ) : null}
            <div className="assessment-actions">
              <button className="assessment-view-btn" onClick={() => { setSelectedAssessment(assessment); setViewModalOpen(true); }}>View</button>
              <button className="assessment-edit-btn" onClick={() => navigate(`/instructor/editassessment/${assessment.id || assessment.assessmentId}`)}>Edit</button>
              <button className="assessment-remove-btn" onClick={() => handleRemoveAssessment(assessment.id || assessment.assessmentId)}>Remove</button>
            </div>
          </div>
        ))}
        {/* Add Assessment Card */}
        <div className="assessment-card add-assessment-card" onClick={handleCreateAssessment} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: '3rem', color: '#444' }}>+</span>
        </div>
      </div>
      {viewModalOpen && selectedAssessment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedAssessment.title || selectedAssessment.Title}</h3>
            <div style={{ color: '#444', marginBottom: '1.2rem' }}>{selectedAssessment.description || selectedAssessment.Description}</div>
            <div className="modal-btn-row">
              <button className="modal-btn view-material" onClick={() => handleViewAssessment(selectedAssessment)}>
                View Assessment
              </button>
              <button className="modal-btn create-quiz" onClick={() => navigate(`/instructor/assessment/${selectedAssessment.id || selectedAssessment.assessmentId}/results`)}>
                View Result
              </button>
              <button className="modal-btn back-btn" onClick={() => setViewModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessment; 