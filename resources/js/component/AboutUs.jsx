import React from 'react';
import '../../css/banner.css';
import '../../css/AboutUs.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import testimonialImage from '../../../public/images/Hung/user.png';
import Sitemapmini from './sitemapmini';

const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
        stars.push(<i className="bi bi-star-fill me-1" key={`full-${i}`}></i>);
    }
    if (hasHalfStar) {
        stars.push(<i className="bi bi-star-half me-1" key="half"></i>);
    }
    return stars;
};
const AboutUs = () => {
    const sitemap = [
        { label: 'Home', link: '/' },
        { label: 'Rooms' }
      ];
    return (
        <>
            <div className="banner">
                <img src="./images/banner/about_banner.jpg" alt="Banner" className='banner-img' />
                <div className='banner-text anima-text'>
                    <h1>The Story Behind Moon Bay</h1>
                </div>
            </div>
            
            <div>
                <div className="container ">
                <Sitemapmini items={sitemap} />
                    <div className="row align-items-center my-5">
                        <div className="col-md-6 mb-4 mb-md-0">
                            <h2 className="mb-3">
                                About Us <br /> Our History <br /> Mission &amp; Vision
                            </h2>
                            <p>
                                With over two decades of welcoming travelers, Moon Bay Hotel stands as a symbol of refined elegance blended with warmth and genuine hospitality. We are proud to deliver exceptional service, sophisticated spaces, and heartfelt care — creating a place where every guest finds complete relaxation and unforgettable moments.
                            </p>
                        </div>
                        <div className="col-md-5 text-center">
                            <img
                                src="./images/Hung/photo1.jpg"
                                alt="Moon Bay Hotel"
                                className="img-fluid rounded shadow"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="facilities_area section_gap">
                <div className="overlay bg-parallax" data-stellar-ratio="0.8" data-stellar-vertical-offset="0" data-background=""></div>
                <div className="container " style={{ padding: '3% 0' }}>
                    <div className="section_title text-center">
                        <h2 className="title_w">Royal Facilities</h2>
                        <p>Who are in extremely love with eco friendly system.</p>
                    </div>
                    <div className="facilities_row row mb_30">
                        {facilities.map((facility, index) => (
                            <div className="col-lg-3 col-md-5" key={index}>
                                <div className="facilities_item">
                                    <h4 className="sec_h4">
                                        <i className={`bi ${facility.icon} fs-4`}></i> {facility.title}
                                    </h4>
                                    <p>{facility.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div>
                <section className="testimonial_area section_gap py-5 bg-light">
                    <div className="container">
                        <div className="section_title text-center mb-5">
                            <h2 className="title_color">Testimonial from our Clients</h2>
                            <p>The French Revolution constituted for the conscience of the dominant aristocratic class a fall from</p>
                        </div>

                        <div id="testimonialCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="5000">

                            <div className="carousel-inner">
                                {testimonials.map((testimonial, index) => (
                                    <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={index}>
                                        <div className="d-flex flex-column align-items-center text-center">
                                            <img src={testimonialImage} alt="client" className="rounded-circle mb-4" style={{ width: '100px', height: '100px' }} />
                                            <p className="mb-3 w-75">{testimonial.text}</p>
                                            <h4 className="sec_h4 mb-2">{testimonial.name}</h4>
                                            <div className="star text-warning">
                                                {renderStars(testimonial.stars)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Controls */}
                            <button
                                className="carousel-control-prev"
                                type="button"
                                data-bs-target="#testimonialCarousel"
                                data-bs-slide="prev"
                            >
                                <span
                                    className="carousel-control-prev-icon"
                                    aria-hidden="true"
                                    style={{ filter: 'invert(1)' }}
                                ></span>
                            </button>

                            <button
                                className="carousel-control-next"
                                type="button"
                                data-bs-target="#testimonialCarousel"
                                data-bs-slide="next"
                            >
                                <span
                                    className="carousel-control-next-icon"
                                    aria-hidden="true"
                                    style={{ filter: 'invert(1)' }}
                                ></span>
                            </button>

                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}
const facilities = [
    {
        title: 'Restaurant',
        icon: 'bi-cup-straw',
        description: 'Enjoy exquisite cuisine in a relaxing and modern atmosphere.',
    },
    {
        title: 'Sports Club',
        icon: 'bi-bicycle',
        description: 'Stay active and energized with our state-of-the-art sports facilities.',
    },
    {
        title: 'Swimming Pool',
        icon: 'bi-water',
        description: 'Dive into luxury with our pristine swimming pool.',
    },
    {
        title: 'Rent a Car',
        icon: 'bi-car-front',
        description: 'Explore the city with ease using our premium car rental services.',
    },
    {
        title: 'Gymnasium',
        icon: 'bi-person-walking',
        description: 'Keep fit during your stay in our fully equipped gym.',
    },
    {
        title: 'Bar',
        icon: 'bi-cup-hot',
        description: 'Unwind with a drink at our stylish and cozy bar.',
    },
];
const testimonials = [
    {
        name: "Liam Nguyen",
        text: "The service was absolutely wonderful! The staff went above and beyond to ensure we had a great experience.",
        stars: 5
    },
    {
        name: "Emma Tran",
        text: "A cozy atmosphere and very friendly staff. I really enjoyed the spa and the garden view from my room.",
        stars: 4
    },
    {
        name: "Noah Pham",
        text: "Great location, comfortable rooms, and a delicious breakfast buffet. Will definitely come back!",
        stars: 4.5
    },
    {
        name: "Olivia Le",
        text: "The amenities were top-notch, and the pool was perfect for relaxing after a long day. Highly recommend!",
        stars: 5
    }
];


export default AboutUs;