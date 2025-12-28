import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(Cookies.get('auth_token') || '');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Lấy thông tin user và token từ cookie khi component mount
        const storedUser = Cookies.get('user');
        const storedToken = Cookies.get('auth_token');

        if (storedUser && storedToken) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setToken(storedToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

                // Reset thời gian sống của cookie (gia hạn thêm 30 ngày)
                Cookies.set('user', storedUser, { expires: 30 }); // 30 ngày
                Cookies.set('auth_token', storedToken, { expires: 30 }); // 30 ngày
            } catch (error) {
                console.error("Error parsing stored user:", error);
                // Nếu có lỗi, xóa cookie và reset state
                Cookies.remove('user');
                Cookies.remove('auth_token');
                setUser(null);
                setToken('');
                delete axios.defaults.headers.common['Authorization'];
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, authToken) => {
        // Đảm bảo userData có avatar, nếu không thì đặt mặc định
        const user = {
            ...userData,
            avatar: userData.avatar || '/images/Dat/avatar/default.png',
        };
        setUser(user);
        setToken(authToken);

        // Lưu user và token vào cookie với thời gian sống 30 ngày
        Cookies.set('user', JSON.stringify(user), { expires: 30 }); // 30 ngày
        Cookies.set('auth_token', authToken, { expires: 30, path: '/', sameSite: 'lax', secure: false });

        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    };

    const logout = () => {
        setUser(null);
        setToken('');

        // Xóa cookie khi logout
        Cookies.remove('user');
        Cookies.remove('auth_token');

        delete axios.defaults.headers.common['Authorization'];
        console.log('User and token removed from cookie');
    };

    const updateUser = (updatedUser) => {
        if (!updatedUser) {
            throw new Error('Updated user data is undefined');
        }

        setUser((prevUser) => {
            const newUser = {
                ...prevUser,
                ...updatedUser,
                avatar: updatedUser.avatar !== undefined ? (updatedUser.avatar || '/images/Dat/avatar/default.png') : prevUser?.avatar,
            };
            // Cập nhật cookie với giá trị mới nhất
            Cookies.set('user', JSON.stringify(newUser), { expires: 30 });
            return newUser;
        });
    };

    const isAdmin = () => {
        return user && user.role === 'admin';
    };

    const isStaff = () => {
        return user && user.role === 'staff' && user.status === 'active';
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAdmin, isStaff, loading }}>
            {children}
        </AuthContext.Provider>
    );
};