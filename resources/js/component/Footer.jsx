import React from 'react';
import { Link } from 'react-router-dom';
import '../../css/footer.css';

const Footer = () => {
    const top = () => {
        window.scroll({
            top: 0,
            behavior: 'smooth'
        })
    }
    return (
        <>
            <div style={{ backgroundColor: '#04091e', color: '#6c6c6e', padding: '2% 0' }}>
                <div className='footer-setup'>
                    <div className='row' style={{ padding: '0 10%' }}>
                        <div className='col-md-3'>
                            <div align="left">
                                <h3 style={{color:"white"}}>About Agency</h3><br />
                            </div>
                            <div >
                                The world has become so fast paced that people don’t want to stand by reading a page of information, they would much rather look at a presentation and understand the message. It has come to a point
                            </div>
                        </div>

                        <div className='col-md-3'>
                            <div align="center">
                                <h3 style={{color:"white"}}>Navigation Links</h3><br />
                            </div>
                            <div className='row Link-setup'>
                                <div className='col-md-5 '>
                                    <ul>
                                        <li className="nav-item ">
                                            <Link className={`nav-link text-#6c6c6e ${location.pathname === '/' ? 'active' : ''}`}
                                                to="/" onClick={top}
                                            >
                                                Home
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className={`nav-link text-#6c6c6e ${location.pathname === '/About' ? 'active' : ''}`}
                                                to="/About" onClick={top}
                                            >
                                                About Us
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className={`nav-link text-#6c6c6e ${location.pathname === '/Ourhotels' ? 'active' : ''}`}
                                                to="/Ourhotels" onClick={top}
                                            >
                                                Our Hotel
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className="nav-link text-#6c6c6e"
                                                to="#Rooms" onClick={top}
                                            >
                                                Rooms
                                            </Link>
                                        </li>
                                    </ul>
                                </div>

                                <div className='col-md-6'>
                                    <ul>
                                        <li className="nav-item">
                                            <Link
                                                className="nav-link text-#6c6c6e"
                                                to="#booking" onClick={top}
                                            >
                                                Booking
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className="nav-link text-#6c6c6e"
                                                to="#services" onClick={top}
                                            >
                                                Services
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className="nav-link text-#6c6c6e"
                                                to="#contact" onClick={top} 
                                            >
                                                Contact Us
                                            </Link>
                                        </li>

                                    </ul>
                                </div>

                            </div>
                        </div>

                        <div className='col-md-2'>
                            <div align="left">
                                <h3 style={{color:"white"}}>Newsletter</h3><br />
                                For business professionals caught between high OEM price and mediocre print and graphic output
                            </div>

                        </div>

                        <div className='col-md-3'>
                            <div align="left">
                                <h3 style={{color:"white"}}>InstaFeed</h3>
                                <ul className="list_style list-unstyled d-flex flex-wrap">
                                    <li><img src="./images/Hung/Image-01.jpg" alt="" /></li>
                                    <li><img src="./images/Hung/Image-02.jpg" alt="" /></li>
                                    <li><img src="./images/Hung/Image-03.jpg" alt="" /></li>
                                    <li><img src="./images/Hung/Image-04.jpg" alt="" /></li>
                                    <li><img src="./images/Hung/Image-05.jpg" alt="" /></li>
                                    <li><img src="./images/Hung/Image-06.jpg" alt="" /></li>
                                    <li><img src="./images/Hung/Image-07.jpg" alt="" /></li>
                                    <li><img src="./images/Hung/Image-08.jpg" alt="" /></li>
                                </ul>
                            </div>
                            <br /><br />
                        </div>
                        
                        <hr />
                        <p>
                            Copyright ©2025 All rights reserved | This website is made with <span role="img" aria-label="crown">👑</span> by <strong style={{color:"white"}}>&nbsp;The Brogrammers</strong>
                        </p>


                    </div>
                </div>
            </div>
        </>
    );
};

export default Footer;
