import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Assessment.css';
import { getAssessmentById, saveAssessmentResult } from '../services/api';

const StudentTakeAssessment = () => {
  const { assessmentId, courseId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    getAssessmentById(assessmentId)
      .then(data => {
        setAssessment(data);
        setAnswers(new Array((data.questions || data.Questions || []).length).fill(null));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [assessmentId]);

  const handleOptionChange = (qIdx, optIdx) => {
    setAnswers(prev => {
      const updated = [...prev];
      updated[qIdx] = optIdx;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Calculate score using Score property
    let score = 0;
    const questions = assessment.questions || assessment.Questions || [];
    questions.forEach((q, idx) => {
      const correctOption = q.CorrectOption ?? q.correctOption ?? q.correctAnswer;
      const qScore = q.Score ?? q.score ?? q.marks ?? 1;
      if (typeof answers[idx] === 'number' && correctOption === answers[idx]) {
        score += qScore;
      }
    });
    try {
      await saveAssessmentResult(assessmentId, {
        Score: score,
        AttemptDate: new Date().toISOString()
      });
      setResultMessage('Result saved successfully!');
      setTimeout(() => {
        // Try to get courseId from assessment object or params
        const cid = assessment.courseId || assessment.CourseId || courseId;
        if (cid) {
          navigate(`/student/assessment/${cid}`);
        } else {
          navigate('/student/dashboard');
        }
      }, 2000);
    } catch (err) {
      setResultMessage('Failed to save result: ' + err.message);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading assessment...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: '3rem' }}>{error}</div>;
  }

  if (!assessment) {
    return null;
  }

  const questions = assessment.questions || assessment.Questions || [];

  return (
    <div className="assessment-container">
      <h2>{assessment.title || assessment.Title}</h2>
      <form className="assessment-form" onSubmit={handleSubmit}>
        {questions.map((q, qIdx) => (
          <div className="question-block" key={qIdx}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>Q{qIdx + 1}: {q.questionText || q.question}</div>
            <div className="options-row">
              {(q.options || q.Options || []).map((opt, optIdx) => (
                <label key={optIdx} style={{ flex: 1 }}>
                  <input
                    type="radio"
                    name={`question-${qIdx}`}
                    value={optIdx}
                    checked={answers[qIdx] === optIdx}
                    onChange={() => handleOptionChange(qIdx, optIdx)}
                    required
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
        {!submitted && (
          <button type="submit" className="submit-btn" style={{ marginTop: 16 }}>Submit Assessment</button>
        )}
      </form>
      {submitted && (
        <div style={{ marginTop: 24, color: '#2563eb', fontWeight: 500 }}>
          <h3>Your Answers:</h3>
          <ul>
            {questions.map((q, idx) => (
              <li key={idx}>
                Q{idx + 1}: {typeof answers[idx] === 'number' ? (q.options || q.Options || [])[answers[idx]] : 'No answer selected'}
              </li>
            ))}
          </ul>
          {resultMessage && <div style={{ marginTop: 16, color: resultMessage.startsWith('Failed') ? 'red' : 'green' }}>{resultMessage}</div>}
        </div>
      )}
    </div>
  );
};

export default StudentTakeAssessment; 