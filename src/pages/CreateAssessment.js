import React, { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import '../styles/Assessment.css';
import { createQuiz } from '../services/api';

const defaultQuestion = () => ({
  QuestionText: '',
  Options: ['', '', '', ''],
  CorrectOption: 0,
  Score: 1
});

const CreateAssessment = () => {
  const location = useLocation();
  //const navigate = useNavigate();
  const { courseId } = useParams();
  const courseTitle = location.state?.title;
  const courseDescription = location.state?.description;

  const [Title, setTitle] = useState('');
  const [questions, setQuestions] = useState([defaultQuestion()]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Calculate MaxScore as the sum of all question scores
  const MaxScore = questions.reduce((sum, q) => sum + Number(q.Score || 0), 0);

  const handleQuestionChange = (idx, value) => {
    const updated = [...questions];
    updated[idx].QuestionText = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    const updated = [...questions];
    updated[qIdx].Options[oIdx] = value;
    setQuestions(updated);
  };

  const handleCorrectChange = (qIdx, value) => {
    const updated = [...questions];
    updated[qIdx].CorrectOption = parseInt(value, 10);
    setQuestions(updated);
  };

  const handleScoreChange = (qIdx, value) => {
    const updated = [...questions];
    updated[qIdx].Score = Number(value);
    setQuestions(updated);
  };

  const addQuestion = () => setQuestions([...questions, defaultQuestion()]);
  const removeQuestion = idx => setQuestions(questions.filter((_, i) => i !== idx));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await createQuiz({
        courseId,
        title: Title,
        questions,
        maxScore: MaxScore
      });
      setMessage('Quiz created successfully!');
      setTitle('');
      setQuestions([defaultQuestion()]);
    } catch (err) {
      setError(err.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assessment-container">
      <h2>Create Quiz</h2>
      {courseTitle && (
        <div className="course-info">
          <strong>Course:</strong> {courseTitle}
          <br />
          <span style={{ color: '#555' }}>{courseDescription}</span>
        </div>
      )}
      {message && <div style={{ color: 'green', marginBottom: '1rem' }}>{message}</div>}
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <form className="assessment-form" onSubmit={handleSubmit}>
        <label>Quiz Title
          <input value={Title} onChange={e => setTitle(e.target.value)} required />
        </label>
        <div className="questions-section">
          <h3>Questions</h3>
          {questions.map((q, idx) => (
            <div className="question-block" key={idx}>
              <label>Question {idx + 1}
                <input value={q.QuestionText} onChange={e => handleQuestionChange(idx, e.target.value)} required />
              </label>
              <div className="options-row">
                {q.Options.map((opt, oIdx) => (
                  <label key={oIdx}>
                    Option {oIdx + 1}
                    <input value={opt} onChange={e => handleOptionChange(idx, oIdx, e.target.value)} required />
                  </label>
                ))}
              </div>
              <label>Correct Answer
                <select value={q.CorrectOption} onChange={e => handleCorrectChange(idx, e.target.value)}>
                  {q.Options.map((_, oIdx) => (
                    <option value={oIdx} key={oIdx}>Option {oIdx + 1}</option>
                  ))}
                </select>
              </label>
              <label>Score
                <input type="number" min="1" value={q.Score} onChange={e => handleScoreChange(idx, e.target.value)} required />
              </label>
              {questions.length > 1 && (
                <button type="button" className="remove-btn" onClick={() => removeQuestion(idx)}>Remove</button>
              )}
            </div>
          ))}
          <button type="button" className="add-btn" onClick={addQuestion}>Add Question</button>
        </div>
        <div style={{ margin: '1rem 0', fontWeight: 500 }}>
          Max Score: {MaxScore}
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Creating...' : 'Create Quiz'}</button>
      </form>
    </div>
  );
};

export default CreateAssessment; 