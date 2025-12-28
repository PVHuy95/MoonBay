import React, { useEffect, useState } from 'react';
import '../../css/my_css/Notification.css';

const Notification = ({ message, type = 'success', onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Đặt lại visible thành false khi component mount
        setVisible(false);

        // Đặt visible thành true sau một delay nhỏ để kích hoạt animation
        const timer = setTimeout(() => {
            setVisible(true);
        }, 10);

        // Tự động đóng thông báo sau 3 giây
        const closeTimer = setTimeout(() => {
            setVisible(false);
        }, 3010);

        return () => {
            clearTimeout(timer);
            clearTimeout(closeTimer);
        };
    }, [message, type]); // Thêm message và type vào dependency để useEffect chạy lại khi thông báo thay đổi

    useEffect(() => {
        if (!visible) {
            const timer = setTimeout(() => {
                onClose();
            }, 300); // Chờ animation kết thúc (0.3s)
            return () => clearTimeout(timer);
        }
    }, [visible, onClose]);

    return (
        <div className={`notification ${type} ${visible ? 'show' : 'hide'}`}>
            <i className={`icon fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            <span>{message}</span>
            <button className="close-btn" onClick={() => setVisible(false)}>
                ×
            </button>
        </div>
    );
};

export default Notification;