import React, { useState, useEffect } from "react";
import { Outlet } from 'react-router-dom';
import StaffHeader from "./StaffHeader";
import StaffSidebar from "./StaffSidebar";
import StaffFooter from "./StaffFooter";
import { useSearch } from './SearchContext';
import "simplebar-react/dist/simplebar.min.css";
import "boxicons/css/boxicons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { SearchProvider } from "./SearchContext";

const StaffDashboard = () => {
    const { searchQuery, setSearchQuery } = useSearch(); // Quản lý giá trị tìm kiếm
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Xử lý thay đổi ô tìm kiếm
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    // Xử lý thay đổi trạng thái sidebar
    const handleSidebarToggle = (isOpen) => {
        setIsSidebarOpen(isOpen);
    };
    return (
        <div className="staff-layout" style={{height: "100vh"}}>
            <StaffHeader handleSearchChange={handleSearchChange}/>
            <div className="staff-content d-flex" style={{paddingTop: "70px"}}>
                <StaffSidebar handleSearchChange={handleSearchChange} onToggle={handleSidebarToggle}/>
                <main className="flex-grow-1 staff-dashboard-main" style={{
                    height: "calc(100vh - 70px)", 
                    overflowY: "auto", /* Cho phép cuộn dọc */
                    marginLeft: isSidebarOpen ? "240px" : "90px",
                    transition: "margin-left 0.3s",
                    width: isSidebarOpen ? "calc(100% - 240px)" : "calc(100% - 90px)"
                }}><Outlet /></main>
            </div>
            <StaffFooter />
        </div>
    );
};

export default StaffDashboard;