import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/my_css/login.css';
import { AuthContext } from './AuthContext.jsx';
import Cookies from 'js-cookie';

const Login = ({ isPopupLogin, closePopup, openRegisterPopup, openForgotPassword }) => {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState(''); 
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { login, setUser } = useContext(AuthContext); 
    const navigate = useNavigate();

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("popup-overlay")) {
            closePopup();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let isValid = true;
        const newErrors = {};

        if (!email) {
            isValid = false;
            newErrors.email = "Email is required.";
            setTimeout(() => {
                setErrors((prevErrors) => {
                    const { email, ...rest } = prevErrors;
                    return rest;
                });
            }, 3000); // Thời gian đóng thông báo sau 3 giây
        }

        if (!password) {
            isValid = false;
            newErrors.password = "Password is required.";
            setTimeout(() => {
                setErrors((prevErrors) => {
                    const { password, ...rest } = prevErrors;
                    return rest;
                });
            }, 3000); // Thời gian đóng thông báo sau 3 giây
        }

        setErrors(newErrors);

        if (!isValid) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const response = await axios.post("/api/login", {
                email,
                password,
            });

            if (response.status === 200) {
                const { user, token } = response.data;
                if (!user || !user.id) {
                    throw new Error("User data is incomplete: missing user");
                }
                if (!token) {
                    throw new Error("Token not found in response");
                }
                login(user, token);
                window.showNotification("Login successfully!", "success");
                closePopup();
            } else {
                throw new Error("Unexpected response status: " + response.message);
            }
        } catch (error) {
            console.log("Login error:", error);
            setErrors((prevErrors) => ({
                ...prevErrors,
                general: "Email or password is incorrect.",
            }));
            setTimeout(() => {
                setErrors((prevErrors) => {
                    const { general, ...rest } = prevErrors;
                    return rest;
                });
            }, 3000); // Thời gian đóng thông báo sau 3 giây
        } finally {
            setLoading(false);
        }
    };
    // Xử lý query string từ redirect Google
    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/google/login');
            if (response.status === 200 && response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error('Google login error:', error.response || error);
            console.error('Failed to initiate Google login:' + (error.response?.data?.message || error.message), error);
            window.showNotification('Failed to initiate Google login: ', 'error');
        }
    };

    return (
        <>
            {isPopupLogin && (
                <div className="popup-overlay" onClick={handleOverlayClick}>
                    <div className="popup-content">
                        <button className="close-popup-btn" style={{ color: 'black' }} onClick={closePopup}>&times;</button>
                        <h2>Login</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="input-container">
                                <input
                                    type="email"
                                    id='email'
                                    className="form-input"
                                    placeholder=" "
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                                <label className="form-input-label">Email</label>
                            </div>
                            {errors.email && <div className="error-message">{errors.email}</div>}
                            <div className="input-container">
                                <input
                                    type="password"
                                    id='password'
                                    disabled={loading}
                                    className="form-input"
                                    placeholder=" "
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <label className="form-input-label">Password</label>
                            </div>
                            {errors.password && <div className="error-message">{errors.password}</div>}
                            {errors.general && <div className="error-message">{errors.general}</div>}
                            <div className="switch-to-register">
                                <p onClick={openForgotPassword}><Link >ForgotPassword</Link></p>
                                <p>
                                    Don't have an account?{" "}
                                    <Link onClick={openRegisterPopup}>Register</Link>
                                </p>
                            </div>
                            <button
                                type="submit" className="btn btn-primary w-100"
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        <hr />

                        <div className="social-login">
                            <button onClick={handleGoogleLogin} className="google-login-btn">Sign in with Google</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Login;