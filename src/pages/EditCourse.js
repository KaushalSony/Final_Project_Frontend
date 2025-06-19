import React, { useState, useEffect } from 'react';
import { updateCourse, getInstructorCourses, getUserIdByEmail, uploadFile, listFiles, deleteFile, getUserRole } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';

const EditCourse = () => {
  const { courseId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [userId, setUserId] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [materialMode, setMaterialMode] = useState('file'); // 'file' or 'url'
  const [file, setFile] = useState(null);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [fileUploadError, setFileUploadError] = useState('');
  const [fileList, setFileList] = useState([]);
  const navigate = useNavigate();
  const role = getUserRole();

  useEffect(() => {
    // Get instructorId from token/email
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
    // Fetch the course details from instructor's courses
    setLoadingCourse(true);
    getInstructorCourses()
      .then(courses => {
        const course = courses.find(c => String(c.courseId) === String(courseId));
        if (course) {
          setTitle(course.title || '');
          setDescription(course.description || '');
          setMediaUrl(course.mediaUrl || '');
        } else {
          setError('Course not found');
        }
      })
      .catch(() => setError('Failed to load course'))
      .finally(() => setLoadingCourse(false));
  }, [courseId]);

  useEffect(() => {
    if (role === 'Instructor') {
      listFiles().then(res => {
        setFileList(res.blobs || []);
      }).catch(() => setFileList([]));
    }
  }, [role, courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await updateCourse(courseId, {
        title,
        description,
        mediaUrl,
        instructorId: userId
      });
      setSuccess('Course updated successfully!');
      setTimeout(() => navigate('/instructor/dashboard'), 1200);
    } catch (err) {
      setError(err.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    setFileUploadError('');
    setFileUploadLoading(true);
    try {
      // If a file is already uploaded, delete it first
      if (mediaUrl && mediaUrl.startsWith('http')) {
        const oldFileName = mediaUrl.split('/').pop().split('?')[0];
        await deleteFile(oldFileName);
        setMediaUrl('');
      }
      if (!file) throw new Error('No file selected');
      const res = await uploadFile(file);
      setMediaUrl(res.fileUrl);
    } catch (err) {
      setFileUploadError(err.message || 'Failed to upload file');
    } finally {
      setFileUploadLoading(false);
    }
  };

  const handleDeleteFile = async (fileName) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await deleteFile(fileName);
      setFileList(prev => prev.filter(f => f !== fileName));
      if (mediaUrl.includes(fileName)) setMediaUrl('');
    } catch (err) {
      setFileUploadError(err.message || 'Failed to delete file');
    }
  };

  if (loadingCourse || loadingUser) {
    return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: 420, margin: '3rem auto', padding: '2rem', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 8 }}>Edit Course</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bbb' }}
            placeholder="Enter course title"
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={4}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bbb', resize: 'vertical' }}
            placeholder="Enter course description"
          />
        </div>
        {/* Course Material Section (Instructor only) */}
        {role === 'Instructor' && (
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Course Material</label>
            <div style={{ marginBottom: 8 }}>
              <button type="button" onClick={() => setMaterialMode('file')} style={{ marginRight: 8, background: materialMode === 'file' ? '#2563eb' : '#eee', color: materialMode === 'file' ? '#fff' : '#222', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Upload File</button>
              <button type="button" onClick={async () => {
                if (materialMode === 'file' && mediaUrl && mediaUrl.startsWith('http')) {
                  const oldFileName = mediaUrl.split('/').pop().split('?')[0];
                  await deleteFile(oldFileName);
                  setMediaUrl('');
                }
                setMaterialMode('url');
              }} style={{ background: materialMode === 'url' ? '#2563eb' : '#eee', color: materialMode === 'url' ? '#fff' : '#222', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Direct URL</button>
            </div>
            {materialMode === 'file' ? (
              <div>
                <input type="file" onChange={e => setFile(e.target.files[0])} disabled={fileUploadLoading} />
                <button type="button" onClick={handleFileUpload} disabled={fileUploadLoading || !file} style={{ marginLeft: 8 }}>Upload</button>
                {fileUploadLoading && <span style={{ marginLeft: 8 }}>Uploading...</span>}
                {fileUploadError && <div style={{ color: '#d32f2f', marginTop: 6 }}>{fileUploadError}</div>}
                {/* Show only the uploaded file for this course */}
                {mediaUrl && mediaUrl.startsWith('http') && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>Uploaded File:</div>
                    <a href={mediaUrl} target="_blank" rel="noopener noreferrer">{mediaUrl.split('/').pop()}</a>
                    <button type="button" onClick={() => setMediaUrl('')} style={{ marginLeft: 8, color: '#d32f2f', border: 'none', background: 'none', cursor: 'pointer' }}>Remove</button>
                  </div>
                )}
              </div>
            ) : (
              <input
                type="url"
                value={mediaUrl}
                onChange={e => setMediaUrl(e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bbb' }}
                placeholder="https://..."
              />
            )}
          </div>
        )}
        {error && <div style={{ color: '#d32f2f', marginBottom: 12, textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: '#388e3c', marginBottom: 12, textAlign: 'center' }}>{success}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px 0', borderRadius: 8, background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 17, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditCourse; 
