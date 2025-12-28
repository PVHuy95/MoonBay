import React, { useEffect, useState } from "react";

const formatCurrency = (amount) => {
  if (typeof amount !== 'number') amount = Number(amount);
  const amountInDong = amount < 10000 ? amount * 1000 : amount;
  return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
  }).format(amountInDong);
};

const QRPayment = ({ amount, onClose, onConfirm, isDeposit }) => {
  const [isClosing, setIsClosing] = useState(false);
  const safeAmount = (amount) => {
    if (typeof amount !== 'number') amount = Number(amount);
    return amount < 10000 ? amount * 1000 : amount;
  };

  console.log("QRPayment props:", { amount, onClose, onConfirm, isDeposit });

  const qrAmount = safeAmount(amount);
  const qrURL = `https://img.vietqr.io/image/MB-9567899995-compact2.png?amount=${qrAmount}&addInfo=${isDeposit ? 'Deposit%20for%20room%20booking' : 'Payment%20for%20room%20booking'}&accountName=HotelBookingVN`;

  const handleConfirm = (e) => {
    e.preventDefault();
    setIsClosing(true);
    onConfirm();
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const autoConfirmPayment = () => {
    setIsClosing(true);
    onConfirm(); // Gọi xác nhận thanh toán
    setTimeout(() => {
      onClose(); // Đóng popup QR code sau khi tự động xác nhận
    }, 500);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      autoConfirmPayment();
    }, 5000); // Tự động xác nhận thanh toán sau 5 giây
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h4>Scan QR Code to {isDeposit ? 'Pay Deposit' : 'Pay Full Amount'}</h4>
        <p><strong>{isDeposit ? 'Deposit Amount (20%)' : 'Total Amount'}:</strong> {formatCurrency(amount)}</p>
        <img src={qrURL} alt="QR Code" width="300" />
        <p className="mt-2">Transfer Note: <b>{isDeposit ? 'Deposit for room booking' : 'Payment for room booking'}</b></p>
        <div className="mt-3 d-flex justify-content-between">
          <button className="btn btn-success" onClick={handleConfirm} disabled={isClosing}>I Have Transferred</button>
          <button className="btn btn-secondary" onClick={handleClose} disabled={isClosing}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default QRPayment;