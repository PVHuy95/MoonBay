// PopUp_deposit.jsx
import React, { useState } from 'react';
import '../../css/my_css/PopupDeposit.css';

const PopUp_deposit = ({ onConfirm, onClose }) => {
    const [isConfirmed, setIsConfirmed] = useState(false);

    return (
        <div className="popup-overlay">
            <div className="popup-deposit">
                <h3 className="popup-title">MoonBay Hotel</h3>
                <div className="policy-section">
                    <h5>General Hotel Policies</h5>
                    <ul>
                        <li><strong>Check-in/Check-out:</strong> Check-in from 14:00, Check-out before 12:00. Early check-in (from 12:00) or late check-out (until 14:00) is subject to availability and may incur an additional fee of $20-$50 depending on the time.</li>
                        <li><strong>No Smoking:</strong> Smoking is strictly prohibited in all rooms and public areas. A cleaning fee of $100 will be charged for violations, and guests may face immediate eviction without refund.</li>
                        <li><strong>Pets:</strong> Pets are not allowed unless they are registered service animals with prior written notice. A pet cleaning fee of $50 may apply if approval is granted.</li>
                        <li><strong>Visitor Policy:</strong> External visitors are not permitted in guest rooms after 22:00 without prior approval from hotel management.</li>
                        <li><strong>Safety:</strong> Guests are required to follow all safety protocols, including evacuation procedures during emergencies. Tampering with fire alarms or safety equipment will result in a $200 fine.</li>
                    </ul>
                </div>
                <div className="policy-section">
                    <h5>Deposit Policy</h5>
                    <ul>
                        <li><strong>Deposit Amount:</strong> A 20% deposit of the total booking cost is required at the time of booking.</li>
                        <li><strong>Payment Method:</strong> Deposits must be paid via credit/debit card or bank transfer. Cash payments are not accepted for deposits.</li>
                        <li><strong>Non-Refundable Cases:</strong> The deposit is non-refundable in case of no-show or cancellation within 48 hours before check-in.</li>
                    </ul>
                </div>
                <div className="policy-section">
                    <h5>Cancellation Policy</h5>
                    <ul>
                        <li><strong>Free Cancellation:</strong> Cancellations made more than 48 hours before the check-in date will receive a full refund of the deposit, minus a $10 processing fee.</li>
                        <li><strong>Modification:</strong> Changes to the booking (e.g., dates, room type) are subject to availability and may incur additional charges.</li>
                    </ul>
                </div>
                <div className="policy-section">
                    <h5>Additional Information</h5>
                    <ul>
                        <li><strong>Identification:</strong> All guests must present a valid government-issued ID (passport, driver’s license) upon check-in.</li>
                        <li><strong>Children Policy:</strong> Children under 12 years stay free when sharing a room with parents, using existing bedding.</li>
                        <li><strong>Damage Policy:</strong> Guests are liable for any damage caused to hotel property. Repair/replacement costs will be charged to the guest’s account.</li>
                    </ul>
                </div>
                <div className="form-check mt-4">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="confirmPolicy"
                        checked={isConfirmed}
                        onChange={(e) => setIsConfirmed(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="confirmPolicy">
                        I have read and agree to the above policies
                    </label>
                </div>
                <div className="mt-4 d-flex justify-content-between">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => onConfirm(isConfirmed)}
                        disabled={!isConfirmed}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PopUp_deposit;