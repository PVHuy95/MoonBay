// Components/ProtectedAdminRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedAdminRoute = ({ children }) => {
    const { user, isAdmin, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Đang tải...</div>; // Hiển thị khi đang kiểm tra trạng thái đăng nhập
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (!isAdmin()) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedAdminRoute;