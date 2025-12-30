import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../../css/PaymentConfirm.css';
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
};
const PaymentConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  useEffect(() => {
    const data = searchParams.get('data');
    if (!data) {
      alert('Invalid payment link', 'error');
      return;
    }
    try {
      const parsed = JSON.parse(decodeURIComponent(data));
      setPaymentData(parsed);
      setLoading(false);
    } catch (error) {
      console.error('Error parsing payment data:', error);
      alert('Invalid payment data', 'error');
    }
  }, [searchParams]);
  const handleConfirm = async () => {
    if (!paymentData) return;
    setProcessing(true);
    const { error } = await supabase
      .from('payment_sessions')
      .update({
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentData.payment_id);
    if (error) {
      console.error('Error confirming payment:', error);
      alert('Failed to confirm payment');
      setProcessing(false);
    } else {
      setResult('confirmed');
      alert('Payment confirmed successfully!');
    }
  };
  const handleReject = async () => {
    if (!paymentData) return;
    setProcessing(true);
    const { error } = await supabase
      .from('payment_sessions')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentData.payment_id);
    if (error) {
      console.error('Error rejecting payment:', error);
      alert('Failed to reject payment');
      setProcessing(false);
    } else {
      setResult('rejected');
      alert('Payment rejected');
    }
  };
  if (loading) {
    return (
      <div className="payment-confirm-container">
        <div className="spinner"></div>
        <p>Loading payment details...</p>
      </div>
    );
  }
  if (!paymentData) {
    return (
      <div className="payment-confirm-container">
        <h2>Invalid Payment</h2>
        <p>Unable to load payment information</p>
      </div>
    );
  }
  return (
    <div className="payment-confirm-container">
      <div className="payment-card">
        <h1>Payment Confirmation</h1>

        <div className="payment-details">
          <div className="detail-row">
            <span className="label">Amount:</span>
            <span className="value">{formatCurrency(paymentData.amount)}</span>
          </div>

          <div className="detail-row">
            <span className="label">Type:</span>
            <span className="value">{paymentData.is_deposit ? 'Deposit (20%)' : 'Full Payment'}</span>
          </div>

          <div className="detail-row">
            <span className="label">Payment ID:</span>
            <span className="value small">{paymentData.payment_id}</span>
          </div>
        </div>
        <div className="actions">
          {!result ? (
            // Chưa có kết quả → Hiển thị buttons
            <>
              <button
                className="btn btn-confirm"
                onClick={handleConfirm}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Confirm Payment'}
              </button>

              <button
                className="btn btn-reject"
                onClick={handleReject}
                disabled={processing}
              >
                Reject
              </button>
            </>
          ) : (
            // Đã có kết quả → Hiển thị status
            <div className={`result-message ${result}`}>
              {result === 'confirmed' ? (
                <>
                  <h2>✅ Payment Confirmed</h2>
                  <p>The payment has been successfully confirmed.</p>
                </>
              ) : (
                <>
                  <h2>❌ Payment Rejected</h2>
                  <p>The payment has been rejected.</p>
                </>
              )}
            </div>
          )}
        </div>
        <p className="note">
          Please confirm if you have completed the payment
        </p>
      </div>
    </div>
  );
};
export default PaymentConfirm;