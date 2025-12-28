import React, { useContext, useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/navbar.css';

const Navbar = ({ openLoginPopup }) => {
  const { user, logout, isAdmin, isStaff } = useContext(AuthContext);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 991);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setIsAtTop(currentScrollY === 0);
    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth <= 991);
  }, []);

  const handleToggle = () => {
    setIsMenuOpen((prev) => {
      const navbarCollapse = document.getElementById('navbarNav');
      const newState = !prev;
      if (newState) {
        navbarCollapse.classList.add('show');
      } else {
        navbarCollapse.classList.remove('show');
      }
      return newState;
    });
  };

  useEffect(() => {
    const handleScrollDebounced = () => {
      requestAnimationFrame(handleScroll);
    };
    window.addEventListener('scroll', handleScrollDebounced);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScrollDebounced);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleScroll, handleResize]);

  const handleLogout = () => {
    const banner = document.querySelector('.banner');
    if (banner) {
      banner.style.display = 'block';
    }
    logout();
  };

  const top = () => {
    window.scroll({
      top: 0,
      behavior: 'smooth',
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    var dropdownTrigger = document.getElementById("userDropdown");
    dropdownTrigger.addEventListener("click");
  });

  const isLocalAccount = user && user.provider !== 'google';

  return (
    <nav
      className={`navbar navbar-expand-lg sticky-top ${isVisible ? 'visible' : 'hidden'} ${isAtTop && !isMenuOpen ? 'navbar-transparent' : 'navbar-colored'
        }`}
      style={{ transition: 'top 0.3s', top: isVisible ? '0' : '-80px' }}
    >
      <div className="container container-navbar">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/" onClick={top}>
          <img
            src="/images/logo/moonbaylogo.png"
            alt="Logo"
            width="60"
            height="60"
            className="d-inline-block align-middle rounded-circle"
          />
          <span className="align-middle text-white">Moon Bay</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          //data-bs-toggle="collapse" //tạm thời tắt để kiểm tra logic thủ công
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
          onClick={handleToggle}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={top}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/About" className="nav-link" onClick={top}>
                About Us
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/Ourhotels" className="nav-link" onClick={top}>
                Our Hotel
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/Rooms" className="nav-link" onClick={top}>
                Rooms
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/booking" className="nav-link" onClick={top}>
                Booking
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/Services" className="nav-link" onClick={top}>
                Services
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/Contact" className="nav-link" onClick={top}>
                Contact Us
              </Link>
            </li>
            {isMobile ? (
              <>
                <li className="nav-item">
                  <Link to="/review" className="nav-link" onClick={top}>
                    Review
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/complaint" className="nav-link" onClick={top}>
                    Complaint
                  </Link>
                </li>
              </>
            ) : (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="feedbackDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Feedback
                </a>
                <ul className="dropdown-menu" aria-labelledby="feedbackDropdown">
                  <li>
                    <Link className="dropdown-item" to="/review" onClick={top}>
                      Review
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/complaint" onClick={top}>
                      Complaint
                    </Link>
                  </li>
                </ul>
              </li>
            )}
            {user && isAdmin() && (
              <li className="nav-item">
                <Link to="/admin" className="nav-link" onClick={top}>
                  Admin Dashboard
                </Link>
              </li>
            )}
            {user && isStaff() && (
              <li className="nav-item">
                <Link to="/staff" className="nav-link" onClick={top}>
                  Staff Dashboard
                </Link>
              </li>
            )}
            {user ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  href="#"
                  id="userDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  onClick={() => document.getElementById("userDropdownMenu").classList.toggle("show")}
                >
                  <img
                    // src={isLocalAccount ? `/storage/${user.avatar}` : user.avatar}
                    src={user.avatar || '/images/Dat/avatar/default.png'}
                    alt="Avatar"
                    width="40"
                    height="40"
                    className="rounded-circle me-1"
                    onError={(e) => (e.target.src = '/images/Dat/avatar/default.png')}
                  />
                  <span className="user-name text-white">{user.name}</span>
                </a>
                <ul id="userDropdownMenu" className="dropdown-menu dropdown-menu-account" aria-labelledby="userDropdown">
                  <li>
                    <Link className="dropdown-item" to="/account">
                      Account
                    </Link>
                  </li>
                  <li>
                    <Link to="/" className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </Link>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item">
                <button
                  className="nav-link btn btn-outline-light ms-2"
                  onClick={openLoginPopup}
                >
                  Login / Register
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;