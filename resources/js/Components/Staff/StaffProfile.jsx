import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../css/css_of_staff/StaffProfile.css';

const StaffProfile = () => {
    const { user, token, updateUser } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
            // Add 400ms delay to see loading effect clearly
            setTimeout(() => {
                setInitialLoading(false);
            }, 400);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                setErrors(prev => ({
                    ...prev,
                    avatar: 'Please select a valid image file (JPEG, PNG, JPG, GIF)'
                }));
                return;
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    avatar: 'File size must be less than 2MB'
                }));
                return;
            }

            setAvatarFile(file);
            
            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target.result);
            };
            reader.readAsDataURL(file);

            // Clear any previous avatar errors
            setErrors(prev => ({
                ...prev,
                avatar: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await axios.get('/sanctum/csrf-cookie');
            
            // Always use FormData to maintain consistency
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('email', formData.email);
            submitData.append('phone', formData.phone || ''); // Ensure phone is never undefined
            
            // Add avatar file if selected
            if (avatarFile) {
                submitData.append('avatar', avatarFile);
            }

            // Debug: Log what we're sending
            console.log('Submitting data:', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                hasAvatar: !!avatarFile
            });

            const response = await axios.post(`/api/users/${user.id}/update`, submitData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            updateUser(response.data.user);
            setIsEditing(false);
            // Only reset avatar states if new avatar was uploaded
            if (avatarFile) {
                setAvatarFile(null);
                setAvatarPreview(null);
            }
            setErrors({});
            window.showNotification ? 
                window.showNotification('Profile updated successfully!', 'success') : 
                alert('Profile updated successfully!');
        } catch (err) {
            console.error('Error updating profile:', err.response?.data || err.message);
            
            // Handle validation errors
            if (err.response?.status === 422 && err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({
                    general: err.response?.data?.message || 'Failed to update profile'
                });
            }
            
            window.showNotification ? 
                window.showNotification(err.response?.data?.message || 'Failed to update profile', 'error') : 
                alert(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            window.showNotification ? 
                window.showNotification('New password and confirmation do not match.', 'error') : 
                alert('New password and confirmation do not match.');
            setLoading(false);
            return;
        }

        try {
            await axios.get('/sanctum/csrf-cookie', {
                withCredentials: true,
            });

            await axios.post(
                `/api/users/${user.id}/change-password`,
                passwordData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );

            setIsChangingPassword(false);
            setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
            window.showNotification ? 
                window.showNotification('Password changed successfully!', 'success') : 
                alert('Password changed successfully!');
        } catch (err) {
            console.error('Error changing password:', err.response?.data || err.message);
            window.showNotification ? 
                window.showNotification('Failed to change password', 'error') : 
                alert('Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
        });
        // Only reset avatar states if there was a new avatar selected
        if (avatarFile) {
            setAvatarFile(null);
            setAvatarPreview(null);
        }
        setErrors({});
    };

    const handleCancelPasswordChange = () => {
        setIsChangingPassword(false);
        setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
    };

    if (!user) {
        return <div className="staff-profile-container mt-5 text-center">Loading...</div>;
    }

    return (
        <div className="staff-profile-container">
            <div className="staff-profile-header">
                <h2>Staff Profile</h2>
            </div>
            
            {initialLoading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-2" />
                    <p>Loading data...</p>
                </div>
            ) : (
                <div className="staff-profile-content">
                <div className="staff-profile-section">
                    <div className="staff-profile-info">
                        <div className="staff-profile-avatar">
                            <img 
                                src={user.avatar?.startsWith('http') ? user.avatar : `/storage/${user.avatar}`} 
                                alt="Avatar" 
                                className="staff-avatar-img"
                                onError={(e) => {
                                    e.target.src = '/images/Dat/avatar/default.png';
                                }}
                            />
                        </div>
                        <div className="staff-profile-details">
                            <h3>{user.name}</h3>
                            <p><i className="bx bx-envelope"></i> {user.email}</p>
                            <p><i className="bx bx-phone"></i> {user.phone || 'No phone number'}</p>
                            <p><i className="bx bx-id-card"></i> Role: {user.role}</p>
                        </div>
                    </div>
                    
                    {!isEditing && !isChangingPassword && (
                        <div className="staff-profile-actions">
                            <button className="staff-btn staff-btn-primary" onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </button>
                            <button className="staff-btn staff-btn-secondary" onClick={() => setIsChangingPassword(true)}>
                                Change Password
                            </button>
                        </div>
                    )}
                </div>

                {isEditing && (
                    <div className="staff-edit-profile-section">
                        <h3>Edit Profile</h3>
                        {errors.general && (
                            <div className="alert alert-danger mb-3">
                                {errors.general}
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="staff-form-label">Profile Picture</label>
                                <div className="staff-avatar-upload">
                                    <div className="staff-avatar-preview">
                                        <img 
                                            src={avatarPreview || (user.avatar?.startsWith('http') ? user.avatar : `/storage/${user.avatar}`)} 
                                            alt="Avatar Preview" 
                                            className="staff-avatar-img-preview" 
                                            onError={(e) => {
                                                e.target.src = '/images/Dat/avatar/default.png';
                                            }}
                                        />
                                    </div>
                                    <div className="staff-avatar-controls">
                                        <input
                                            type="file"
                                            id="avatar"
                                            name="avatar"
                                            accept="image/jpeg,image/png,image/jpg,image/gif"
                                            onChange={handleAvatarChange}
                                            className="staff-file-input"
                                            style={{ display: 'none' }}
                                        />
                                        <label htmlFor="avatar" className="staff-btn staff-btn-outline">
                                            Choose New Picture
                                        </label>
                                        {avatarFile && (
                                            <small className="text-muted">
                                                Selected: {avatarFile.name}
                                            </small>
                                        )}
                                    </div>
                                    {errors.avatar && (
                                        <div className="text-danger mt-1">
                                            {errors.avatar}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="name" className="staff-form-label">Name</label>
                                <input
                                    type="text"
                                    className="staff-form-control"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="staff-form-label">Email</label>
                                <input
                                    type="email"
                                    className="staff-form-control"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="phone" className="staff-form-label">Phone</label>
                                <input
                                    type="text"
                                    className="staff-form-control"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="staff-form-actions">
                                <button type="submit" className="staff-btn staff-btn-success" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button type="button" className="staff-btn staff-btn-danger" onClick={handleCancelEdit}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {isChangingPassword && (
                    <div className="staff-change-password-section">
                        <h3>Change Password</h3>
                        <form onSubmit={handleChangePassword}>
                            <div className="mb-3">
                                <label htmlFor="current_password" className="staff-form-label">Current Password</label>
                                <input
                                    type="password"
                                    className="staff-form-control"
                                    id="current_password"
                                    name="current_password"
                                    value={passwordData.current_password}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="new_password" className="staff-form-label">New Password</label>
                                <input
                                    type="password"
                                    className="staff-form-control"
                                    id="new_password"
                                    name="new_password"
                                    value={passwordData.new_password}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="new_password_confirmation" className="staff-form-label">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="staff-form-control"
                                    id="new_password_confirmation"
                                    name="new_password_confirmation"
                                    value={passwordData.new_password_confirmation}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className="staff-form-actions">
                                <button type="submit" className="staff-btn staff-btn-success" disabled={loading}>
                                    {loading ? 'Changing...' : 'Change Password'}
                                </button>
                                <button type="button" className="staff-btn staff-btn-danger" onClick={handleCancelPasswordChange}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
            )}
        </div>
    );
};

export default StaffProfile;