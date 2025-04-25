import React, { useState } from 'react';
import '../../css/home.css';
import 'bootstrap/dist/css/bootstrap.min.css';
const BookingForm = () => {
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');

    const handleFocus = (e) => {
        e.target.type = 'datetime-local'; // Mở hộp thoại khi focus vào input
    };

    const handleBlur = (e) => {
        if (!e.target.value) {
            e.target.type = 'text'; // Nếu không chọn gì, đóng hộp thoại
        }
    };

    return (
        <>
            <div className="booking-form">
                <form action="">
                    <div className="row">
                        <div className="col-md-3">
                            <div align="center">
                                <h2 style={{ color: "white" }}>Book<br /> Your Room</h2>
                            </div>
                        </div>
                        <div className='col-md-9 row'>
                            <div className="col-md-3">
                                {/* Check-in */}
                                <div>
                                    <input
                                        style={{ width: "100%", height: '44.4px' }}
                                        type={checkIn ? 'datetime-local' : 'text'} // Khi có giá trị, giữ loại "datetime-local"
                                        value={checkIn}
                                        onChange={(e) => setCheckIn(e.target.value)}
                                        placeholder={checkIn ? "" : "Check-in"}
                                        onFocus={handleFocus}
                                        onBlur={handleBlur}
                                    />
                                </div>

                                {/* Check-out */}
                                <div>
                                    <input
                                        style={{ width: "100%", height: '44.4px' }}
                                        type={checkOut ? 'datetime-local' : 'text'} // Khi có giá trị, giữ loại "datetime-local"
                                        value={checkOut}
                                        onChange={(e) => setCheckOut(e.target.value)}
                                        placeholder={checkOut ? "" : "Check-out"}
                                        onFocus={handleFocus}
                                        onBlur={handleBlur}
                                    />
                                </div>
                            </div>


                            <div className="col-md-3">
                                <div>
                                    <select defaultValue="" >
                                        <option value="" disabled hidden>
                                            Adult
                                        </option>
                                        <optgroup label="Adults">
                                            <option value="Old">Old</option>
                                            <option value="Younger">Younger</option>
                                            <option value="Potato">Potato</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <div>
                                    <select defaultValue="" >
                                        <option value="" disabled hidden>
                                            Child
                                        </option>
                                        <optgroup label="Child">
                                            <option value="Children">Children</option>
                                            <option value="Baby">Baby</option>
                                            <option value="Child">Child</option>
                                        </optgroup>
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div>
                                    <select defaultValue="" >
                                        <option value="" disabled hidden>
                                            Child
                                        </option>
                                        <optgroup label="Number of Rooms">
                                            <option value="room01">Room 01</option>
                                            <option value="room02">Room 02</option>
                                            <option value="room03">Room 03</option>
                                        </optgroup>
                                    </select>
                                </div>

                                <div>
                                    <button type="submit" className="btn btn-warning" style={{ width: "100%", height: '44.4px' }}>Booking</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
export default BookingForm;