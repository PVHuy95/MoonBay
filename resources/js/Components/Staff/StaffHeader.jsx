import React, { useContext, useState, useEffect } from 'react';
import "../../../css/css_of_staff/StaffHeader.css";
import { AuthContext } from '../AuthContext';
import { useSearch } from './SearchContext';
import { useNavigate, useLocation } from 'react-router-dom';

const StaffHeader = ({ handleSearchChange }) => {
  const { user, logout } = useContext(AuthContext);
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Hide search bar when on sidebar component routes
  const shouldHideSearchBar = location.pathname !== '/staff' && location.pathname !== '/staff/';
  
  const handleAvatarClick = () => {
    navigate('/staff/profile');
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  }

  return (
    <header className="staff-header bg-dark text-white d-flex align-items-center justify-content-between px-3 py-2">
      <div className="d-flex align-items-center" onClick={() => window.location.href = "/staff"} >
        <h4 className="mb-0">Staff Dashboard</h4>
      </div>
      <div className="d-flex align-items-center">
        {!shouldHideSearchBar && (
          <div className="search-bar me-3">
            <input
              type="text"
              className="form-control search-staff"
              placeholder="Search data..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        )}
        <div className="staff-box d-flex align-items-center" onClick={handleAvatarClick} style={{ cursor:'pointer' }}>
          <img
            src={user.avatar?.startsWith('http') ? user.avatar : `/storage/${user.avatar}`}
            alt="Avatar"
            width="40"
            height="40"
            className="staff-img"
            onError={(e) => {
              e.target.src = '/images/Dat/avatar/default.png';
            }}
          />
          <div className="staff-info">
            <p className="staff-name mb-0">{user.name}</p>
            <p className="staff-designation mb-0">{user.email}</p>
          </div>
        </div>
        <div className="logout-button ms-3">
          <button 
            className="btn btn-outline-light btn-sm" 
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt me-1"></i> Sign out
          </button>
        </div>
      </div>
    </header>
  );
};

export default StaffHeader;