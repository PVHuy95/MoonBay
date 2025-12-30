import React, { useState, useEffect, useContext, useRef } from "react";
import '../../css/my_css/booking.css';
import BookNow from "./BookNow.jsx";
import { AuthContext } from "./AuthContext.jsx";
import axios from "axios";
import Banner from "./banner.jsx";
import { useLocation } from "react-router-dom";
import PopUp_deposit from "./PopUp_deposit.jsx";
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

const Booking = ({ checkLogin, checkLogins }) => {
    const { user, token } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
    const [roomTypes, setRoomTypes] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedRoomPrice, setSelectedRoomPrice] = useState(0);
    const [formData, setFormData] = useState({
        checkin: '',
        checkout: '',
        roomType: '',
        room: 1,
        children: 0,
        member: 1,
        price: '0',
        Total_price: '0',
        phone: ''
    });
    const [isPopUp_deposit, setIsPopUp_deposit] = useState(false);
    const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
    const [bookingAmount, setBookingAmount] = useState(0);
    const [priceNotification, setPriceNotification] = useState('');
    const [paymentOption, setPaymentOption] = useState('deposit'); // New state for payment option: 'deposit' or 'full'
    const safeAmount = (amount) => {
        if (typeof amount !== 'number') amount = Number(amount);
        return amount < 10000 ? amount * 1000 : amount;
    };


    const Total_price = (price, room) => {
        return parseFloat(price) * parseInt(room);
    };

    const CalculatorDays = (checkin, checkout) => {
        if (!checkin || !checkout || !dayjs(checkin).isValid() || !dayjs(checkout).isValid()) {
            return 0;
        }
        return Math.ceil(Math.abs(new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
    };

    const calculateExactTotalPrice = (basePrice, checkin, checkout) => {
        if (!checkin || !checkout || !dayjs(checkin).isValid() || !dayjs(checkout).isValid()) {
            return 0;
        }
        const startDate = dayjs(checkin);
        const endDate = dayjs(checkout);
        let total = 0;
        for (let date = startDate; date.isBefore(endDate); date = date.add(1, 'day')) {
            const adjusted = PriceHolidayTet(basePrice, date.format('YYYY-MM-DD')) || basePrice;
            total += adjusted;
        }
        return total;
    };

    const maxCapacity = roomTypes.length > 0 ? roomTypes.find((roomType) => roomType.name === formData.roomType)?.capacity || 0 : 0;
    const Maxmember = () => formData.room * maxCapacity;
    const MaxChildren = () => formData.room * 2;

    // Ngày hiện tại (hôm nay)
    const now = new Date();
    // Format ngày cho input type="date" (YYYY-MM-DD)
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    // Ngày tối thiểu cho check-in (hôm nay)
    const minCheckin = formatDate(now);
    // Ngày tối đa cho check-in (6 tháng kể từ hôm nay)
    const maxCheckinDate = new Date();
    maxCheckinDate.setMonth(maxCheckinDate.getMonth() + 6);
    const maxCheckin = formatDate(maxCheckinDate);

    const handleChange = (event) => {
        const { id, value } = event.target;
        const newValue = id === "member" ? parseInt(value) || 0 : value;

        setFormData((prevData) => {

            if (id === "children") {
                const childrenCount = parseInt(value) || 0;
                const maxChildren = MaxChildren();

                if (childrenCount > maxChildren) {
                    window.showNotification("Only up to 2 children (under 12) are allowed per booking.", "error");
                    return prevData; // Không cập nhật nếu vượt giới hạn
                }
            }


            const updatedData = {
                ...prevData,
                [id]: value,
            };

            if (id === 'roomType' || id === 'checkin' || id === 'checkout') {
                const selectedRoomType = roomTypes.find((roomType) => roomType.name === (id === 'roomType' ? value : formData.roomType));
                const basePrice = selectedRoomType ? selectedRoomType.price : 0;

                const totalExact = calculateExactTotalPrice(
                    basePrice,
                    id === 'checkin' ? value : formData.checkin,
                    id === 'checkout' ? value : formData.checkout
                );

                updatedData.Total_price = (totalExact * updatedData.room).toString();
                setSelectedRoomPrice(basePrice);
                updatedData.price = basePrice.toString();

                const checkinDate = id === 'checkin' ? value : formData.checkin;
                const checkoutDate = id === 'checkout' ? value : formData.checkout;
                let notification = '';

                if (checkinDate && checkoutDate && dayjs(checkinDate).isValid() && dayjs(checkoutDate).isValid()) {
                    const startDate = dayjs(checkinDate);
                    const endDate = dayjs(checkoutDate);
                    const specialDays = [];

                    for (let date = startDate; date.isBefore(endDate); date = date.add(1, 'day')) {
                        const adjustedPrice = PriceHolidayTet(basePrice, date.format('YYYY-MM-DD'));
                        const isBasePrice = adjustedPrice === basePrice;
                        if (!isBasePrice) {
                            const isWeekend = [5, 6].includes(date.day());
                            const isHoliday = adjustedPrice / basePrice === 1.5;
                            if (isWeekend || isHoliday) {
                                specialDays.push({
                                    date: date.format('DD/MM/YYYY'),
                                    isWeekend,
                                    isHoliday,
                                    price: adjustedPrice,
                                });
                            }
                        }
                    }

                    if (specialDays.length > 0) {
                        notification = specialDays.map(day => {
                            const type = day.isWeekend && day.isHoliday ? 'Weekend & Holiday' : (day.isWeekend ? 'Weekend' : 'Holiday');
                            return `${day.date} (${type}): Price is ${formatCurrency(day.price)}/night`;
                        }).join('\n');
                    }
                }

                setPriceNotification(notification);

                if (id === 'roomType') {
                    const checkin = id === 'checkin' ? value : formData.checkin;
                    const checkout = id === 'checkout' ? value : formData.checkout;
                    const roomType = id === 'roomType' ? value : formData.roomType;
                    const selectedRoom = roomTypes.find(room => room.name === value);
                    // const totalCapacity = selectedRoom.capacity + 2;

                    if (roomType && checkin && checkout && dayjs(checkin).isValid() && dayjs(checkout).isValid()) {
                        // Format dates to YYYY-MM-DD only
                        const checkinFormatted = dayjs(checkin).format('YYYY-MM-DD');
                        const checkoutFormatted = dayjs(checkout).format('YYYY-MM-DD');

                        axios.get('/api/available_rooms', {
                            params: {
                                room_type: roomType,
                                checkin_date: checkinFormatted,
                                checkout_date: checkoutFormatted,
                            },
                        })
                            .then(response => {
                                const available = response.data.available_rooms;
                                window.showNotification(
                                    available > 0
                                        ? `${available} room${available > 1 ? 's' : ''} available and This room type has a capacity of ${selectedRoom.capacity} adults. Children are limited to 2 per booking.`
                                        : 'No rooms available, please choose another room type or call hotline',
                                    available > 0 ? 'success' : 'error'
                                );
                            })
                            .catch(error => {
                                console.error('Error checking available rooms:', error);
                                window.showNotification('Failed to check room availability.', 'error');
                            });
                    } else {
                        window.showNotification('Please select check-in and check-out dates to check availability.', 'error');
                    }
                }
            } else if (id === 'room') {
                updatedData.Total_price = (parseFloat(formData.Total_price) / parseInt(formData.room) * parseInt(value)).toString();
            }

            if (id === "member" && newValue > Maxmember()) {
                window.showNotification(
                    `Maximum capacity is ${Maxmember()} member${Maxmember() > 1 ? 's' : ''} for ${updatedData.room} room${updatedData.room > 1 ? 's' : ''}. Please reduce the number of members.`,
                    "error"
                );
            }

            const availableRooms = rooms.filter(r => r.type === formData.roomType && r.status === 'available').length;
            if (id === "room" && newValue > availableRooms) {
                window.showNotification(
                    `Only ${availableRooms} room${availableRooms > 1 ? 's' : ''} available (preliminary check)`,
                    "error"
                );
            }

            return updatedData;
        });
    };

    const handlePaymentOptionChange = (e) => {
        setPaymentOption(e.target.value);
    };

    const handleBooking = async (e) => {
        e.preventDefault();

        if (!user) {
            checkLogin();
            window.showNotification("Please log in to book a room.", "error");
            return;
        }

        if (!formData.checkin || !formData.checkout || !formData.roomType || !formData.member) {
            window.showNotification("Please fill in all required fields.", "error");
            return;
        }

        if (!formData.phone || formData.phone.trim() === '') {
            window.showNotification("Phone number is required.", "error");
            return;
        }

        // Validation phone format (10-15 digits)
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(formData.phone.replace(/\s|-/g, ''))) {
            window.showNotification("Please enter a valid phone number (10-15 digits).", "error");
            return;
        }

        const checkinDate = new Date(formData.checkin);
        const checkoutDate = new Date(formData.checkout);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Reset về đầu ngày
        // Validation 1: Check-in không được là quá khứ
        if (checkinDate < currentDate) {
            window.showNotification("Check-in date cannot be in the past.", "error");
            return;
        }
        // Validation 2: Check-in không được quá 6 tháng
        const maxAllowedDate = new Date();
        maxAllowedDate.setMonth(maxAllowedDate.getMonth() + 6);
        if (checkinDate > maxAllowedDate) {
            window.showNotification("You can only book up to 6 months in advance.", "error");
            return;
        }
        // Validation 3: Check-out phải sau check-in ít nhất 1 ngày
        const minCheckoutDate = new Date(checkinDate);
        minCheckoutDate.setDate(minCheckoutDate.getDate() + 1);
        if (checkoutDate < minCheckoutDate) {
            window.showNotification("Check-out date must be at least 1 day after check-in date.", "error");
            return;
        }

        if (parseInt(formData.member) > Maxmember(formData.room) || parseInt(formData.member) <= 0) {
            window.showNotification(`The number of guests (${formData.member}) exceeds the capacity (${Maxmember(formData.room)}).`, "error");
            return;
        }

        const daysDifference = CalculatorDays(formData.checkin, formData.checkout);
        if (daysDifference > 30) {
            window.showNotification("Booking is limited to a maximum of 30 days as per regulations.", "error");
            return;
        }

        const availableRooms = rooms.filter(r => r.type === formData.roomType && r.status === 'available').length;
        console.log("Available rooms:", availableRooms);
        if (availableRooms < 1) {
            window.showNotification("No rooms available to book.", "error");
            return;
        } else if (availableRooms < parseInt(formData.room)) {
            window.showNotification(
                `Only ${availableRooms} room${availableRooms > 1 ? 's' : ''} available, but you selected ${formData.room}.`,
                "error"
            );
            return;
        }

        const maxAmount = 9999999999999999.99;
        const totalAmount = parseFloat(formData.Total_price);
        const depositAmount = totalAmount * 0.2;
        const amountToPay = paymentOption === 'deposit' ? depositAmount : totalAmount;

        if (amountToPay > maxAmount) {
            window.showNotification("The payment amount exceeds the allowed limit. Please reduce the number of rooms or contact support.", "error");
            return;
        }
        const bookingData = {
            user_id: parseInt(user.id),  // ← Đảm bảo INT
            name: user.name || '',
            email: user.email || '',
            phone: formData.phone,
            room_type: formData.roomType || '',
            number_of_rooms: parseInt(formData.room) || 1,  // ← Đảm bảo INT
            children: parseInt(formData.children) || 0,  // ← Đảm bảo INT
            member: parseInt(formData.member) || 1,  // ← Đảm bảo INT
            price: parseFloat(selectedRoomPrice) || 0,  // ← Đảm bảo FLOAT
            total_price: parseFloat(formData.Total_price) || 0,  // ← Đảm bảo FLOAT
            deposit_paid: parseFloat(paymentOption === 'deposit' ? amountToPay : 0),  // ← Đảm bảo FLOAT
            checkin_date: dayjs(formData.checkin).format('YYYY-MM-DD'),
            checkout_date: dayjs(formData.checkout).format('YYYY-MM-DD'),
            status: 'confirmed'
        };

        localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
        setBookingAmount(amountToPay);
        setIsPaymentPopupOpen(true);
    };

    const handlePopupConfirm = (confirmed) => {
        if (confirmed) {
            setIsPopUp_deposit(false);
            setIsPaymentPopupOpen(true);
        } else {
            setIsPopUp_deposit(false);
        }
    };

    const handlePopupClose = () => {
        setIsPopUp_deposit(false);
    };

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await axios.get('/api/room-types');
                const roomsData = response.data.room_types || [];
                setRoomTypes(roomsData);

                const types = [...new Set(roomsData.map(room => room.name))].map(name => {
                    const room = roomsData.find(room => room.name === name);
                    return {
                        name: name,
                        price: room ? room.price : "0.00",
                        capacity: room ? room.capacity : 2,
                    };
                });
                setRoomTypes(types);
            } catch (error) {
                console.error('Error fetching rooms:', error);
                window.showNotification("Unable to load room data.", "error");
            }
        };

        const fetchAvailableRooms = async () => {
            try {
                const response = await axios.get('/api/rooms');
                const availableRooms = response.data || [];
                setRooms(availableRooms);
            } catch (error) {
                console.error('Error fetching available rooms:', error.response?.data || error);
                window.showNotification("Unable to load available room data.", "error");
            }
        };

        fetchRooms();
        fetchAvailableRooms(); // Gọi API lấy phòng trống
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1550);
        return () => clearTimeout(timer);
    }, []);

    // Auto-fill phone từ user profile
    useEffect(() => {
        if (user && user.phone) {
            setFormData(prev => ({
                ...prev,
                phone: user.phone
            }));
        }
    }, [user]);

    const location = useLocation();
    const checkinRef = useRef(null);
    const checkoutRef = useRef(null);

    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location]);

    return (
        <>
            <Banner title="Booking Now" description="Book your stay with us" />
            <div className="bg" id="booknow" align="center">
                <video autoPlay muted loop playsInline preload="auto" className="background-video video-container">
                    <source src="/images/Dat/rooms/background.mp4" type="video/mp4" />
                </video>
                <div className="container-dat" style={{ paddingTop: "7%" }}>
                    {isLoading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <form className="p-4 rounded text-light shadow booking-form" style={{ backgroundColor: "rgba(33, 37, 41, 0.9)" }}>
                            <h2 className="mb-4 text-center">Hotel Booking</h2>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label htmlFor="checkin" className="form-label">Check-in:</label>
                                    <input
                                        ref={checkinRef}
                                        value={formData.checkin}
                                        type="date"
                                        id="checkin"
                                        className="form-control"
                                        onChange={handleChange}
                                        min={minCheckin}         // ← Tối thiểu hôm nay
                                        max={maxCheckin}         // ← Tối đa 6 tháng sau
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="checkout" className="form-label">Check-out:</label>
                                    <input
                                        ref={checkoutRef}
                                        value={formData.checkout}
                                        type="date"
                                        id="checkout"
                                        className="form-control"
                                        onChange={handleChange}
                                        min={formData.checkin ? (() => {
                                            // Check-out phải sau check-in ít nhất 1 ngày
                                            const minCheckout = new Date(formData.checkin);
                                            minCheckout.setDate(minCheckout.getDate() + 1);
                                            return formatDate(minCheckout);
                                        })() : minCheckin}
                                        disabled={!formData.checkin} // ← Disable nếu chưa chọn check-in
                                    />
                                </div>
                            </div>
                            <div className="row g-3 mt-1">
                                <div className="col-md-6">
                                    <label htmlFor="room" className="form-label">Number of Rooms:</label>
                                    <select name="room" id="room" className="form-select" value={formData.room} onChange={handleChange}>
                                        {[1, 2, 3, 4, 5].map(num => <option key={num} value={num}>{num}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="roomType" className="form-label">Room Type:</label>
                                    <select
                                        id="roomType"
                                        className="form-select"
                                        value={formData.roomType}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select room type</option>
                                        {roomTypes.map((roomType) => (
                                            <option key={roomType.name} value={roomType.name}>{roomType.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="row g-3 mt-1">
                                <div className="col-md-6">
                                    <label htmlFor="children" className="form-label">Children Ages(0-11):</label>
                                    <input type="number" id="children" className="form-control" min="0" max={MaxChildren()} onChange={handleChange} placeholder="0" value={formData.children} />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="member" className="form-label">Member:</label>
                                    <input type="number" id="member" className="form-control" min={0} max={Maxmember(formData.room)} onChange={handleChange} placeholder="1" />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label htmlFor="phone" className="form-label">
                                    Phone Number <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    className="form-control"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter your phone number"
                                    pattern="[0-9]*"
                                />
                            </div>

                            <div className="row g-3 mt-1 justify-content-center">
                                <div className="col-md-12 text-center">
                                    <label className="form-label"><b>Payment Option:</b></label>

                                    <div className="d-flex justify-content-center gap-4 mt-2">
                                        <label className="d-flex align-items-center gap-2" style={{ width: '20%' }}>
                                            <input
                                                type="radio"
                                                name="paymentOption"
                                                value="deposit"
                                                checked={paymentOption === 'deposit'}
                                                onChange={handlePaymentOptionChange}
                                                style={{ width: '20%' }}
                                            />
                                            <p style={{ width: '100%' }}>Pay Deposit (20%)</p>
                                        </label>

                                        <label className="d-flex align-items-center gap-2" style={{ width: '20%' }}>
                                            <input
                                                type="radio"
                                                name="paymentOption"
                                                value="full"
                                                checked={paymentOption === 'full'}
                                                onChange={handlePaymentOptionChange}
                                                style={{ width: '20%' }}
                                            />
                                            <p style={{ width: '100%' }}>Pay Full Amount</p>
                                        </label>
                                    </div>
                                </div>
                            </div>


                            <div className="row">
                                <div className="view-price col-md-6">
                                    <p>Days: {CalculatorDays(formData.checkin, formData.checkout) || '0'}</p>
                                    <p>The {formData.roomType || 'room Type'}: {formatCurrency(selectedRoomPrice)}/night (base)</p>
                                    {priceNotification && (
                                        <p className="price-notification">
                                            {priceNotification}
                                        </p>
                                    )}
                                </div>
                                <div className="view-price col-md-6">
                                    <p>Deposit (20%): {formatCurrency((parseFloat(formData.Total_price) * 0.2))}</p>
                                    <p>Total Price: {formatCurrency(parseFloat(formData.Total_price))}</p>
                                    {paymentOption === 'deposit' && (
                                        <p>Remaining (Due on Check-in): {formatCurrency(parseFloat(formData.Total_price) * 0.8)}</p>
                                    )}
                                    <p>Amount to Pay Now: {formatCurrency(paymentOption === 'deposit' ? parseFloat(formData.Total_price) * 0.2 : parseFloat(formData.Total_price))}</p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        type="submit"
                                        className="btn btn-warning w-100"
                                        onClick={handleBooking}
                                    >
                                        Book Now
                                    </button>
                                </div>
                                {isPopUp_deposit && (
                                    <PopUp_deposit onConfirm={handlePopupConfirm} onClose={handlePopupClose} />
                                )}
                                {isPaymentPopupOpen && (
                                    <QRPayment
                                        amount={bookingAmount}
                                        onClose={() => setIsPaymentPopupOpen(false)}
                                        isDeposit={paymentOption === 'deposit'}
                                        user={user}
                                        bookingData={JSON.parse(localStorage.getItem('pendingBooking') || '{}')}
                                    />
                                )}
                            </div>
                        </form>
                    )}
                </div>
            </div>
            <div>
                <BookNow checkLogins={checkLogins} />
            </div>
        </>
    );
};

export default Booking;