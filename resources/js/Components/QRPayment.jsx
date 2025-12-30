import React, { useEffect, useState, useContext } from "react";
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import dayjs from 'dayjs';
import { AuthContext } from './AuthContext.jsx';

const formatCurrency = (amount) => {
  if (typeof amount !== 'number') amount = Number(amount);
  const amountInDong = amount < 10000 ? amount * 1000 : amount;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amountInDong);
};
const QRPayment = ({ amount, onClose, onConfirm, isDeposit, user, bookingData }) => {
  const { token } = useContext(AuthContext);
  const [isClosing, setIsClosing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [paymentId, setPaymentId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút = 300 giây
  const safeAmount = (amount) => {
    if (typeof amount !== 'number') amount = Number(amount);
    return amount < 10000 ? amount * 1000 : amount;
  };
  // Tạo payment session khi mount
  useEffect(() => {
    const createPaymentSession = async () => {
      const sessionId = uuidv4();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút
      const { data, error } = await supabase
        .from('payment_sessions')
        .insert({
          id: sessionId,
          amount: safeAmount(amount),
          is_deposit: isDeposit,
          status: 'pending',
          user_id: user.id,
          user_name: user.name,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();
      if (error) {
        console.error('Error creating payment session:', error);
        window.showNotification('Failed to create payment session', 'error');
        onClose();
      } else {
        setPaymentId(sessionId);
        console.log('Payment session created:', data);
      }
    };
    createPaymentSession();
  }, []);
  // Real-time listener cho payment status
  useEffect(() => {
    if (!paymentId) return;
    const channel = supabase
      .channel(`payment:${paymentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_sessions',
          filter: `id=eq.${paymentId}`,
        },
        (payload) => {
          console.log('Payment status changed:', payload.new.status);
          setPaymentStatus(payload.new.status);
          if (payload.new.status === 'confirmed') {
            window.showNotification('Payment confirmed!', 'success');

            // Tạo booking trong database
            createBooking().then((success) => {
              if (success) {
                window.showNotification('Booking created successfully!', 'success');
                setTimeout(() => {
                  if (onConfirm) onConfirm();  // Callback từ parent (nếu có)
                  onClose();  // Đóng popup
                }, 1500);
              } else {
                window.showNotification('Booking creation failed', 'error');
                setTimeout(() => {
                  onClose();
                }, 1500);
              }
            });
          } else if (payload.new.status === 'rejected') {
            window.showNotification('Payment rejected', 'error');
            setTimeout(() => {
              onClose();
            }, 1000);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [paymentId]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      window.showNotification('Payment session expired', 'error');
      onClose();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);
  const qrAmount = safeAmount(amount);
  const qrData = JSON.stringify({
    payment_id: paymentId,
    amount: qrAmount,
    is_deposit: isDeposit,
  });

  // URL cho mobile app
  const mobileURL = `${window.location.origin}/payment-confirm?data=${encodeURIComponent(qrData)}`;
  // const baseURL = window.location.hostname === 'localhost'
  //   ? 'http://192.168.1.7:8000'  // ← ĐỔI THÀNH IP LAPTOP CỦA BẠN
  //   : window.location.origin;
// const mobileURL = `${baseURL}/payment-confirm?data=${encodeURIComponent(qrData)}`;

  // QR Code URL (sử dụng API QR generator)
  const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(mobileURL)}`;
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const createBooking = async () => {
    try {
      if (!token) {
        console.error('❌ No token found');
        return false;
      }

      // Bước 1: Tạo booking
      const bookingResponse = await axios.post('/api/booking', bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (bookingResponse.status !== 201) {
        console.error('❌ Booking creation failed');
        return false;
      }
      console.log('✅ Booking created:', bookingResponse.data);
      // Bước 2: Gửi email
      try {
        const emailData = {
          to: user.email,
          user_name: user.name,
          room_type: bookingData.room_type,
          number_of_rooms: bookingData.number_of_rooms,
          checkin_date: dayjs(bookingData.checkin_date).format('YYYY-MM-DD'),
          checkout_date: dayjs(bookingData.checkout_date).format('YYYY-MM-DD'),
          total_price: bookingData.total_price.toString(),
          deposit_paid: bookingData.deposit_paid.toString(),
          remaining_amount: isDeposit ? (bookingData.total_price * 0.8).toString() : '0',
          payment_status: isDeposit ? 'Deposit Paid (20%)' : 'Fully Paid',
          member: bookingData.member,
          children: bookingData.children,
        };
        await axios.post('/api/Send_booking_email_successfully', emailData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Email sent');
      } catch (emailError) {
        console.warn('⚠️ Email failed (not critical):', emailError);
      }
      // Xóa localStorage
      localStorage.removeItem('pendingBooking');
      return true;
    } catch (error) {
      console.error('❌ Error in createBooking:', error.response?.data || error);
      return false;
    }
  };
  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h4>Scan QR Code to {isDeposit ? 'Pay Deposit' : 'Pay Full Amount'}</h4>
        <p><strong>{isDeposit ? 'Deposit Amount (20%)' : 'Total Amount'}:</strong> {formatCurrency(amount)}</p>

        {/* QR Code */}
        <img src={qrURL} alt="QR Code" width="300" />

        {/* Countdown */}
        <p className="mt-2 text-warning">
          <strong>Time remaining: {formatTime(timeLeft)}</strong>
        </p>

        {/* Status */}
        <p className="mt-2">
          Status: <span className={`badge bg-${paymentStatus === 'pending' ? 'warning' : paymentStatus === 'confirmed' ? 'success' : 'danger'}`}>
            {paymentStatus.toUpperCase()}
          </span>
        </p>

        <p className="text-muted small">Scan QR code with your phone to confirm payment</p>

        <div className="mt-3">
          <button className="btn btn-secondary w-100" onClick={handleClose} disabled={isClosing}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
export default QRPayment;