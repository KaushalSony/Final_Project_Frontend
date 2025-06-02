import React, { useEffect, useState } from 'react';
import { getAllInstructors, deleteUserById, updateUserProfile, createUser } from '../services/api';
import EditUserModal from '../components/EditUserModal';
import '../styles/AdminUserList.css';

const ViewInstructor = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getAllInstructors();
        setInstructors(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch instructors');
      } finally {
        setLoading(false);
      }
    };
    fetchInstructors();
  }, []);

  const handleEdit = (instructor) => {
    setEditUser(instructor);
    setEditModalOpen(true);
  };

  const handleEditSave = async (updatedData) => {
    await updateUserProfile(editUser.userId, updatedData);
    setInstructors(prev => prev.map(inst => inst.userId === editUser.userId ? { ...inst, ...updatedData } : inst));
  };

  const handleAddSave = async (newData) => {
    const userToCreate = { ...newData, role: 'Instructor' };
    const created = await createUser(userToCreate);
    setInstructors(prev => [...prev, created]);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this instructor?')) return;
    setDeletingId(userId);
    try {
      await deleteUserById(userId);
      setInstructors(prev => prev.filter(inst => inst.userId !== userId));
    } catch (err) {
      alert(err.message || 'Failed to delete instructor');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="user-list-container">
      {loading && <div>Loading instructors...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && instructors.length === 0 && <div>No instructors found.</div>}
      {!loading && !error && instructors.map((inst) => (
        <div className="user-card" key={inst.userId}>
          <div className="user-card-title">{inst.name}</div>
          <div className="user-card-desc">
            <div><b>Email:</b> {inst.email}</div>
            <div><b>Role:</b> {inst.role}</div>
          </div>
          <div className="user-card-actions">
            <button className="edit-btn" onClick={() => handleEdit(inst)}>Edit</button>
            <button className="delete-btn" onClick={() => handleDelete(inst.userId)} disabled={deletingId === inst.userId}>
              {deletingId === inst.userId ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
      {/* Plus card for adding new instructor */}
      <div
        className="plus-card"
        onClick={() => setAddModalOpen(true)}
        title="Add Instructor"
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

export default ViewInstructor; 