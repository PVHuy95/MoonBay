import React, { useState, useEffect } from "react";
import '../../css/banner.css';
import '../../css/AboutUs.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Sitemapmini from './sitemapmini';

const images = [
    "/images/Hung/manager.jpg",
    "/images/Hung/staff_2.jpg",
    "/images/Hung/staff2.jpg",
    "/images/Hung/staff3.jpg",
    "/images/Hung/staff4.jpg",
    "/images/Hung/staff5.jpg"
];

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
    const [activeIndex, setActiveIndex] = useState(0);
    useEffect(() => {
        const intervalId = setInterval(() => {
            setActiveIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
        }, 4000);

        return () => clearInterval(intervalId);
    }, []);

    const sitemap = [
        { label: 'Home', link: '/' },
        { label: 'AboutUs' }
    ];

    React.useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const element = document.querySelector(hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, []);

    return (
        <>
            <div className="banner">
                <img src="/images/banner/about_banner.jpg" alt="Banner" className='banner-img' />
                <div className='banner-text anima-text'>
                    <h1>The Story Behind Moon Bay</h1>
                </div>
            </div>

            <div>
                <div className="container ">
                    <Sitemapmini items={sitemap} />
                    <div className="row align-items-center my-5">
                        <div className="col-md-6 mb-4 mb-md-0">
                            <h2 className="mb-3">About Moonbay Hotel</h2>
                            <p>
                                With over 20 years of experience in the hospitality industry, Moonbay Hotel is proud to be a trusted destination for both domestic and international travelers. Our reputation is built on professionalism, dedication, and attentive service. From our well-appointed rooms to our friendly and caring staff, we strive to deliver a comfortable and satisfying experience for every guest. At Moonbay, you’ll find not only a perfect place to stay but also the warm care that makes you feel right at home.
                            </p>
                        </div>
                        <div className="col-md-5 text-center">
                            <img
                                src="/images/Hung/photo1.jpg"
                                alt="Moon Bay Hotel"
                                className="img-fluid rounded shadow"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className='container'>
                <hr />
            </div>

            <div>
                <div className="container ">
                    <div className="row align-items-center my-5">
                        <div className="col-md-5 text-center">
                            <img
                                src="/images/Hung/OurMission.jpg"
                                alt="Moon Bay Hotel"
                                className="img-fluid rounded shadow"
                            />
                        </div>
                        <div className="col-md-6 mb-4 mb-md-0" style={{ textAlign: 'right' }}>
                            <h2 className="mb-3">Our Mission</h2>
                            <p>
                                At Moonbay Hotel, our mission is to provide every guest with an exceptional stay experience built on 20 years of hospitality expertise. We are committed to delivering professional, thoughtful, and personalized service in every detail—ensuring comfort, satisfaction, and lasting memories for all who walk through our doors.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='container'>
                <hr />
            </div>

            <div>
                <div className="container ">
                    <div className="row align-items-center my-5">
                        <div className="col-md-6 mb-4 mb-md-0">
                            <h2 className="mb-3">Vision</h2>
                            <p>
                                To become a leading hotel in the region, recognized for our excellence in service, warm hospitality, and enduring commitment to guest satisfaction. Moonbay Hotel aspires to be not just a place to stay, but a memorable destination where comfort meets care, and every visit feels like coming home.
                            </p>
                        </div>
                        <div className="col-md-5 text-center">
                            <img
                                src="/images/Hung/Vision.jpg"
                                alt="Moon Bay Hotel"
                                className="img-fluid rounded shadow"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className='container'>
                <hr />
            </div>

            <div>
                <div className="container ">
                    <div className="row align-items-center my-5">
                        <div className="col-md-5 text-center">
                            <img
                                src="/images/Hung/CoreValues.jpg"
                                alt="Moon Bay Hotel"
                                className="img-fluid rounded shadow"
                            />
                        </div>
                        <div className="col-md-6 mb-4 mb-md-0">
                            <h2 className="mb-3">Core Values</h2>
                            <ul>
                                <li><strong>Professionalism:</strong> We uphold the highest standards in every aspect of our service, ensuring consistency, efficiency, and excellence.</li>
                                <li><strong>Dedication:</strong> We serve with heart and commitment, always putting the needs and satisfaction of our guests first.</li>
                                <li><strong>Attentiveness:</strong> We focus on the details that matter, providing thoughtful, personalized care to create meaningful experiences.</li>
                                <li><strong>Integrity:</strong> We act with honesty, transparency, and respect in all of our relationships—with guests, colleagues, and partners.</li>
                                <li><strong>Continuous Improvement:</strong> We embrace innovation and learning, constantly seeking to improve and elevate our services.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className='container'>
                <hr />
            </div>

            <div style={{ padding: '2% 0' }}>
                <div align='center'>
                    <h1>Moonbay hotel staff</h1><br />
                </div>
                <div id="carouselExampleControls" className="carousel slide container carousel_Hung" data-bs-ride="carousel">
                    <div className="carousel-inner">
                        {images.map((image, index) => (
                            <div className={`carousel-item ${index === activeIndex ? 'active' : ''}`} key={index}>
                                <img
                                    className="d-block w-100 carousel-img"
                                    src={image}
                                    alt={`Slide ${index + 1}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ padding: '2% 0', backgroundColor: '#fff8e0' }} className="container">
                <div align='center'>
                    <h1>Service style</h1>
                    <br />
                </div>
                <div className="container row">
                    <div className="col-md-4">
                        <div>
                            🤝 <b>Serving with Heart</b> <br />
                            Every guest is treated with genuine warmth and heartfelt hospitality.
                        </div>
                        <div>
                            🌿 <b>Respect for Privacy</b> <br />
                            Your peace and personal space are always our priority.
                        </div>
                        <br />
                    </div>
                    <div className="col-md-4" style={{ padding: '0 0 2% 0' }}>
                        <img src="/images/Hung/service_hung.jpg" alt="" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                    </div>
                    <div className="col-md-4">
                        <div>
                            🕊️ <b>Elegance in Every Detail</b> <br />
                            We perfect the small things, so you can enjoy the big moments.
                        </div>
                        <div>
                            💬 <b>Always Ready to Listen</b> <br />
                            24/7 support with empathy and care for your every need.
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ padding: '2% 0' }}>
                <div align='center' style={{ padding: '2% 0' }}>
                    <h1>Commitment to customers & community</h1>
                </div>
                <div className="container row">
                    <div className="col-md-6">
                        <img src="/images/Hung/community_hung.jpg" alt="" style={{ objectFit: 'cover', width: '100%', height: '100%' }}/>
                    </div>
                    <div className="ServiceStyle_Hung1 col-md-6">
                        <div>
                            🏨 <b>Unforgettable Experiences</b> <br />
                            We are dedicated to creating memorable and personalized stays for every guest.
                        </div>
                        <div>
                            🌍 <b>Sustainable Practices</b> <br />
                            We embrace eco-friendly solutions to protect our environment and local culture.
                        </div>
                        <div>
                            ❤️ <b>Community Engagement</b> <br />
                            We perfect the small things, so you can enjoy the big moments.
                        </div>
                        <div>
                            📈 <b>Continuous Improvement</b> <br />
                            We listen, adapt, and evolve — always aiming to exceed your expectations.
                        </div>
                    </div>
                </div>
            </div>

            <hr />

            <div style={{ padding: '3% 0' }} className='group2_Hung' id='The_Brogrammers'>
                <div style={{ textAlign: 'center' }}>
                    <h2>Group 2 with the theme "MoonBay hotels" includes the following members:</h2><br />
                </div>
                <div className="row">
                    <div className='col-md-3' style={{ textAlign: 'center', padding: '0 2%' }}>
                        <img src="/images/Hung/Hung.jpg" alt="" style={{ padding: '0 0 4% 0' }} />
                        <p><b>Full name: Do Thanh Hung</b></p>
                        <p><b>Position: Project Lead</b></p>
                        <p><b>Slogan: Dare to dream big, commit to learning!</b></p>
                    </div>
                    <div className='col-md-3' style={{ textAlign: 'center', padding: '0 2%' }}>
                        <img src="/images/Hung/Huy.jpg" alt="" style={{ padding: '0 0 4% 0' }} />
                        <p><b>Full name: Phu Vinh Huy</b></p>
                        <p><b>Position: Fullstack Developer</b></p>
                        <p><b>Slogan: Make it work, make it right, make it fast.</b></p>
                    </div>
                    <div className='col-md-3' style={{ textAlign: 'center', padding: '0 2%' }}>
                        <img src="/images/Hung/Dat.png" alt="" style={{ padding: '0 0 4% 0' }} />
                        <p><b>Full name: Le Quoc Dat</b></p>
                        <p><b>Position: Developer/Tester</b></p>
                        <p><b>Slogan: Program anything you want.</b></p>
                    </div>
                    <div className='col-md-3' style={{ textAlign: 'center', padding: '0 2%' }}>
                        <img src="/images/Hung/Long.jpg" alt="" style={{ padding: '0 0 4% 0' }} />
                        <p><b>Full name: Ngo Truong Long</b></p>
                        <p><b>Position: Developer/Tester</b></p>
                        <p><b>Slogan: Bugs are friends, not enemies— debug today to succeed tomorrow.</b></p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AboutUs;