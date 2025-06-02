import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Assessment.css';
import { getAssessmentById, updateAssessment } from '../services/api';

const defaultQuestion = () => ({
  QuestionText: '',
  Options: ['', '', '', ''],
  CorrectOption: 0,
  Score: 1
});

const EditAssessment = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [Title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [questions, setQuestions] = useState([defaultQuestion()]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const data = await getAssessmentById(assessmentId);
        console.log('Loaded assessment:', data);
        console.log('Loaded questions:', data.questions || data.Questions);
        setTitle(data.title || '');
        setCourseId(data.courseId || data.CourseId || '');
        setQuestions(
          (data.questions || data.Questions || []).map(q => ({
            QuestionText: q.QuestionText || q.questionText || q.question || '',
            Options: q.Options || q.options || ['', '', '', ''],
            CorrectOption: typeof q.CorrectOption === 'number' ? q.CorrectOption
                        : typeof q.correctOption === 'number' ? q.correctOption
                        : typeof q.correctAnswer === 'number' ? q.correctAnswer
                        : 0,
            Score: q.Score || q.score || q.Marks || q.marks || 1
          }))
        );
      } catch (err) {
        setError('Failed to load assessment: ' + err.message);
      }
    };
    fetchAssessment();
  }, [assessmentId]);

  const maxScore = questions.reduce((sum, q) => sum + Number(q.Score || 0), 0);

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

  const handleScoreChange = (idx, value) => {
    const updated = [...questions];
    updated[idx].Score = parseInt(value, 10);
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
      await updateAssessment(assessmentId, {
        courseId,
        title: Title,
        questions,
        maxScore
      });
      setMessage('Assessment updated successfully!');
      setTimeout(() => navigate('/instructor/assessment'), 1200);
    } catch (err) {
      setError(err.message || 'Failed to update assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assessment-container">
      <h2>Edit Assessment</h2>
      {message && <div style={{ color: 'green', marginBottom: '1rem' }}>{message}</div>}
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <form className="assessment-form" onSubmit={handleSubmit}>
        <label>Assessment Title
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
          Max Score: {maxScore}
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Updating...' : 'Update Assessment'}</button>
      </form>
    </div>
  );
};

export default EditAssessment; 