import React, { useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom"; // Để lấy token và email từ URL
import '../../css/my_css/ResetPassword.css';

const ResetPassword = ({ openLoginPopup }) => {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)[A-Za-z\d\W]{8,16}$/;

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(''); // Xóa thông báo cũ

        if (password !== confirmPassword) {
            setMessage('❌ Passwords do not match.');
            setTimeout(() => setMessage(''), 3000);
            setLoading(false);
            return;
        }

        if (!passwordRegex.test(password)) {
            setMessage('❌ Password must be 8-16 characters and include uppercase, lowercase, number, and special character.');
            setTimeout(() => setMessage(''), 3000);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('/api/reset-password', {
                token,
                email,
                password,
                password_confirmation: confirmPassword,
            }, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest', // Nhận diện request AJAX
                },
            });

            if (response.status === 200) {
                setMessage('✅ Password has been reset successfully. Redirecting to login...');
                setTimeout(() => {
                    openLoginPopup();
                    window.location.href = '/';
                }, 2000); // Thay đổi thời gian chờ nếu cần
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'An error occurred while resetting password.';
            console.error("Reset Password error:", error.response || error);
            setMessage(`❌ ${errorMsg}`);
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleBackHome = () => {
        window.location.href = '/';
    }

    const validatePasswordRules = (pw) => ({
        length: pw.length >= 8 && pw.length <= 16,
        uppercase: /[A-Z]/.test(pw),
        lowercase: /[a-z]/.test(pw),
        number: /\d/.test(pw),
        specialChar: /\W/.test(pw)
    });

    const passwordRules = validatePasswordRules(password);


    return (
        <div className="resetPass-page">
            <header className="resetPass-header">
                <h1>🔐 Reset Your Password</h1>
            </header>
            <main className="resetPass-main">
                <form onSubmit={handleResetPassword} className="resetPass-form">
                    <input
                        type="email"
                        className="form-input"
                        placeholder="✉️ Enter your email"
                        value={email || ''}
                    />
                    <input
                        type="password"
                        className="form-input"
                        placeholder="🔑 New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="form-input"
                        placeholder="🔑 Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <ul className="password-checklist">
                        <li className={passwordRules.length ? 'valid' : 'invalid'}>
                            {passwordRules.length ? '✔' : '❌'} 8–16 characters
                        </li>
                        <li className={passwordRules.uppercase ? 'valid' : 'invalid'}>
                            {passwordRules.uppercase ? '✔' : '❌'} At least one uppercase letter
                        </li>
                        <li className={passwordRules.lowercase ? 'valid' : 'invalid'}>
                            {passwordRules.lowercase ? '✔' : '❌'} At least one lowercase letter
                        </li>
                        <li className={passwordRules.number ? 'valid' : 'invalid'}>
                            {passwordRules.number ? '✔' : '❌'} At least one number
                        </li>
                        <li className={passwordRules.specialChar ? 'valid' : 'invalid'}>
                            {passwordRules.specialChar ? '✔' : '❌'} At least one special character
                        </li>
                    </ul>

                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? '🔄 Resetting...' : '🔐 Reset Password'}
                    </button>
                    {message && <p className={`message ${message.includes('success') ? 'success-message' : 'error-message'}`}>{message}</p>}
                    <button className="btn-back" onClick={handleBackHome}>⬅ Back to Login</button>
                </form>

            </main>
        </div>
    );
};

export default ResetPassword;