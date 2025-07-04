import React, { useState, useEffect } from 'react';
import { createCourse, getUserIdByEmail, uploadFile, listFiles, deleteFile, getUserRole } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AddCourse = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userId, setUserId] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [materialMode, setMaterialMode] = useState('file'); // 'file' or 'url'
  const [file, setFile] = useState(null);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [fileUploadError, setFileUploadError] = useState('');
  const [, setFileList] = useState([]);
  const navigate = useNavigate();
  const role = getUserRole();

  useEffect(() => {
    // Get email from token
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
    if (role === 'Instructor') {
      listFiles().then(res => {
        setFileList(res.blobs || []);
      }).catch(() => setFileList([]));
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await createCourse({ title, description, mediaUrl, instructorId: userId });

      // If a file was uploaded but is not the final mediaUrl, it was orphaned and should be deleted.
      if (uploadedFileUrl && uploadedFileUrl !== mediaUrl) {
        try {
          const orphanedFileName = decodeURIComponent(uploadedFileUrl.split('/').pop().split('?')[0]);
          await deleteFile(orphanedFileName);
        } catch (deleteError) {
          // Log error but don't block success message
          console.error("Failed to delete orphaned file.", deleteError);
        }
      }

      setSuccess('Course created successfully!');
      setTitle('');
      setDescription('');
      setMediaUrl('');
      setTimeout(() => navigate('/instructor/dashboard'), 1200);
    } catch (err) {
      setError(err.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    setFileUploadError('');
    setFileUploadLoading(true);
    try {
      // If a file was already uploaded in this session, delete it before uploading the new one.
      if (uploadedFileUrl && uploadedFileUrl.includes('.blob.core.windows.net')) {
        const oldFileName = decodeURIComponent(uploadedFileUrl.split('/').pop().split('?')[0]);
        await deleteFile(oldFileName);
      }

      if (!file) throw new Error('No file selected');
      const res = await uploadFile(file);
      setMediaUrl(res.fileUrl);
      setUploadedFileUrl(res.fileUrl); // Track the uploaded file
      setSuccess('File uploaded and URL set!');
      // Refresh file list
      const filesRes = await listFiles();
      setFileList(filesRes.blobs || []);
    } catch (err) {
      setFileUploadError(err.message || 'Failed to upload file');
      setUploadedFileUrl(''); // Clear on failure
    } finally {
      setFileUploadLoading(false);
    }
  };

  if (loadingUser) {
    return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: 420, margin: '3rem auto', padding: '2rem', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 8 }}>Add New Course</h2>
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
        {role === 'Instructor' && (
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Course Material</label>
            <div style={{ marginBottom: 8 }}>
              <button type="button" onClick={() => setMaterialMode('file')} style={{ marginRight: 8, background: materialMode === 'file' ? '#2563eb' : '#eee', color: materialMode === 'file' ? '#fff' : '#222', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Upload File</button>
              <button type="button" onClick={() => setMaterialMode('url')} style={{ background: materialMode === 'url' ? '#2563eb' : '#eee', color: materialMode === 'url' ? '#fff' : '#222', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Direct URL</button>
            </div>
            {materialMode === 'file' ? (
              <div>
                <input type="file" onChange={e => setFile(e.target.files[0])} disabled={fileUploadLoading} />
                <button type="button" onClick={handleFileUpload} disabled={fileUploadLoading || !file} style={{ marginLeft: 8 }}>Upload</button>
                {fileUploadLoading && <span style={{ marginLeft: 8 }}>Uploading...</span>}
                {fileUploadError && <div style={{ color: '#d32f2f', marginTop: 6 }}>{fileUploadError}</div>}
                {mediaUrl && mediaUrl.startsWith('http') && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>Uploaded File:</div>
                    <a href={mediaUrl} target="_blank" rel="noopener noreferrer">{mediaUrl.split('/').pop()}</a>
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
          {loading ? 'Creating...' : 'Add Course'}
        </button>
      </form>
    </div>
  );
};

export default AddCourse;
