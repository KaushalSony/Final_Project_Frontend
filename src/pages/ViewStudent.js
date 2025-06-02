import React, { useEffect, useState } from 'react';
import { getAllStudents, deleteUserById, updateUserProfile, createUser } from '../services/api';
import EditUserModal from '../components/EditUserModal';
import '../styles/AdminUserList.css';

const ViewStudent = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getAllStudents();
        setStudents(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleEdit = (student) => {
    setEditUser(student);
    setEditModalOpen(true);
  };

  const handleEditSave = async (updatedData) => {
    await updateUserProfile(editUser.userId, updatedData);
    setStudents(prev => prev.map(student => student.userId === editUser.userId ? { ...student, ...updatedData } : student));
  };

  const handleAddSave = async (newData) => {
    const userToCreate = { ...newData, role: 'Student' };
    const created = await createUser(userToCreate);
    setStudents(prev => [...prev, created]);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    setDeletingId(userId);
    try {
      await deleteUserById(userId);
      setStudents(prev => prev.filter(student => student.userId !== userId));
    } catch (err) {
      alert(err.message || 'Failed to delete student');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="user-list-container">
      {loading && <div>Loading students...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && students.length === 0 && <div>No students found.</div>}
      {!loading && !error && students.map((student) => (
        <div className="user-card" key={student.userId}>
          <div className="user-card-title">{student.name}</div>
          <div className="user-card-desc">
            <div><b>Email:</b> {student.email}</div>
            <div><b>Role:</b> {student.role}</div>
          </div>
          <div className="user-card-actions">
            <button className="edit-btn" onClick={() => handleEdit(student)}>Edit</button>
            <button className="delete-btn" onClick={() => handleDelete(student.userId)} disabled={deletingId === student.userId}>
              {deletingId === student.userId ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
      {/* Plus card for adding new student */}
      <div
        className="plus-card"
        onClick={() => setAddModalOpen(true)}
        title="Add Student"
      >
        <span style={{ fontWeight: 400, fontSize: '2.5rem', userSelect: 'none' }}>+</span>
      </div>
      <EditUserModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={editUser}
        onSave={handleEditSave}
        mode="edit"
      />
      <EditUserModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        user={null}
        onSave={handleAddSave}
        mode="add"
      />
    </div>
  );
};

export default ViewStudent; 