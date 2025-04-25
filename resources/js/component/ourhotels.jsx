import React, { useState, useEffect } from 'react';
import Banner from './banner';
import '../../css/ourhotel.css';
import Sitemapmini from './sitemapmini';

const Ourhotel = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const moonBaySitemap = [
    { label: 'Home', link: '/' },
    { label: 'Moon Bay Hotel' }
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
    rating: 5,
    reviews: 256,
    price: "2,500,000 VND",
    amenities: [
      { name: "Free Wifi", icon: "📶" },
      { name: "Infinity Pool", icon: "🏊" },
      { name: "Fine Dining Restaurant", icon: "🍴" },
      { name: "Modern Gym", icon: "🏋️" },
      { name: "Smart TV", icon: "📺" },
      { name: "Bar & Cafe", icon: "☕" },
      { name: "Air Conditioning", icon: "❄️" }
    ],
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const openGallery = (index) => {
    setActiveImage(index);
    setShowGalleryModal(true);
  };

  const nextImage = () => setActiveImage((prev) => (prev + 1) % hotelInfo.images.length);
  const prevImage = () => setActiveImage((prev) => (prev - 1 + hotelInfo.images.length) % hotelInfo.images.length);

  if (isLoading) {
    return (
      <>
        <Banner title={hotelInfo.name} />
        <div className="container-huy">
          <Sitemapmini items={moonBaySitemap} />
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
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
                        {[...Array(5)].map((_, i) => (
                          <span key={i} style={{ color: i < Math.floor(hotelInfo.rating) ? '#FFD700' : '#888' }}>★</span>
                        ))}
                      </div>
                      <span className="rating-number-huy">{hotelInfo.rating}</span>
                      <span className="reviews-count-huy">({hotelInfo.reviews} reviews)</span>
                    </div>
                    <div className="hotel-description-huy"><p>{hotelInfo.description}</p></div>
                    <div className="hotel-price-huy">
                      <span className="price-label-huy">Starting from</span>
                      <span className="price-value-huy">{hotelInfo.price}</span>
                      <span className="price-unit-huy">/ night</span>
                    </div>
                    <a href="#booking-section" className="btn btn-primary">Book Now</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="amenities-section-huy">
            <h2 className="h2-huy">Amenities & Services</h2>
            <div className="amenities-grid-huy">
              {hotelInfo.amenities.map((amenity, index) => (
                <div key={index} className="amenity-card-huy">
                  <div className="amenity-icon-huy">{amenity.icon}</div>
                  <div className="amenity-name-huy">{amenity.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="location-section-huy">
            <h2 className="h2-huy">Location</h2>
            <div className="row">
              <div className="col-md-6">
                <div className="map-container-huy">
                  <div className="map-placeholder-huy">
                    <div style={{ position: 'relative', height: 400, overflow: 'hidden' }}>
                      <iframe
                        src="https://www.google.com/maps/d/embed?mid=1FTMogPpDF4RFkkE6-idbOgnK0l6Xq5Y&ehbc=2E312F"
                        width="100%"
                        height="500"
                        style={{ position: 'absolute', top: -65, left: 0, border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        title="Moon Bay Hotel Map"
                      ></iframe>
                    </div>

                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="location-details-huy">
                  <h3>Nearby Places</h3>
                  <div className="nearby-places-huy">
                    <div className="place-item-huy">Hon Lon Beach: 0.5 km - 5-minute walk</div>
                    <div className="place-item-huy">Nam Du Lighthouse: 2 km - 10-minute boat ride</div>
                    <div className="place-item-huy">Hon Mau Island: 3 km - 15-minute boat ride</div>
                    <div className="place-item-huy">Rach Gia City: 80 km - 2-hour ferry ride</div>
                  </div>
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
              <img src={hotelInfo.images[activeImage]} alt={`Gallery ${activeImage + 1}`} className="gallery-main-image-huy" />
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
