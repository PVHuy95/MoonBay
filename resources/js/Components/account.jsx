import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import axios, { isCancel } from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/my_css/account.css';
import Banner from './banner';
import UserReviewsAndComplaints from './UserReviewsAndComplaints.jsx';

const Account = () => {
    const { user, token, updateUser } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
    const [latestBooking, setLatestBooking] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null); // Thêm dòng này
    const [avatarPreview, setAvatarPreview] = useState(null); // Thêm dòng này

    // Function to format date to DD/MM/YYYY
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Function to format number with commas
    const formatNumber = (number) => {
        return Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        if (user === null) {
            return;
        }

        if (!user || !user.id) {
            setError('Please log in to view your information.');
            setLoading(false);
            return;
        }

        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
        });

        setLoading(false);
    }, [user]);

    // Fetch bookings when the component mounts or when user or token changes
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                if (!user || !user.id || !token) return;
                const response = await axios.get(`/api/users/${user.id}/bookings`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const sortedBookings = response.data.bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                const groupedBookings = Object.values(
                    sortedBookings.reduce((acc, booking) => {
                        const key = `${booking.room_type}|${booking.children}|${booking.member}|${booking.checkin_date}|${booking.checkout_date}|${booking.total_price}`;
                        if (!acc[key]) {
                            acc[key] = {
                                ...booking,
                                number_of_rooms: booking.number_of_rooms,
                                original_ids: [booking.id], // Lưu danh sách ID
                            };
                        } else {
                            acc[key].number_of_rooms += booking.number_of_rooms;
                            acc[key].original_ids.push(booking.id);
                        }
                        return acc;
                    }, {})
                );

                setBookings(groupedBookings);
                setLatestBooking(groupedBookings[0] || null);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching bookings:', err.response || err.message);
                setError('Failed to load bookings. Please try again.');
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user, token]);

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
        const maxSize = 2 * 1024 * 1024;

        if (file) {

            // Kiểm tra dung lượng file
            if (file.size > maxSize) {
                window.showNotification('Image file exceeds the 2MB limit. Please choose a smaller image!', 'error');
                setAvatarFile(null);
                setAvatarPreview(null);
                e.target.value = ''; // Xóa file đã chọn trong input
                return;
            }

            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.get('/sanctum/csrf-cookie');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);
            if (avatarFile) {
                formDataToSend.append('avatar', avatarFile);
            }
            formDataToSend.append('_method', 'PUT');

            const response = await axios.post(`/api/users/${user.id}`, formDataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            updateUser(response.data.user); // Cập nhật user trong context
            setIsEditing(false);
            setAvatarFile(null);
            setAvatarPreview(null);
            if(isLocalAccount){
                window.showNotification('Profile updated successfully and logged in again to load new avarta!', 'success');
            } else {
                window.showNotification('Profile updated successfully!', 'success');
            }
        } catch (err) {
            console.error('Error updating profile:', err.response?.data || err.message);
            window.showNotification('Failed to update profile: ' + (err.response?.data?.message || err.message), 'error');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            window.showNotification('New password and confirmation do not match.', 'error');
            return;
        }

        try {
            await axios.get('/sanctum/csrf-cookie', {
                withCredentials: true,
            });

            const response = await axios.post(
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
            window.showNotification('Password changed successfully!', 'success');
        } catch (err) {
            console.error('Error changing password:', err.response?.data || err.message);
            window.showNotification('Failed to change password', 'error');
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
        });
        setAvatarFile(null); // Thêm dòng này
        setAvatarPreview(null); // Thêm dòng này
    };

    const handleCancelPasswordChange = () => {
        setIsChangingPassword(false);
        setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
    };

    const handleCancelBooking = async (id) => {
        console.log(`Canceling booking with ID: ${id}`);
        const isCancelBook = window.confirm('Are you sure you want to cancel this booking? If you confirm, you will lose your deposit or call hotline now.');
        if (isCancelBook) {
            try {
                const booking = bookings.find((b) => b.original_ids.includes(id)); // Tìm booking dựa trên original_ids
                if (!booking) {
                    window.showNotification('Booking not found.', 'error');
                    return;
                }

                const checkinDate = new Date(booking.checkin_date);
                const now = new Date();

                if (now >= checkinDate) {
                    window.showNotification('Cannot cancel booking after check-in date.', 'error');
                    return;
                }

                const cancelPromises = booking.original_ids.map((bid) =>
                    axios.delete(`/api/bookings/${bid}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
                );

                await Promise.all(cancelPromises);

                setBookings(bookings.filter((b) => !b.original_ids.includes(id))); // Loại bỏ nhóm đã hủy
                window.showNotification('Booking cancelled successfully!', 'success');
            } catch (err) {
                console.error('Error cancelling booking:', err.response?.data || err.message);
                window.showNotification(err.response?.data?.message || 'Failed to cancel booking', 'error');
            }
        }
    };

    if (loading) return <div className="container_account"><p className="text-center text-black mt-5">Loading...</p></div>;
    if (error) return <div className="container_account"><p className="text-center text-black mt-5">{error}</p></div>;

    const isLocalAccount = user.provider !== 'google';

    return (
        <>
            <Banner title="Information Account" />
            <div className="container_account">
                <div className="card">
                    <div className="account-wrapper">
                        <div className="account-left">
                            {isLocalAccount && isEditing ? (
                                <>
                                    <img
                                        src={avatarPreview || `/storage/${user.avatar}`}
                                        alt="Avatar Preview"
                                        className="rounded-circle account-avatar"
                                        key={Date.now()}
                                        onError={(e) => {
                                            e.target.src = '/images/Dat/avatar/default.png';
                                        }}
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="form-control mt-2"
                                        id="avatar-input"
                                    />
                                </>
                            ) : (
                                <img
                                    // src={user.avatar || '/images/Dat/avatar/default.png'} // Không thêm tiền tố /storage/
                                    src={isLocalAccount ? `/storage/${user.avatar}` : user.avatar}
                                    alt="Avatar"
                                    className="rounded-circle account-avatar"
                                    onError={(e) => {
                                        e.target.src = '/images/Dat/avatar/default.png';
                                    }}
                                />
                            )}
                            <h2 className="account-name">{user.name || 'Unknown User'}</h2>
                        </div>
                        <div className="account-right">
                            <h1 className="text-center mb-4">Account</h1>
                            {isEditing ? (
                                <form className="edit-form" onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">Name:</label>
                                        <input type="text" id="name" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email:</label>
                                        <input type="email" id="email" name="email" className="form-control" value={formData.email} onChange={handleChange} disabled={user.provider === 'google'} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="phone" className="form-label">Phone:</label>
                                        <input type="text" id="phone" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Save</button>
                                    <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                                </form>
                            ) : isChangingPassword ? (
                                <form className="edit-form" onSubmit={handleChangePassword}>
                                    <div className="mb-3">
                                        <label htmlFor="current_password" className="form-label">Current Password:</label>
                                        <input type="password" id="current_password" name="current_password" className="form-control" value={passwordData.current_password} onChange={handlePasswordChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="new_password" className="form-label">New Password:</label>
                                        <input type="password" id="new_password" name="new_password" className="form-control" value={passwordData.new_password} onChange={handlePasswordChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="new_password_confirmation" className="form-label">Confirm New Password:</label>
                                        <input type="password" id="new_password_confirmation" name="new_password_confirmation" className="form-control" value={passwordData.new_password_confirmation} onChange={handlePasswordChange} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Change Password</button>
                                    <button type="button" className="btn btn-secondary" onClick={handleCancelPasswordChange}>Cancel</button>
                                </form>
                            ) : (
                                <div className="user-info-card shadow-sm mb-4">
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div className="user-details">
                                            <h5 className="card-title mb-3">User Information</h5>
                                            <div className="info-row">
                                                <span className="info">
                                                    <strong>Email:</strong> <span className="text-muted">{user.email}</span>
                                                </span>
                                                <span className="info">
                                                    <strong>Phone:</strong> <span className="text-muted">{user.phone}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <button className="btn btn-primary btn-sm me-2" onClick={() => setIsEditing(true)}>
                                                Edit Profile
                                            </button>
                                            {isLocalAccount && (
                                                <button className="btn btn-secondary btn-sm" onClick={() => setIsChangingPassword(true)}>
                                                    Change Password
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <h2 className="mt-3 mb-3">Your Bookings</h2>
                            {bookings.length > 0 ? (
                                <div className="bookings-container">
                                    {bookings.map((booking) => {
                                        const checkinDate = new Date(booking.checkin_date);
                                        const now = new Date();
                                        const canCancel = checkinDate > now;
                                        return (
                                            <div key={booking.id} className="cards card-wrapper mb-3 shadow-sm">
                                                <div className="card-body">
                                                    <h5 className="card-title text-center">{booking.room_type}</h5>
                                                    <div className="card-text">
                                                        <div className="info-row">
                                                            <span className="info-item">
                                                                <strong>Check-in:</strong> <span className="text-muted">{formatDate(booking.checkin_date)}</span>
                                                            </span>
                                                            <span className="info-item">
                                                                <strong>Check-out:</strong> <span className="text-muted">{formatDate(booking.checkout_date)}</span>
                                                            </span>
                                                            <span className="info-item">
                                                                <strong>Number of rooms:</strong> <span className="text-muted">{booking.number_of_rooms}</span>
                                                            </span>
                                                        </div>
                                                        <div className="info-row">
                                                            <span className="info-item">
                                                                <strong>Children Ages:</strong> <span className="text-muted">{booking.children}</span>
                                                            </span>
                                                            <span className="info-item">
                                                                <strong>Member:</strong> <span className="text-muted">{booking.member}</span>
                                                            </span>
                                                        </div>
                                                        <div className="info-row">
                                                            <span className="info-item">
                                                                <strong>Days:</strong> <span className="text-muted">{Math.ceil(Math.abs(new Date(booking.checkout_date) - new Date(booking.checkin_date)) / (1000 * 60 * 60 * 24))}</span>
                                                            </span>
                                                            <span className='info-item'>
                                                                <strong>Price:</strong> <span className="text-muted">{formatNumber(booking.price)} VNĐ/night</span>
                                                            </span>
                                                            <span className="info-item">
                                                                <strong>Deposit:</strong> <span className="text-muted">{formatNumber(parseFloat(booking.total_price) * 0.2)} VNĐ % of total price</span>
                                                            </span>
                                                        </div>
                                                        <div className="info-row">
                                                            <span className="info-item">
                                                                <strong>Total Cost:</strong> <span className="text-muted">{formatNumber(booking.total_price)} VNĐ</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {canCancel && (
                                                        <button
                                                            className="btn btn-danger btn-sm mt-3"
                                                            onClick={() => handleCancelBooking(booking.id)}
                                                        >
                                                            Cancel Booking
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-center">No bookings found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <UserReviewsAndComplaints />
        </>
    );
};

export default Account;
