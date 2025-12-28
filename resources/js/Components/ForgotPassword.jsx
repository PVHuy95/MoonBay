import React, { useState, useEffect } from "react";
import axios from 'axios';
import '../../css/my_css/ForgotPassword.css'

const ForgotPassword = ({ isPopupForgotPassword, closePopup, openLoginPopup }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("popup-overlay")) {
            closePopup();
        }
    };

    // Xóa thông báo sau 5 giây
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 5000);
            return () => clearTimeout(timer); // Cleanup timer khi component unmount
        }
    }, [message]);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        console.log("Email input:", email);
        setLoading(true);
        setMessage('');
        try {
            const response = await axios.post('/api/ForgotPassword', { email }, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest', // Để Laravel nhận diện request AJAX
                },
            });

            if (response.status === 200) {
                setMessage(response.data.message || 'Reset link sent to your email.');
            }
        } catch (error) {
            console.error("Forgot Password error:", error.response || error);
            let errorMsg = 'An error occurred.';
            if (error.response?.status === 422) {
                // Kiểm tra lỗi cụ thể từ backend
                if (error.response.data.errors?.email) {
                    // Nếu backend trả về lỗi liên quan đến email (ví dụ: "We can't find a user with that email address.")
                    errorMsg = error.response.data.errors.email[0] || 'Email does not exist';
                } else if (error.response.data.message?.toLowerCase().includes('email')) {
                    // Nếu message chứa từ "email", giả định là email không tồn tại
                    errorMsg = 'Email does not exist';
                }
            }
            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            {isPopupForgotPassword && (
                <div className="popup-overlay" onClick={handleOverlayClick}>
                    <div className="popup-content">
                        <button className="close-popup-btn" onClick={closePopup}>
                            ×
                        </button>
                        <h2>Forgot Password</h2>
                        <form onSubmit={handleForgotPassword}>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                            {message && <p>{message}</p>}
                        </form>
                        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={openLoginPopup}>Back to Login</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ForgotPassword;