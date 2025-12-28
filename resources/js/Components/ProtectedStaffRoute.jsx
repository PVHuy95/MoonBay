import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedStaffRoute = ({ children }) => {
    const { user, isStaff, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Đang tải...</div>;
    }

    if (!user || !isStaff()) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedStaffRoute;