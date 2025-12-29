import React from 'react';
import Banner from './banner';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Sitemapmini from './sitemapmini';
import { Link } from 'react-router-dom';

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

const Rooms = ({ checkLogins }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const roomRefs = useRef({});
  const sitemap = [
    { label: 'Home', link: '/' },
    { label: 'Rooms' }
  ];

  useEffect(() => {
    axios
      .get('/api/room_types')
      .then((response) => setRooms(response.data))
      .catch((error) => console.error('Error fetching room_types:', error))
      .finally(() => setLoading(false));
  }, []);

  const scrollToRoom = (roomId) => {
    const roomElement = roomRefs.current[roomId];
    if (roomElement) {
      roomElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Banner title="Rooms & Suites" />
      <section className="container">
        <Sitemapmini items={sitemap} />
        <div className="room-nav-horizontal mb-5">
          {loading ? (
            <span>Loading...</span>
          ) : (
            rooms.map((room) => (
              <button
                key={room.id}
                className="nav-item"
                onClick={() => scrollToRoom(room.id)}
              >
                <b>{room.name}</b>
              </button>
            ))
          )}
        </div>

        <h2 className="text-center mb-5">Rooms</h2>
        <div className="room-list">
          {loading ? (
            <div className="text-center my-5">
              <div
                className="spinner-border text-primary"
                role="status"
                style={{ width: '3rem', height: '3rem' }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            rooms.map((room, index) => (
              <div
                key={room.id}
                ref={(el) => (roomRefs.current[room.id] = el)}
                className={`room-item d-flex align-items-center mb-5 ${index % 2 === 0 ? '' : 'flex-row-reverse'
                  }`}
              >
                <div className="room-image">
                  {/* <img src={`/storage/${room.image}`} alt={room.name} /> */}
                  <img
                    src={
                      room.image
                        ? room.image.startsWith('http')
                          ? room.image                                    // Cloudinary URL
                          : `/storage/room_types_huy/${room.image}`      // Local file
                        : '/images/default-room.png'                     // Fallback
                    }
                    alt={room.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/default-room.png';
                    }}
                  />
                </div>
                <div className="room-info p-4">
                  <h5 className="mb-3">{room.name} ROOM</h5>
                  <p className="text-muted mb-3">
                    <i className="bi bi-people-fill me-1"></i> {room.capacity} guests
                  </p>
                  <p className="text-muted mb-3">
                    <i className="bi bi-cash-coin me-1 text-success"></i>
                    <strong>
                      {formatCurrency(room.price)}
                    </strong> / night
                  </p>
                  <p>{room.description}</p>

                  <button
                    onClick={() => checkLogins(room.name)}
                    className="btn btn-primary mt-3 rounded hover:bg-blue-700 transition"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <style>
        {`
          .room-nav-horizontal {
            max-width: 1000px;
            margin: 0 auto;
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
          }
          .room-nav-horizontal .nav-item {
            background: none;
            border: none;
            font-size: 1rem;
            color: #333;
            cursor: pointer;
            padding: 5px 10px;
            transition: color 0.3s ease;
          }
          .room-nav-horizontal .nav-item:hover {
            color: #007bff;
          }
          .room-list {
            max-width: 1000px;
            margin: 0 auto;
          }
          .room-item {
            transition: transform 0.3s ease, border-color 0.3s ease;
            border: 2px solid transparent;
          }
          .room-item:hover {
            transform: translateY(-5px);
            border: 2px solid #FFD700;
          }
          .room-image {
            flex: 0 0 50%;
            padding: 10px;
          }
          .room-image img {
            width: 100%;
            height: 300px;
            object-fit: cover;
            border-radius: 10px;
          }
          .room-info {
            flex: 0 0 50%;
            padding: 20px;
          }
          .room-info h5 {
            font-size: 1.75rem;
            font-weight: bold;
            color: #333;
            text-transform: uppercase;
          }
          .room-info p {
            color: #666;
            font-size: 1rem;
            line-height: 1.6;
          }
          .room-info .text-muted {
            font-size: 0.9rem;
            color: #888;
          }
          @media (max-width: 768px) {
            .room-item {
              flex-direction: column !important;
            }
            .room-image,
            .room-info {
              flex: 0 0 100%;
            }
            .room-image img {
              height: 250px;
            }
          }
        `}
      </style>
    </>
  );
};

export default Rooms;