import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../services/api';
import '../styles/Profile.css';

// Default avatar as data URL - a simple user icon
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e0e0e0'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

const Profile = () => {
    const [profile, setProfile] = useState({
        userId: '',
        firstName: '',
        lastName: '',
        email: '',
        role: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const data = await getUserProfile();
                const profileData = {
                    userId: data.id || data.userId,
                    firstName: data.firstName || data.name?.split(' ')[0] || '',
                    lastName: data.lastName || data.name?.split(' ')[1] || '',
                    email: data.email || '',
                    role: data.role || ''
                };
                
                setProfile(profileData);
                setEditedProfile(profileData);
            } catch (err) {
                console.error('Error fetching profile:', err);
                if (err.message.includes('No authentication token found')) {
                    navigate('/login');
                } else {
                    setError('Failed to fetch profile data. Please try logging in again.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditedProfile(profile);
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            // TODO: Implement API call to update profile
            await updateUserProfile(profile.userId, {
                name: editedProfile.firstName + ' ' + editedProfile.lastName,
                email: editedProfile.email
            });
            setProfile(editedProfile);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };
    

    if (isLoading) {
        return (
            <div className="profile-container">
                <div className="loading-message">Loading profile data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar-section">
                    <img 
                        src={DEFAULT_AVATAR} 
                        alt="Profile" 
                        className="profile-avatar"
                    />
                </div>
                <div className="profile-info-section">
                    <h1 className="profile-name">{profile.firstName} {profile.lastName}</h1>
                    <div className="profile-id">
                        <span>ID: {profile.userId}</span>
                    </div>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-form">
                    <div className="form-group">
                        <label>First Name:</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="firstName"
                                value={editedProfile.firstName}
                                onChange={handleChange}
                            />
                        ) : (
                            <span className="profile-value">{profile.firstName}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Last Name:</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="lastName"
                                value={editedProfile.lastName}
                                onChange={handleChange}
                            />
                        ) : (
                            <span className="profile-value">{profile.lastName}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Email:</label>
                        {isEditing ? (
                            <input
                                type="email"
                                name="email"
                                value={editedProfile.email}
                                onChange={handleChange}
                            />
                        ) : (
                            <span className="profile-value">{profile.email}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Role:</label>
                        <span className="profile-value">{profile.role}</span>
                    </div>

                    <div className="profile-actions">
                        {isEditing ? (
                            <>
                                <button className="save-btn" onClick={handleSave}>Save</button>
                                <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                            </>
                        ) : (
                            <button className="edit-btn" onClick={handleEdit}>Edit Profile</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile; 