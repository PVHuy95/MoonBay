import { Link } from 'react-router-dom';
import '../../css/footer.css';
import React, { useState } from 'react';
import axios from '../axios-config';

const Footer = () => {

    const top = () => {
        window.scroll({
            top: 0,
            behavior: 'smooth'
        })
    }

    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await axios.post('http://localhost:8000/api/follow-email', { email });
            setMessage(response.data.message);
            setEmail('');
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.message);
            } else {
                setError('Có lỗi xảy ra.');
            }
        }
    };
    return (
        <>
            <div style={{ backgroundColor: '#04091e', color: '#6c6c6e', padding: '2% 0 0 0' }}>
                <div className='row' style={{ padding: '0 10%',"--bs-gutter-x": 0 }}>
                    <div className='col-md-6 row'>
                        <div className='col-md-2' style={{ padding: '1% 0 0 0' }}>
                            <img
                                src="/images/logo/moonbaylogo.png"
                                width="80vw"
                                height="80vw"
                                className="d-inline-block align-middle rounded-circle"
                            />
                        </div>
                        <div className='col-md-10'>
                            <div className='moonbay_footer_Hung'>
                                <b>MOONBAY HOTELS</b>
                            </div>
                            Operation: <i>Monday to Sunday</i><br />
                            Working hours: <i>24/7</i><br /> <br />
                        </div>
                    </div>
                    <div className='col-md-6'>

                        <br />
                    </div>

                    <hr style={{ height: "1px", border: '0', backgroundColor: "white" }} />
                </div>

                <div className='footer-setup'>
                    <div className='Contact_Hung'>
                        <div style={{ padding: "5%" }}><a href="tel:+84328866459"><img src="/images/Hung/hotline.jpg" alt="" style={{ height: '8vh', width: '8vh' }} /></a></div>
                        <div style={{ padding: "5%" }}><a href="https://www.facebook.com/messages/t/686987754487740?locale=vi_VN" target="_blank"> <img src="/images/Hung/mess.png" alt="" /></a></div>
                        <div style={{ padding: "5%" }}><a href="https://zalo.me/0328866459" target="_blank"><img src="/images/Hung/zalo.png" alt="" /></a></div>
                        <div style={{ padding: "5%" }}><a href='https://youtube.com/@moonbayhotels?si=M7G5aIfnOg0kOMDV' target='_blank'><img src="/images/Hung/youtube.jpg" alt="" /></a></div>
                    </div>
                    <div className='row' style={{ padding: '0 10%' }}>
                        <div className='col-md-3 Our_information_Hung'>
                            <h3 style={{ color: "white" }}>Our information</h3><br />
                            <b> Address:</b> <a href="https://www.google.com/maps/d/embed?mid=1FTMogPpDF4RFkkE6-idbOgnK0l6Xq5Y&ehbc=2E312F" target='blank'>Nam Du Island, Kien Giang Province, Vietnam. </a><br />
                            <b>Phone:</b> <a href="tel:+84328866459">+84 (0) 986 555 666</a><br />
                            <b>Email:</b> <a href="mailto:info@moonbay.vn?subject=I%20need%20help&body=I%20need%20help%20with...">Info@moonbay.vn</a><br /><br />
                        </div>

                        <div className='col-md-3'>
                            <div align="left">
                                <h3 style={{ color: "white" }}>Navigation Links</h3><br />
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
                                                to="/Rooms" onClick={top}
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
                                                to="/Booking" onClick={top}
                                            >
                                                Booking
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className="nav-link text-#6c6c6e"
                                                to="/Services" onClick={top}
                                            >
                                                Services
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className="nav-link text-#6c6c6e"
                                                to="/Contact" onClick={top}
                                            >
                                                Contact Us
                                            </Link>
                                        </li>

                                    </ul>
                                </div>

                            </div>
                        </div>

                        <div className='col-md-3'>
                            <div align="left">
                                <h3 style={{ color: "white" }}>Newsletter</h3><br />
                                For travel companies or customers interested in our information and services.
                            </div>
                            <div style={{ padding: '4% 0 0 0' }}>
                                <form onSubmit={handleSubmit}>
                                    <div className='row'>
                                        <div className='col-md-9'>
                                            <input
                                                type="email"
                                                placeholder='Your Email'
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className='col-md-3' style={{ padding: '3% 0 0 0' }}>
                                            <button className='btn button_send-hung' type="submit">Send</button>
                                        </div>
                                    </div>
                                    {message && <div style={{ color: 'green', marginTop: '10px' }}>{message}</div>}
                                    {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
                                </form>
                            </div>
                        </div>

                        <div className='col-md-3'>
                            <div align="left">
                                <h3 style={{ color: "white" }}>About Agency</h3><br />
                            </div>
                            <div >
                                Moonbay Hotel is committed to delivering a refined, comfortable, and nature-inspired stay, where every moment is complete and unforgettable. <br /><br />
                            </div>
                        </div>

                        <hr />
                        <p>
                            Copyright ©2025 All rights reserved | This website is made with <span role="img" aria-label="crown">👑</span> by <strong style={{ color: "white" }}>&nbsp;<Link to="/About#The_Brogrammers" smooth="true" duration={500} style={{ textDecoration: 'none', color: 'white' }} >
                                The Brogrammers
                            </Link></strong>
                        </p>


                    </div>
                </div>

            </div>
        </>
    );
};

export default Footer;
