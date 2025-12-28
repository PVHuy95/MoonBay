import React, { useState, useEffect, useRef } from 'react';
import { format, getDaysInMonth, addMonths, subMonths, startOfDay, isSameDay, isAfter, isBefore, isWithinInterval } from 'date-fns';
import { enUS } from 'date-fns/locale';
import axios from '../../axios-config';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Tooltip } from 'bootstrap';
import '../../../css/css_of_admin/ManageBooking.css';

const ManageBookings = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 1)); // May 2025
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [actionType, setActionType] = useState(''); // 'checkin' or 'manage'
  const [selectedAction, setSelectedAction] = useState(''); // 'checkout' or 'extend'
  const checkoutDateRef = useRef(null); // Ref for checkout_date input
  const actualCheckOutRef = useRef(null); // Ref for actual_check_out input
  const tableRef = useRef(null);

  // Fetch all rooms from paginated API
  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      setError(null);
      let allRooms = [];
      let page = 1;
      const perPage = 10;

      try {
        while (true) {
          // const response = await axios.get('http://localhost:8000/api/room_list', {
          const response = await axios.get('/api/room_list', {
            params: { per_page: perPage, page },
          });
          const { data, last_page } = response.data;
          if (!Array.isArray(data)) {
            throw new Error('Invalid API response: room data is not an array');
          }
          allRooms = [...allRooms, ...data.map(item => ({
            id: item.id,
            room_number: item.room_number,
            status: item.status,
          }))];
          if (page >= last_page) break;
          page++;
        }
        setRooms(allRooms);
      } catch (error) {
        console.error('Error fetching room list:', error);
        setError('Unable to load room list: ' + error.message);
        setRooms([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Fetch bookings for the current month and overlapping bookings
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);
      let allBookings = [];
      let page = 1;
      const perPage = 30;

      // Extend the range to include bookings that overlap with the current month
      const startOfPreviousMonth = subMonths(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), 1);
      const endOfNextMonth = addMonths(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59), 1);

      try {
        while (true) {
          // const response = await axios.get('http://localhost:8000/api/booking_manager', {
          const response = await axios.get('/api/booking_manager', {
            params: {
              per_page: perPage,
              page,
              checkin_date_lte: format(endOfNextMonth, 'yyyy-MM-dd HH:mm:ss'), // Include bookings starting before or on endOfNextMonth
              checkout_date_gte: format(startOfPreviousMonth, 'yyyy-MM-dd HH:mm:ss'), // Include bookings ending after or on startOfPreviousMonth
            },
          });

          if (!response.data || typeof response.data !== 'object') {
            throw new Error('Invalid API response: data is missing or not in the correct format');
          }

          const { data, last_page } = response.data;
          if (!Array.isArray(data)) {
            console.error('API response:', response.data);
            throw new Error('Invalid API response: data is not an array');
          }

          allBookings = [...allBookings, ...data.map(booking => ({
            ...booking,
            checkin_date: new Date(booking.checkin_date),
            checkout_date: new Date(booking.checkout_date),
            check_status: booking.check_status || 'not checked in',
            actual_check_in: booking.actual_check_in ? new Date(booking.actual_check_in) : null,
            actual_check_out: booking.actual_check_out ? new Date(booking.actual_check_out) : null,
          }))];

          if (page >= last_page || data.length < perPage) break;
          page++;
        }
        setBookings(allBookings);
      } catch (error) {
        console.error('Error fetching booking list:', error);
        setError('Unable to load booking list: ' + error.message);
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [currentDate]);

  // Initialize Bootstrap tooltips
  useEffect(() => {
    if (tableRef.current) {
      const tooltipTriggerList = tableRef.current.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipTriggerList.forEach(tooltipTriggerEl => {
        new Tooltip(tooltipTriggerEl, {
          boundary: document.body,
          placement: 'top',
          customClass: 'custom-tooltip',
        });
      });
    }
  }, [bookings, rooms]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Focus on appropriate input based on selected action
  useEffect(() => {
    if (selectedAction === 'extend' && checkoutDateRef.current) {
      checkoutDateRef.current.focus();
    } else if (selectedAction === 'checkout' && actualCheckOutRef.current) {
      actualCheckOutRef.current.focus();
    }
  }, [selectedAction]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchPhone(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchPhone('');
  };

  // Handle cell click to open modal
  const handleCellClick = (booking) => {
    if (!booking || booking.check_status === 'checked out') return;
    const now = new Date();
    setSelectedBooking(booking);
    if (booking.check_status === 'not checked in') {
      setActionType('checkin');
      setFormData({
        checkin_date: format(booking.checkin_date, 'yyyy-MM-dd'),
        checkout_date: format(booking.checkout_date, 'yyyy-MM-dd'),
        actual_check_in: format(now, 'yyyy-MM-dd HH:mm:ss'),
      });
      setSelectedAction('');
    } else if (booking.check_status === 'checked in') {
      setActionType('manage');
      setFormData({
        checkin_date: format(booking.checkin_date, 'yyyy-MM-dd'),
        checkout_date: format(booking.checkout_date, 'yyyy-MM-dd'),
        actual_check_in: booking.actual_check_in ? format(booking.actual_check_in, 'yyyy-MM-dd HH:mm:ss') : '',
        actual_check_out: format(now, 'yyyy-MM-dd HH:mm:ss'),
      });
      setSelectedAction('checkout'); // Default to checkout
    }
    setShowModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
    setFormData({});
    setActionType('');
    setSelectedAction('');
    setError(null);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (action) => {
    setSelectedAction(prev => (prev === action ? '' : action));
    setError(null); // Clear error when changing action
  };

  // Handle form submission to update booking
  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    if (!selectedBooking || (!selectedAction && actionType !== 'checkin')) {
      setError('Please select an action');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let payload;
      if (actionType === 'checkin') {
        const actualCheckIn = new Date(formData.actual_check_in);
        const checkInDate = new Date(selectedBooking.checkin_date);
        const checkOutDate = new Date(selectedBooking.checkout_date);

        // Validate actual_check_in
        if (
          (isBefore(actualCheckIn, checkInDate) && !isSameDay(actualCheckIn, checkInDate)) ||
          (isAfter(actualCheckIn, checkOutDate) && !isSameDay(actualCheckIn, checkOutDate))
        ) {
          setError('Actual check-in must be on or after scheduled check-in date and on or before scheduled check-out date');
          setIsLoading(false);
          return;
        }

        payload = {
          checkin_date: format(new Date(selectedBooking.checkin_date), 'yyyy-MM-dd HH:mm:ss'),
          checkout_date: format(new Date(selectedBooking.checkout_date), 'yyyy-MM-dd HH:mm:ss'),
          check_status: 'checked in',
          actual_check_in: formData.actual_check_in,
          actual_check_out: null,
        };
      } else if (selectedAction === 'checkout') {
        const actualCheckOut = new Date(formData.actual_check_out);
        const checkInDate = new Date(selectedBooking.checkin_date);
        const actualCheckIn = new Date(formData.actual_check_in);
        const currentCheckOut = new Date(selectedBooking.checkout_date);

        // Validate actual_check_out
        if (
          isBefore(actualCheckOut, checkInDate) && !isSameDay(actualCheckOut, checkInDate) ||
          isBefore(actualCheckOut, actualCheckIn) && !isSameDay(actualCheckOut, actualCheckIn) ||
          isAfter(actualCheckOut, currentCheckOut) && !isSameDay(actualCheckOut, currentCheckOut)
        ) {
          setError('Actual check-out must be on or after check-in and actual check-in dates, and on or before scheduled check-out date');
          setIsLoading(false);
          return;
        }

        payload = {
          checkin_date: format(new Date(selectedBooking.checkin_date), 'yyyy-MM-dd HH:mm:ss'),
          checkout_date: format(new Date(selectedBooking.checkout_date), 'yyyy-MM-dd HH:mm:ss'),
          check_status: 'checked out',
          actual_check_in: formData.actual_check_in,
          actual_check_out: format(actualCheckOut, 'yyyy-MM-dd HH:mm:ss'),
        };
      } else if (selectedAction === 'extend') {
        const newCheckOut = new Date(formData.checkout_date + ' 12:00:00');
        const checkInDate = new Date(selectedBooking.checkin_date);
        const actualCheckIn = new Date(formData.actual_check_in);
        const currentCheckOut = new Date(selectedBooking.checkout_date);

        // Validate new check-out date
        if (isBefore(newCheckOut, checkInDate) || isBefore(newCheckOut, actualCheckIn) || isBefore(newCheckOut, currentCheckOut)) {
          setError('New check-out date must be after check-in, actual check-in, and current check-out dates');
          setIsLoading(false);
          return;
        }

        // Check for conflicts with other bookings for the same room
        const conflictingBooking = bookings.find(booking => {
          if (booking.id === selectedBooking.id || booking.room_id !== selectedBooking.room_id) {
            return false;
          }
          const existingCheckIn = new Date(booking.checkin_date);
          const existingCheckOut = new Date(booking.checkout_date);
          return isWithinInterval(newCheckOut, {
            start: existingCheckIn,
            end: existingCheckOut,
          }) || isAfter(newCheckOut, existingCheckIn);
        });

        if (conflictingBooking) {
          setError(`The new check-out date conflicts with another booking for this room from ${format(conflictingBooking.checkin_date, 'yyyy-MM-dd HH:mm:ss')} to ${format(conflictingBooking.checkout_date, 'yyyy-MM-dd HH:mm:ss')}`);
          setIsLoading(false);
          return;
        }

        payload = {
          checkin_date: format(new Date(selectedBooking.checkin_date), 'yyyy-MM-dd HH:mm:ss'),
          checkout_date: format(newCheckOut, 'yyyy-MM-dd HH:mm:ss'),
          check_status: 'checked in',
          actual_check_in: formData.actual_check_in,
          actual_check_out: null,
        };
      }

      const response = await axios.put(`http://localhost:8000/api/booking_manager/${selectedBooking.id}`, payload);

      setBookings(prev =>
        prev.map(b => (b.id === selectedBooking.id ? {
          ...b,
          ...response.data,
          checkin_date: new Date(response.data.checkin_date),
          checkout_date: new Date(response.data.checkout_date),
          check_status: response.data.check_status,
          actual_check_in: response.data.actual_check_in ? new Date(response.data.actual_check_in) : null,
          actual_check_out: response.data.actual_check_out ? new Date(response.data.actual_check_out) : null,
        } : b))
      );

      setShowModal(false);
      setSelectedBooking(null);
      setFormData({});
      setActionType('');
      setSelectedAction('');
      setShowToast(true);
    } catch (error) {
      console.error('Error updating booking:', error);
      setError('Unable to update booking: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to previous/next month
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Handle hover to highlight column
  const handleMouseEnter = (column) => {
    if (column !== '0') {
      document.querySelectorAll(`[data-column="${column}"]`).forEach(el => {
        el.classList.add('highlight-column');
      });
    }
  };

  const handleMouseLeave = (column) => {
    if (column !== '0') {
      document.querySelectorAll(`[data-column="${column}"]`).forEach(el => {
        el.classList.remove('highlight-column');
      });
    }
  };

  // Check if a room is booked on a specific day and return booking info
  const isRoomBooked = (room, day) => {
    const targetDate = startOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));

    if (room.status === 'maintenance') {
      return { booking: null, status: 'maintenance', check_status: null };
    }

    const booking = bookings.find(booking => {
      if (booking.room_id !== room.id) return false;
      const checkin = startOfDay(booking.checkin_date);
      const checkout = startOfDay(booking.checkout_date);
      const isBooked = (isSameDay(targetDate, checkin) || isAfter(targetDate, checkin)) &&
        (isSameDay(targetDate, checkout) || isBefore(targetDate, checkout));
      return isBooked;
    });

    return {
      booking,
      status: booking ? 'booked' : 'available',
      check_status: booking ? booking.check_status : null,
    };
  };

  // Format booking info for tooltip
  const formatBookingInfo = (booking, status) => {
    if (status === 'maintenance') {
      return `<div class="tooltip-content">Room under maintenance</div>`;
    }
    if (!booking) return '';
    return `
      <div class="tooltip-content">
        <div><strong>Name:</strong> ${booking.name}</div>
        <div><strong>Phone:</strong> ${booking.phone}</div>
        <div><strong>Check-in:</strong> ${format(booking.checkin_date, 'yyyy-MM-dd HH:mm:ss')}</div>
        <div><strong>Check-out:</strong> ${format(booking.checkout_date, 'yyyy-MM-dd HH:mm:ss')}</div>
        <div><strong>Status:</strong> ${booking.check_status}</div>
        ${booking.actual_check_in ? `<div><strong>Actual Check-in:</strong> ${format(booking.actual_check_in, 'yyyy-MM-dd HH:mm:ss')}</div>` : ''}
        ${booking.actual_check_out ? `<div><strong>Actual Check-out:</strong> ${format(booking.actual_check_out, 'yyyy-MM-dd HH:mm:ss')}</div>` : ''}
      </div>
    `;
  };

  // Render calendar table
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const today = startOfDay(new Date());

    const isCellHighlighted = (booking, day) => {
      if (!searchPhone?.trim() || !booking) return false;
      const targetDate = startOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
      const checkin = startOfDay(booking.checkin_date);
      const checkout = startOfDay(booking.checkout_date);
      return (
        (isSameDay(targetDate, checkin) || isAfter(targetDate, checkin)) &&
        (isSameDay(targetDate, checkout) || isBefore(targetDate, checkout)) &&
        booking.phone?.includes(searchPhone.trim())
      );
    };

    const isToday = (day) => {
      const targetDate = startOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
      return isSameDay(targetDate, today);
    };

    const isPastDate = (day) => {
      const targetDate = startOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
      return isBefore(targetDate, today);
    };

    return (
      <>
        <div className="search-container sticky-top bg-white py-2" style={{ zIndex: 1000 }}>
          <div className="d-flex align-items-center" style={{ maxWidth: '300px' }}>
            <input
              type="text"
              className="form-control me-2"
              placeholder="Search by phone number"
              value={searchPhone}
              onChange={handleSearchChange}
              style={{ maxWidth: '250px' }}
            />
            {searchPhone && (
              <button className="btn btn-outline-secondary" onClick={handleClearSearch}>
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="table-container position-relative">
          {error && <div className="alert alert-danger mt-3">{error}</div>}
          {isLoading ? (
            <div className="text-center mt-3">Loading...</div>
          ) : (
            <>
              {showToast && (
                <div
                  className="toast show position-fixed top-0 end-0 m-3"
                  style={{ zIndex: 1050 }}
                  role="alert"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  <div className="toast-header">
                    <strong className="me-auto">Success</strong>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowToast(false)}
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="toast-body">Booking updated successfully!</div>
                </div>
              )}

              <table ref={tableRef} className="table table-bordered table-sm w-100" style={{ tableLayout: 'fixed' }}>
                <thead className="table-light sticky-thead">
                  <tr>
                    <th
                      scope="col"
                      className="text-center align-middle"
                      style={{ width: '80px', fontSize: '0.8rem' }}
                      data-column="0"
                    >
                      Room
                    </th>
                    {days.map((day) => {
                      const isTodayClass = isToday(day) ? 'highlight-today' : '';
                      const isPastClass = isPastDate(day) ? 'past-date' : '';
                      return (
                        <th
                          key={day}
                          scope="col"
                          className={`text-center align-middle ${isTodayClass} ${isPastClass}`}
                          style={{ width: `calc((100% - 80px) / ${days.length})`, fontSize: '0.8rem' }}
                          data-column={day}
                          onMouseEnter={() => handleMouseEnter(day.toString())}
                          onMouseLeave={() => handleMouseLeave(day.toString())}
                        >
                          {day}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rooms.length > 0 ? (
                    rooms.map((room) => (
                      <tr key={`room-${room.id}`}>
                        <td
                          className="text-center align-middle fw-bold"
                          style={{
                            width: '80px',
                            fontSize: '0.8rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          data-column="0"
                        >
                          {room.room_number}
                        </td>
                        {days.map((day) => {
                          const { booking, status, check_status } = isRoomBooked(room, day);
                          const cellClass =
                            status === 'maintenance'
                              ? 'bg-danger text-white'
                              : status === 'booked' && check_status === 'not checked in'
                                ? 'bg-warning text-dark'
                                : status === 'booked' && check_status === 'checked in'
                                  ? 'bg-success text-white'
                                  : status === 'booked' && check_status === 'checked out'
                                    ? 'bg-secondary text-white'
                                    : 'bg-white';
                          const isHighlighted = isCellHighlighted(booking, day);
                          const isTodayClass = isToday(day) ? 'highlight-today' : '';
                          const isPastClass = isPastDate(day) ? 'past-date' : '';
                          return (
                            <td
                              key={`room-${room.id}-day-${day}`}
                              className={`text-center align-middle ${cellClass} ${isHighlighted ? 'highlight-search' : ''} ${isTodayClass} ${isPastClass}`}
                              style={{
                                height: '30px',
                                fontSize: '0.7rem',
                                cursor: status === 'booked' && check_status !== 'checked out' ? 'pointer' : 'default',
                              }}
                              data-column={day}
                              onMouseEnter={() => handleMouseEnter(day.toString())}
                              onMouseLeave={() => handleMouseLeave(day.toString())}
                              onClick={() => status === 'booked' && check_status !== 'checked out' && handleCellClick(booking)}
                              data-bs-toggle={status === 'booked' || status === 'maintenance' ? 'tooltip' : ''}
                              data-bs-html="true"
                              data-bs-title={formatBookingInfo(booking, status)}
                            >
                              {status === 'maintenance' ? 'M' : status === 'booked' ? 'B' : ''}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={days.length + 1} className="text-center">
                        No rooms available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">
                          {actionType === 'checkin' ? 'Check-in Booking' : 'Manage Booking'}
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={handleCloseModal}
                          aria-label="Close"
                        ></button>
                      </div>
                      <div className="modal-body">
                        {error && <div className="alert alert-danger">{error}</div>}
                        {selectedBooking && (
                          <form onSubmit={handleUpdateBooking}>
                            <div className="mb-3">
                              <label htmlFor="checkin_date" className="form-label">
                                Check-in Date (Scheduled)
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                id="checkin_date"
                                name="checkin_date"
                                value={formData.checkin_date || ''}
                                readOnly
                              />
                            </div>
                            <div className="mb-3">
                              <label htmlFor="checkout_date" className="form-label">
                                Check-out Date (Scheduled)
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                id="checkout_date"
                                name="checkout_date"
                                value={formData.checkout_date || ''}
                                readOnly={selectedAction !== 'extend'}
                                onChange={handleInputChange}
                                ref={checkoutDateRef}
                              />
                            </div>
                            <div className="mb-3">
                              <label htmlFor="actual_check_in" className="form-label">
                                Actual Check-in
                              </label>
                              <input
                                type="datetime-local"
                                className="form-control"
                                id="actual_check_in"
                                name="actual_check_in"
                                value={formData.actual_check_in || ''}
                                readOnly
                              />
                            </div>
                            {actionType === 'manage' && selectedAction === 'checkout' && (
                              <div className="mb-3">
                                <label htmlFor="actual_check_out" className="form-label">
                                  Actual Check-out
                                </label>
                                <input
                                  type="datetime-local"
                                  className="form-control"
                                  id="actual_check_out"
                                  name="actual_check_out"
                                  value={formData.actual_check_out || ''}
                                  readOnly
                                  ref={actualCheckOutRef}
                                />
                              </div>
                            )}
                            {actionType === 'manage' && (
                              <div className="mb-3">
                                <label className="form-label">Action</label>
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="checkout"
                                    checked={selectedAction === 'checkout'}
                                    onChange={() => handleCheckboxChange('checkout')}
                                  />
                                  <label className="form-check-label" htmlFor="checkout">
                                    Check Out
                                  </label>
                                </div>
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="extend"
                                    checked={selectedAction === 'extend'}
                                    onChange={() => handleCheckboxChange('extend')}
                                  />
                                  <label className="form-check-label" htmlFor="extend">
                                    Extend Check-out
                                  </label>
                                </div>
                              </div>
                            )}
                            <div className="d-flex justify-content-between">
                              <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isLoading || (actionType === 'manage' && !selectedAction)}
                              >
                                {isLoading ? 'Updating...' : 'Submit'}
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleCloseModal}
                                disabled={isLoading}
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="container my-4 booking-show">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button onClick={prevMonth} className="btn btn-primary btn-sm">Previous Month</button>
        <h1 className="h3 fw-bold">
          {format(currentDate, 'MMMM yyyy', { locale: enUS })}
        </h1>
        <button onClick={nextMonth} className="btn btn-primary btn-sm">Next Month</button>
      </div>
      {renderCalendar()}
    </div>
  );
};

export default ManageBookings;