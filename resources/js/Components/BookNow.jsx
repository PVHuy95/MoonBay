import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Autoplay, Pagination } from 'swiper/modules';
import '../../css/my_css/booking.css';
import axios from 'axios';


const BookNow = ({ checkLogins }) => {
    const [rooms, setRooms] = useState([]); // State để lưu dữ liệu từ database
    const [allRooms, setAllRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // State để quản lý trạng thái tải

    // Fetch dữ liệu từ API Laravel
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const [response, roomsRes] = await Promise.all([
                    axios.get('/api/room_types'),
                    axios.get('/api/rooms')
                ]);
                // Lọc các trường cần thiết để khớp với cấu trúc trước đây
                const formattedRooms = response.data.map(room => ({
                    id: room.id,
                    capacity: room.capacity,
                    name: room.name,
                    description: room.description,
                    image: room.image
                }));
                setRooms(formattedRooms); // Lưu dữ liệu vào state
                setAllRooms(roomsRes.data || []);
                setIsLoading(false); // Tắt trạng thái tải khi dữ liệu sẵn sàng
            } catch (error) {
                console.error('Error fetching rooms:', error);
                setIsLoading(false); // Tắt trạng thái tải ngay cả khi có lỗi
                // Có thể hiển thị thông báo lỗi cho người dùng nếu cần
            }
        };

        fetchRooms();
    }, []);

    // Hàm kiểm tra số phòng trống cho một loại phòng
    const getAvailableRoomsCount = (roomName) => {
        return allRooms.filter(room => room.type === roomName && room.status === 'available').length;
    };

    // Hàm xử lý khi nhấn Book Now, kiểm tra phòng trống trước khi mở popup
    const handleBookNowClick = (roomName) => {
        const availableCount = getAvailableRoomsCount(roomName);
        if (availableCount > 0) {
            checkLogins(roomName); // Mở popup nếu còn phòng trống
        } else {
            window.showNotification(`No rooms available for ${roomName}, please call hotline.`, 'error');
        }
    };

    return (
        <div className="bg-dark rooms_booking">
            <div className="container text-white" >
                <h2 className="text-center mb-4">BEST SELLER</h2>
                {isLoading ? (
                    <div className="text-center" style={{ color: 'white', fontSize: '20px', }}>Loading...</div> // Hiển thị khi đang tải
                ) : (
                    <Swiper
                        modules={[Pagination, Autoplay]}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false
                        }}
                        speed={3000}
                        loop={true}
                        spaceBetween={30}
                        slidesPerView={1}
                        pagination={{ clickable: true }}
                        className="room-slider"
                    >
                        {rooms.map((room) => (
                            <SwiperSlide key={room.id} className="position-relative">
                                <div className="room-card">
                                    {/* Hình ảnh với nút Book Now */}
                                    <div className="image-wrapper">
                                        <img
                                            src={
                                                room.image
                                                    ? room.image.startsWith('http')
                                                        ? room.image                                    // Cloudinary URL
                                                        : `/storage/room_types_huy/${room.image}`      // Local file
                                                    : '/images/default-room.png'                     // Fallback
                                            }
                                            alt={room.name}
                                            className="room-image"
                                        />
                                        <button onClick={() => handleBookNowClick(room.name)} className="btn btn-warning book-now-btn">
                                            Book Now
                                        </button>
                                    </div>
                                    {/* Thông tin phòng bên dưới hình ảnh */}
                                    <div className="room-info">
                                        <h3 className="room-name">{room.name}</h3>
                                        <p className="room-price bi bi-people"> {room.capacity}</p>
                                        <p className="room-details">{room.description}</p>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}
            </div>
        </div>
    )
};

export default BookNow;