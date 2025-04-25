import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useLocation } from 'react-router-dom';
import '../../css/navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);
  const top = () => {
    window.scroll({
      top: 0,
      behavior: 'smooth'
    })
  }
  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top ${scrolled ? 'bg-dark' : 'bg-transparent'
        }`}
      style={{ transition: 'background-color 0.3s ease' }}
    >
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 text-white" to="/" onClick={top}>
          <img
            src="./images/logo/moonbaylogo.png"
            alt="Logo"
            width="60"
            height="60"
            className="d-inline-block align-middle rounded-circle"
          />
          <span className="align-middle">Moon Bay</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link
                className={`nav-link text-white ${location.pathname === '/' ? 'active' : ''}`}
                to="/" onClick={top}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link text-white ${location.pathname === '/About' ? 'active' : ''}`}
                to="/About" onClick={top}
              >
                About Us
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link text-white ${location.pathname === '/Ourhotels' ? 'active' : ''}`}
                to="/Ourhotels" onClick={top}
              >
                Our Hotels
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link text-white"
                to="/Rooms" onClick={top}
              >
                Rooms
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link text-white"
                to="#booking" onClick={top}
              >
                Booking
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link text-white"
                to="/Services" onClick={top}
              >
                Services
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link text-white"
                to="/Contact" onClick={top}
              >
                Contact Us
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link btn btn-outline-light ms-2"
                to="#login" onClick={top}
              >
                Login / Register
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;