import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Assessment.css';
import { getInstructorAssessments, getAllResults } from '../services/api';

function getCurrentUserId() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // console.log('JWT payload:', payload); // You can remove or keep this for future debugging
    return (
      payload.nameid ||
      payload.id ||
      payload.Id ||
      payload.userId ||
      payload.UserId ||
      payload.sub
    );
  } catch {
    return null;
  }
}

const StudentAssessment = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resultModal, setResultModal] = useState({ open: false, loading: false, result: null, error: '', assessment: null });

  useEffect(() => {
    setLoading(true);
    getInstructorAssessments()
      .then(data => {
        // Filter by courseId on the frontend
        setAssessments(data.filter(a => String(a.courseId) === String(courseId)));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleViewResult = async (assessment) => {
    setResultModal({ open: true, loading: true, result: null, error: '', assessment });
    try {
      const allResults = await getAllResults();
      const userId = getCurrentUserId();
      console.log('Current userId from JWT:', userId);
      allResults.forEach((r, i) => {
        console.log(`Result[${i}]:`, {
          assessmentId: r.assessmentId,
          AssessmentId: r.AssessmentId,
          userId: r.userId,
          UserId: r.UserId,
          studentId: r.studentId
        });
      });
      // Filter for this assessment AND this student (robust to property casing)
      const results = allResults.filter(
        r =>
          String(r.assessmentId || r.AssessmentId) === String(assessment.id || assessment.assessmentId || assessment.AssessmentId) &&
          String(r.UserId || r.userId || r.studentId) === String(userId)
      );
      setResultModal({ open: true, loading: false, result: results, error: '', assessment });
    } catch (err) {
      setResultModal({ open: true, loading: false, result: null, error: err.message, assessment });
    }
  };

  const handleCloseResultModal = () => setResultModal({ open: false, loading: false, result: null, error: '', assessment: null });

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading assessments...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: '3rem' }}>{error}</div>;
  }

  return (
    <div className="assessment-dashboard-container">
      <h2 className="dashboard-title">Assessments for this Course</h2>
      {assessments.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', marginTop: '2rem' }}>No assessments available for this course.</div>
      ) : (
        <div className="assessment-cards-grid">
          {assessments.map(assessment => (
            <div className="assessment-card" key={assessment.id || assessment.assessmentId}>
              <div className="assessment-title">{assessment.title || assessment.Title}</div>
              {assessment.description || assessment.Description ? (
                <div className="assessment-description" style={{ color: '#444', marginBottom: '1.2rem' }}>
                  {assessment.description || assessment.Description}
                </div>
              ) : null}
              <button
                className="assessment-view-btn"
                onClick={() => navigate(`/student/take-assessment/${assessment.id || assessment.assessmentId}`)}
                style={{ marginTop: '1rem' }}
              >
                Take Assessment
              </button>
              <button
                className="assessment-view-btn"
                style={{ marginTop: '1rem', background: '#2563eb' }}
                onClick={() => handleViewResult(assessment)}
              >
                Result
              </button>
            </div>
          ))}
        </div>
      )}
      {resultModal.open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Assessment Result</h3>
            {resultModal.loading ? (
              <div>Loading...</div>
            ) : resultModal.result && resultModal.result.length > 0 ? (
              <div>
                <ul style={{ textAlign: 'left' }}>
                  {resultModal.result.map((res, idx) => (
                    <li key={res.resultId || idx} style={{ marginBottom: 8 }}>
                      <strong>Attempt {idx + 1}:</strong> Score: {res.score}, Date: {new Date(res.attemptDate).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div style={{ color: 'red' }}>Please attempt the Assessment first.</div>
            )}
            <button className="modal-btn back-btn" onClick={handleCloseResultModal} style={{ marginTop: 16 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssessment; 