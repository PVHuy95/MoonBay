import React, { useState, useEffect } from 'react';
import Notification from './Notification';

const NotificationManager = () => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (message, type = 'success', duration = 3000) => {
        const id = Date.now();
        // Kiểm tra nếu đã có thông báo với cùng message và type, chỉ cập nhật nếu cần
        const existingNotification = notifications.find((notif) => notif.message === message && notif.type === type);
        if (!existingNotification) {
            setNotifications((prev) => [...prev, { id, message, type }]);
            // Tự động xóa sau duration
            setTimeout(() => removeNotification(id), duration);
        }
    };

    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    };

    useEffect(() => {
        window.showNotification = addNotification;
    }, []);

    return (
        <div className="notification-container">
            {notifications.map((notif, index) => (
                <div key={notif.id} style={{ animationDelay: `${index * 100}ms` }}>
                    <Notification
                        message={notif.message}
                        type={notif.type}
                        onClose={() => removeNotification(notif.id)}
                    />
                </div>
            ))}
        </div>
    );
};

export default NotificationManager;