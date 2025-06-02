import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAllResults, getUserById, deleteResult } from '../services/api';

const ResultPage = () => {
  const { assessmentId } = useParams();
  const [groupedResults, setGroupedResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentNames, setStudentNames] = useState({});

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const allResults = await getAllResults();
        console.log('allResults:', allResults);
        const filtered = allResults.filter(r => String(r.assessmentId || r.AssessmentId) === String(assessmentId));
        console.log('assessmentId param:', assessmentId, 'filtered:', filtered);
        // Group by UserId (fix: use UserId or fallback to studentId)
        const grouped = {};
        filtered.forEach(res => {
          const sid = res.UserId || res.userId || res.studentId;
          if (!sid) return; // skip if no user id
          if (!grouped[sid]) grouped[sid] = [];
          grouped[sid].push(res);
        });
        setGroupedResults(grouped);
        // Fetch student names
        const ids = Object.keys(grouped).filter(id => id && id !== 'undefined' && id !== 'null');
        const names = {};
        await Promise.all(ids.map(async id => {
          try {
            const user = await getUserById(id);
            names[id] = user.name || user.fullName || user.email || id;
          } catch {
            names[id] = id;
          }
        }));
        setStudentNames(names);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [assessmentId]);

  const handleDeleteResult = async (resultId) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return;
    try {
      await deleteResult(resultId);
      setGroupedResults(prev => {
        // Remove the result from the groupedResults state
        const updated = { ...prev };
        Object.keys(updated).forEach(studentId => {
          updated[studentId] = updated[studentId].filter(r => (r.resultId || r.ResultId) !== resultId);
        });
        // Remove empty student groups
        Object.keys(updated).forEach(studentId => {
          if (updated[studentId].length === 0) delete updated[studentId];
        });
        return updated;
      });
    } catch (err) {
      alert('Failed to delete result: ' + err.message);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading results...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '3rem' }}>{error}</div>;

  return (
    <div className="assessment-dashboard-container">
      <h2 className="dashboard-title">Assessment Results</h2>
      {Object.keys(groupedResults).length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', marginTop: '2rem' }}>No results found for this assessment.</div>
      ) : (
        <div>
          {Object.entries(groupedResults).map(([studentId, attempts]) => (
            <div key={studentId} style={{ border: '1px solid #ddd', borderRadius: 8, margin: '1rem 0', padding: '1rem' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Student: {studentId && studentId !== 'undefined' && studentId !== 'null' ? (studentNames[studentId] || studentId) : 'Unknown Student'}</div>
              <ul style={{ textAlign: 'left' }}>
                {attempts.map((res, idx) => (
                  <li key={res.resultId || res.ResultId || idx} style={{ marginBottom: 6, display: 'flex', alignItems: 'center' }}>
                    <span style={{ flex: 1 }}><strong>Attempt {idx + 1}:</strong> Score: {res.score}, Date: {new Date(res.attemptDate).toLocaleString()}</span>
                    <button style={{ marginLeft: 12, color: 'white', background: '#dc2626', border: 'none', borderRadius: 4, padding: '2px 10px', cursor: 'pointer' }} onClick={() => handleDeleteResult(res.resultId || res.ResultId)}>Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultPage; 