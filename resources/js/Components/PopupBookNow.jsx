import React, { useState, useEffect, useContext, useCallback } from "react";
import '../../css/my_css/PopupBookNow.css';
import { AuthContext } from "./AuthContext.jsx";
import axios from "axios";
import PopUp_deposit from "./PopUp_deposit.jsx";
import debounce from 'lodash/debounce';
import PriceHolidayTet from "./PriceHolidayTet.jsx";
import dayjs from 'dayjs';
import QRPayment from "./QRPayment.jsx";

const formatCurrency = (amount) => {
    if (typeof amount !== 'number') amount = Number(amount);

    // Nếu giá nhỏ hơn 10.000 thì giả định là "nghìn đồng" (ví dụ: 500 = 500k)
    const amountInDong = amount < 10000 ? amount * 1000 : amount;

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0, // VND không có số lẻ
    }).format(amountInDong);
};

const PopupBookNow = ({ closePopup, isPopupBookNow, selectedRoomName }) => {
    const { user } = useContext(AuthContext);
    const [roomTypes, setRoomTypes] = useState([]);
    const [selectedRoomPrice, setSelectedRoomPrice] = useState(0);
    const [rooms, setRooms] = useState([]);
    const [formData, setFormData] = useState({
        checkin: '',
        checkout: '',
        roomType: '',
        room: 1,
        children: 0,
        member: 1,
        price: '0',
        total_price: '0',
    });
    const [isPopUp_deposit, setIsPopUp_deposit] = useState(false);
    const [priceNotification, setPriceNotification] = useState('');
    const [paymentOption, setPaymentOption] = useState('deposit'); // New state for payment option: 'deposit' or 'full'
    const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
    const [bookingAmount, setBookingAmount] = useState(0);
    const safeAmount = (amount) => {
        if (typeof amount !== 'number') amount = Number(amount);
        return amount < 10000 ? amount * 1000 : amount;
    };

    const CalculatorDays = (checkin, checkout) => {
        return Math.ceil(Math.abs(new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
    }

    const calculateExactTotalPrice = (basePrice, checkin, checkout) => {
        if (!checkin || !checkout || !dayjs(checkin).isValid() || !dayjs(checkout).isValid()) return 0;

        const startDate = dayjs(checkin);
        const endDate = dayjs(checkout);
        let total = 0;

        for (let date = startDate; date.isBefore(endDate); date = date.add(1, 'day')) {
            const adjusted = PriceHolidayTet(basePrice, date.format('YYYY-MM-DD')) || basePrice;
            total += adjusted;
        }
        return total;
    };

    const Total_price = (basePrice, room, checkin, checkout) => {
        const totalPerRoom = calculateExactTotalPrice(basePrice, checkin, checkout);
        return totalPerRoom * parseInt(room);
    };

    const maxCapacity = roomTypes.length > 0
        ? roomTypes.find(rt => rt.name === formData.roomType)?.capacity || 0
        : 0;
    const Maxmember = () => formData.room * maxCapacity;
    const MaxChildren = () => formData.room * 2;

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const [response, roomsRes] = await Promise.all([
                    axios.get('/api/room_types'),
                    axios.get('/api/rooms')
                ]);

                const roomData = Array.isArray(response.data) ? response.data :
                    response.data.data || [];

                setRoomTypes(roomData);
                setRooms(roomsRes.data || []);
            } catch (error) {
                console.error("Failed to fetch room types:", error);
                window.showNotification("Error loading room types", "error");
            }
        };
        fetchRoomTypes();
    }, []);

    useEffect(() => {
        if (!isPopupBookNow) {
            setFormData({
                checkin: '',
                checkout: '',
                roomType: '',
                room: 1,
                children: 0,
                member: 1,
                price: '0',
                total_price: '0',
            });
            setSelectedRoomPrice(0);
            setPriceNotification('');
        }

        if (isPopupBookNow && selectedRoomName && roomTypes.length > 0) {
            const defaultRoom = roomTypes.find(room => room.name === selectedRoomName);
            if (defaultRoom) {
                const price = defaultRoom.price;
                const total = Total_price(price, formData.room, formData.checkin, formData.checkout);
                setFormData(prev => ({
                    ...prev,
                    roomType: defaultRoom.name,
                    price: price.toString(),
                    total_price: total.toString()
                }));
                setSelectedRoomPrice(price);
            }
        }
    }, [isPopupBookNow, selectedRoomName, roomTypes, formData.checkin, formData.checkout, formData.room]);

    // Fetch room types from the API
    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {

                const [response, roomsRes] = await Promise.all([
                    axios.get('/api/room_types'),
                    axios.get('/api/rooms')
                ]);
                let formattedRooms = [];
                if (Array.isArray(response.data)) {
                    formattedRooms = response.data.map(room => ({
                        id: room.id,
                        name: room.name,
                        price: room.price,
                        capacity: room.capacity || 0
                    }));
                } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    formattedRooms = response.data.data.map(room => ({
                        id: room.id,
                        name: room.name,
                        price: room.price,
                        capacity: room.capacity || 0
                    }));
                } else {
                    console.error('Unexpected data structure:', response.data);
                    window.showNotification('Invalid room types data', 'error');
                    return;
                }
                setRoomTypes(formattedRooms);
                setRooms(roomsRes.data || []);
            } catch (error) {
                console.error('Error fetching room types:', error.response || error);
                window.showNotification('Failed to load room types', 'error');
            }
        };

        fetchRoomTypes();
    }, []);

    const handleChange = useCallback(
        debounce((event) => {
            const { id, value } = event.target;
            // const newValue = id === "member" ? parseInt(value) || 0 : value;

            setFormData((prevData) => {
                const updatedData = { ...prevData, [id]: value };

                const basePrice = selectedRoomPrice || 0;
                const checkinDate = updatedData.checkin;
                const checkoutDate = updatedData.checkout;

                // Kiểm tra ngày hợp lệ
                if (checkinDate && checkoutDate && dayjs(checkinDate).isValid() && dayjs(checkoutDate).isValid()) {
                    // Xử lý thông báo giá ngày lễ/cuối tuần
                    let notification = '';
                    const startDate = dayjs(checkinDate);
                    const endDate = dayjs(checkoutDate);
                    const specialDays = [];

                    for (let date = startDate; date.isBefore(endDate); date = date.add(1, 'day')) {
                        const adjustedPrice = PriceHolidayTet(basePrice, date.format('YYYY-MM-DD'));
                        if (adjustedPrice !== basePrice) {
                            const isWeekend = [5, 6].includes(date.day());
                            const isHoliday = adjustedPrice / basePrice === 1.5;
                            if (isWeekend || isHoliday) {
                                specialDays.push({
                                    date: date.format('DD/MM/YYYY'),
                                    type: isWeekend && isHoliday ? 'Weekend & Holiday' : (isWeekend ? 'Weekend' : 'Holiday'),
                                    price: adjustedPrice,
                                });
                            }
                        }
                    }

                    if (specialDays.length > 0) {
                        notification = specialDays.map(day =>
                            `${day.date} (${day.type}): Price is ${formatCurrency(day.price )}/night`
                        ).join('\n');
                    }

                    setPriceNotification(notification);
                }

                return updatedData; // Trả về state cập nhật
            });

            // Tính toán tổng giá trị
            if (id === 'room') {
                const total = Total_price(selectedRoomPrice, value).toString();
                setFormData((prevData) => ({
                    ...prevData,
                    total_price: total,
                }));
            }

            // Kiểm tra số lượng phòng có sẵn
            const availableRooms = rooms.filter(r => r.type === formData.roomType && r.status === 'available').length;
            if (id === "room" && parseInt(value) > availableRooms) {
                window.showNotification(`Only ${availableRooms} room${availableRooms > 1 ? 's' : ''} available`, "error");
            }

            // Kiểm tra số lượng thành viên không vượt quá sức chứa của phòng
            const totalGuests = parseInt(formData.member) + parseInt(formData.children || 0);
            if ((id === "member" || id === "children") && totalGuests > Maxmember()) {
                window.showNotification(
                    `Maximum capacity is ${Maxmember(formData.room)} member${Maxmember(formData.room) > 1 ? 's' : ''} for ${formData.room} room${formData.room > 1 ? 's' : ''}. Please reduce the number of members.`, "error");
            }

            // Tính toán giá phòng
            if (id === 'roomType') {
                const selectedRoom = roomTypes.find((room) => room.id === parseInt(value));
                const price = selectedRoom ? selectedRoom.price : 0;
                setSelectedRoomPrice(price);
            }

        }, 300),
        [selectedRoomPrice, roomTypes, selectedRoomName]
    );

    const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const now = new Date();
    const minCheckin = formatDateTime(now);

    const handleBookNow = async (e) => {
        e.preventDefault();

        // Kiểm tra các trường bắt buộc
        if (!formData.checkin || !formData.checkout || !formData.member) {
            window.showNotification("Please fill in all required fields.", "error");
            return;
        }

        // Chuyển đổi checkin và checkout thành đối tượng Date
        const checkinDate = new Date(formData.checkin);
        const checkoutDate = new Date(formData.checkout);
        const currentDate = new Date();

        // Kiểm tra checkin không được nhỏ hơn thời gian hiện tại
        if (checkinDate < currentDate) {
            window.showNotification("Check-in time cannot be in the past.", "error");
            return;
        }

        // Kiểm tra checkout phải lớn hơn checkin (ít nhất 1 giờ)
        const minCheckoutDate = new Date(checkinDate);
        minCheckoutDate.setHours(checkinDate.getHours() + 1);
        if (checkoutDate <= minCheckoutDate) {
            window.showNotification("Check-out time must be at least 1 hour after check-in.", "error");
            return;
        }

        // Kiểm tra số lượng thành viên không vượt quá sức chứa của phòng
        if (parseInt(formData.member) > Maxmember(formData.room) || parseInt(formData.member) <= 0) {
            window.showNotification(`Cannot book. Number of members (${formData.member}) exceeds room capacity (${Maxmember(formData.room)}).`, "error");
            return;
        }

        // Kiểm tra số lượng trẻ em không vượt quá sức chứa của phòng
        if (parseInt(formData.children) > Maxmember(formData.room) || parseInt(formData.children) < 0) {
            window.showNotification(`Cannot book. Number of children (${formData.children}) exceeds room capacity (${Maxmember(formData.room)}).`, "error");
            return;
        }

        // kiểm tra không cho book quá 30 ngày
        const daysDifference = CalculatorDays(formData.checkin, formData.checkout);
        if (daysDifference > 30) {
            window.showNotification("Booking is limited to a maximum of 30 days as per regulations.", "error");
            return;
        }

        const maxAmount = 9999999999999999.99;
        const totalAmount = parseFloat(formData.total_price);
        const depositAmount = totalAmount * 0.2;
        const amountToPay = paymentOption === 'deposit' ? depositAmount : totalAmount;

        if (amountToPay > maxAmount) {
            window.showNotification("The payment amount exceeds the allowed limit. Please reduce the number of rooms or contact support.", "error");
            return;
        }
        setBookingAmount(amountToPay);
        setIsPopUp_deposit(true);
    };

    const handlePopupConfirm = (confirmed) => {
        if (confirmed) {
            setIsPopUp_deposit(false);
            setIsPaymentPopupOpen(true);
        } else {
            setIsPopUp_deposit(false);
        }
    };

    const handlePaymentConfirm = async (confirmed) => {
        if (confirmed) confirmed.preventDefault();

        try {
            const isDeposit = paymentOption === 'deposit';
            const response = await axios.post('/api/booking', {
                user_id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                room_type: formData.roomType,
                number_of_rooms: formData.room,
                children: formData.children,
                member: formData.member,
                checkin_date: formData.checkin,
                checkout_date: formData.checkout,
                price: formData.price,
                total_price: formData.total_price,
                status: isDeposit ? 'pending_payment' : 'confirmed',
                deposit_paid: isDeposit ? bookingAmount : 0,
            });

            closePopup();
            setIsPopUp_deposit(false);
            setPriceNotification('');
            window.showNotification("Booking created successfully!", "success");
        } catch (error) {
            console.error('Error creating booking:', error.response || error);
            window.showNotification("Failed to create booking or the room is full in checkin date, Pls call hotline", "error");
        } finally {
            setIsPaymentPopupOpen(false);
        }
    };

    const handlePopupClose = () => {
        setIsPopUp_deposit(false);
        setPriceNotification('');
    };

    const handlePaymentOptionChange = (e) => {
        setPaymentOption(e.target.value);
    };

    return (
        <>
            {isPopupBookNow && (
                <div className="popup-booknow">
                    <div className="popup-overlay" onClick={(e) => e.target.classList.contains("popup-overlay") && closePopup() && setPriceNotification('')}>
                        <div className="popup-content">
                            <button className="close-popup-btn" onClick={closePopup}>×</button>
                            <h2>Book Now</h2>
                            <form className="book-now-form">
                                <div className="row">
                                    <div className="col-md-6">
                                        <label htmlFor="checkin" className="form-label">Check-in Date:</label>
                                        <input type="date" id="checkin" className="form-control" min={minCheckin} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="checkout" className="form-label">Check-out Date:</label>
                                        <input type="date" id="checkout" className="form-control" onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <label htmlFor="roomType">Room Type:</label>
                                        <input type="text" id="roomType" className="form-control" value={formData.roomType} readOnly />
                                    </div>
                                    <div className="col-md-6">
                                        <label>Number of Rooms:</label>
                                        <select name="room" id="room" className="form-select" onChange={handleChange}>
                                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <label>Children (0–11):</label>
                                        <input type="number" id="children" className="form-control" min="0" max={MaxChildren()} onChange={handleChange} placeholder="0" />
                                    </div>
                                    <div className="col-md-6">
                                        <label>Member:</label>
                                        <input type="number" id="member" className="form-control" min="1" max={Maxmember()} onChange={handleChange} placeholder="1" />
                                    </div>
                                </div>
                                <div className="row payment-option">
                                    <div className="col-md-6">
                                        <label className="form-label"><b>Payment Option:</b></label>
                                        <div>
                                            <div className="row">
                                                <div className="col-md-6 text-end">
                                                    <label>
                                                        Pay Deposit (20%)
                                                        <input
                                                            type="radio"
                                                            name="paymentOption"
                                                            value="deposit"
                                                            checked={paymentOption === 'deposit'}
                                                            onChange={handlePaymentOptionChange}
                                                        />
                                                    </label>
                                                </div>
                                                <div className="col-md-6 text-end">
                                                    <label>
                                                        Pay Full Amount
                                                        <input
                                                            type="radio"
                                                            name="paymentOption"
                                                            value="full"
                                                            checked={paymentOption === 'full'}
                                                            onChange={handlePaymentOptionChange}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        {priceNotification && (
                                            <p className="popup-booknow text-warning" style={{ whiteSpace: 'pre-line' }}>
                                                {priceNotification}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="view-price-popup info-row">
                                    <div className="row">
                                        <div className="popup-booknow col-md-6">
                                            <p className="popup-booknow info-item">Days: {CalculatorDays(formData.checkin, formData.checkout) || '0'}</p>
                                            <p className="popup-booknow info-item">Base Price: {formatCurrency(selectedRoomPrice)}/night</p>
                                        </div>
                                        {/* Cột phải: Deposit, Total Price, Remaining, Amount to Pay Now */}
                                        <div className="popup-booknow col-md-6 view-price">
                                            <p>Deposit (20%): {formatCurrency((parseFloat(formData.total_price) * 0.2))}</p>
                                            <p>Total Price: {formatCurrency(parseFloat(formData.total_price) )}</p>
                                            {paymentOption === 'deposit' && (
                                                <p>Remaining (Due on Check-in): {formatCurrency(parseFloat(formData.total_price) * 0.8 )}</p>
                                            )}
                                            <p>Amount to Pay Now: {formatCurrency((paymentOption === 'deposit' ? parseFloat(formData.total_price) * 0.2 : parseFloat(formData.total_price)))}</p>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={handleBookNow} className="btn btn-primary w-100">Submit</button>
                                {isPopUp_deposit && (
                                    <PopUp_deposit
                                        onConfirm={handlePopupConfirm}
                                        onClose={handlePopupClose}
                                    />
                                )}
                                {isPaymentPopupOpen && (
                                    <QRPayment
                                        amount={bookingAmount}
                                        onClose={() => setIsPaymentPopupOpen(false)}
                                        onConfirm={handlePaymentConfirm}
                                        isDeposit={paymentOption === 'deposit'}
                                    />
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PopupBookNow;
