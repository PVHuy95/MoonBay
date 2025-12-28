import React, { useState, useEffect } from 'react';
import Banner from './banner';
import '../../css/ourhotel.css';
import Sitemapmini from './sitemapmini';
import Slider from './ActivitySlider';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Ourhotel = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const moonBaySitemap = [
    { label: 'Home', link: '/' },
    { label: 'Our Hotel' }
  ];

  const hotelInfo = {
    name: "Moon Bay Hotel",
    location: "Nam Du Island, Kien Giang Province, Vietnam",
    description: "Located on the pristine Nam Du Island, Moon Bay Hotel offers a luxurious escape with modern architecture blending seamlessly with the island's natural beauty. Moon Bay Hotel is the perfect destination for luxury and tranquility. With 120 elegant rooms and villas, a restaurant serving local and international cuisine, a world-class spa, and an infinity pool overlooking the ocean, Moon Bay Hotel promises an unforgettable experience.",
    images: [
      "/images/Huy/hotel_huy/main.jpg",
      "/images/Huy/hotel_huy/room.jpg",
      "/images/Huy/hotel_huy/pool.jpg",
      "/images/Huy/hotel_huy/restaurant.jpg",
      "/images/Huy/hotel_huy/spa.jpg",
      "/images/Huy/hotel_huy/beach.jpg"
    ],
    mainImage: "/images/Huy/hotel_huy/main.jpg",
    price: "400,000 VND",
    amenities: [
      { name: "Air Conditioning", icon: "❄️" },
      { name: "Elevator", icon: "🛗" },
      { name: "Fine Dining Restaurant", icon: "🍴" },
      { name: "Free Wifi", icon: "📶" },
      { name: "Infinity Pool", icon: "🏊" },
      { name: "Modern Gym", icon: "🏋️" },
      { name: "Parking Car", icon: "🅿️" },
      { name: "Smart TV", icon: "📺" },
      { name: "Tea & Cafe", icon: "☕" }
    ],
    activities: [
      {
        name: "Island Hopping",
        description: "Discover nearby islands like Hon Hai Bo Dap, Hon Mau, Hon Dau...",
        icon: "🏝️"
      },
      {
        name: "Snorkeling",
        description: "Explore colorful coral reefs and marine life.",
        icon: "🤿"
      },
      {
        name: "Sea Fishing",
        description: "Join locals for a fun ocean fishing trip.",
        icon: "🎣"
      },
      {
        name: "Enjoy Local Delicacies",
        description: "Taste traditional “Chao Nhum” (sea urchin porridge).",
        icon: "🍲"
      }
    ],
    priceTour: "400,000 VND/person (min 10 people/boat) or 4,000,000 VND/private boat.",
    imagesTour: [
      "/images/Huy/hotel_huy/haibodap.png",
      "/images/Huy/hotel_huy/honmau.jpg",
      "/images/Huy/hotel_huy/driving.jpg"
    ]
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('/api/reviews', {
          params: {
            page: 1 // Lấy trang đầu tiên, đủ để tính trung bình
          }
        });
        const reviews = response.data.reviews.data;
        const total = response.data.reviews.total || 0;
        if (reviews && reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + parseInt(review.rating), 0);
          const avgRating = (totalRating / reviews.length).toFixed(1);
          setAverageRating(parseFloat(avgRating));
        } else {
          setAverageRating(0);
        }
        setTotalReviews(total);
      } catch (err) {
        console.error("Lỗi khi tải đánh giá:", err);
        setAverageRating(0);
        setTotalReviews(0);
      }
    };

    fetchReviews();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const openGallery = (index) => {
    setActiveImage(index);
    setShowGalleryModal(true);
  };
  const nextImage = () => setActiveImage((prev) => (prev + 1) % hotelInfo.images.length);
  const prevImage = () => setActiveImage((prev) => (prev - 1 + hotelInfo.images.length) % hotelInfo.images.length);

  // Hàm hiển thị sao (bao gồm nửa sao)
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const decimal = rating - fullStars;

    // Thêm sao đầy
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} style={{ color: '#FFD700' }}>★</span>);
    }

    // Thêm nửa sao nếu decimal từ 0.3 đến 0.7
    if (decimal >= 0.3 && decimal <= 0.7) {
      stars.push(<span key="half" style={{ color: '#FFD700' }}>✯</span>);
    } else if (decimal > 0.7) {
      stars.push(<span key="full" style={{ color: '#FFD700' }}>★</span>);
    }

    // Thêm sao rỗng để đủ 5 sao
    while (stars.length < 5) {
      stars.push(<span key={stars.length} style={{ color: '#888' }}>★</span>);
    }

    return stars;
  };

  if (isLoading) {
    return (
      <>
        <Banner title={hotelInfo.name} />
        <div className="container-huy">
          <Sitemapmini items={moonBaySitemap} />
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Banner title={hotelInfo.name} />
      <section className="hotel-section-huy">
        <div className="container-huy">
          <Sitemapmini items={moonBaySitemap} />

          <div className="overview-section-huy">
            <h2 className="h2-huy">{hotelInfo.name}</h2>
            <div className="hero-content-huy">
              <div className="row">
                <div className="col-lg-8">
                  <div className="main-image-container-huy">
                    <img src={hotelInfo.mainImage} alt={hotelInfo.name} className="main-hotel-image-huy" onClick={() => openGallery(0)} />
                    <div className="image-overlay-huy">
                      <button className="view-all-btn-huy" onClick={() => openGallery(0)}>View All Photos</button>
                    </div>
                  </div>
                  <div className="image-grid-huy">
                    {hotelInfo.images.slice(1, 6).map((image, index) => (
                      <div key={index} className="grid-image-container-huy">
                        <img src={image} alt={`${hotelInfo.name} - ${index + 1}`} className="grid-image-huy" onClick={() => openGallery(index + 1)} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="hotel-info-card-huy">
                    <h1 className="hotel-name-huy">{hotelInfo.name}</h1>
                    <div className="hotel-location-huy">📍 {hotelInfo.location}</div>
                    <div className="hotel-rating-huy">
                      <div className="stars-huy">
                        {renderStars(averageRating)}
                      </div>
                      <span className="rating-number-huy">{averageRating}</span>
                      <span className="reviews-count-huy">({totalReviews} reviews)</span>
                    </div>
                    <div className="hotel-description-huy"><p>{hotelInfo.description}</p></div>
                    <div className="hotel-price-huy">
                      <span className="price-label-huy">Starting from</span>
                      <span className="price-value-huy">{hotelInfo.price}</span>
                      <span className="price-unit-huy">/ night</span>
                    </div>
                    <Link to="/booking#booknow" className="btn btn-primary">Book Now</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="amenities-section-huy">
            <h2 className="h2-huy">Amenities</h2>
            <div className="amenities-grid-huy">
              {hotelInfo.amenities.map((amenity, index) => (
                <div key={index} className="amenity-card-huy">
                  <div className="amenity-icon-huy">{amenity.icon}</div>
                  <div className="amenity-name-huy">{amenity.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="activities-section-huy">
            <h2 className="h2-huy">Activities & Tours</h2>
            <div className="activities-intro-huy">
              <h5>Explore Nam Du with Our Exclusive Tour Activities</h5>
              <p>
              Experience the best of Nam Du Island with our curated selection of local tours and activities. Whether you're seeking adventure, culture, or relaxation, our guided experiences promise unforgettable memories amidst breathtaking island scenery.
              </p>
            </div>

            <div className="row">
              <div className="col-md-6">
                <ul className="activities-list-huy">
                  {hotelInfo.activities.map((activity, index) => (
                    <li key={index} className="activity-item-huy">
                      <span className="activity-icon-huy">{activity.icon}</span>
                      <div className="activity-text-huy">
                        <strong>{activity.name}:</strong> {activity.description}
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="tour-price-huy">
                  <strong>Tour Price:</strong> {hotelInfo.priceTour}
                </div>
                <p>👉 Please contact the front desk to register for tours and activities.</p>
              </div>
              <div className="col-md-6">
                <div className="activity-image-huy">
                  <Slider images={hotelInfo.imagesTour} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showGalleryModal && (
        <>
          <div className="gallery-overlay-huy" onClick={() => setShowGalleryModal(false)} />
          <div className="gallery-modal-huy">
            <button className="gallery-close-btn-huy" onClick={() => setShowGalleryModal(false)}>X</button>
            <div className="gallery-content-huy">
              <img src={hotelInfo.images[activeImage]} alt={`Thư viện ảnh ${activeImage + 1}`} className="gallery-main-image-huy" />
              <div className="gallery-navigation-huy">
                <button className="gallery-nav-btn-huy prev-huy" onClick={prevImage}>{"<"}</button>
                <div className="gallery-indicator-huy">{activeImage + 1} / {hotelInfo.images.length}</div>
                <button className="gallery-nav-btn-huy next-huy" onClick={nextImage}>{">"}</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Ourhotel;