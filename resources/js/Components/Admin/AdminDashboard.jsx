import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, NavLink } from 'react-router-dom';
import '../../../css/css_of_admin/AdminDashboard.css';

const AdminDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
    const location = useLocation();

    const features = ['User Management', 'Room list', 'Employee List','Edit Offer', 'Manage Bookings','Chart', 'Manage Reviews', 'Manage Complaints', 'Manage Room Info'];
    const routes = ['UserManagement', 'RoomListManagement', 'EmployeeListManagement','EditOffer', 'ManageBookings','Chart', 'ReviewsManagement', 'ManageComplaints', 'RoomManagement'];

    const isDashboardHome = location.pathname === '/admin';

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="admin-dashboard" style={{ display: 'flex' }}>
            {/* Sidebar (desktop) */}
            {isDesktop && (
                <div
                    className="sidebar d-none d-md-block"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        height: '100vh',
                        width: '220px',
                        backgroundColor: '#33393e',
                        paddingTop: '1rem',
                        zIndex: 1000,
                    }}
                >
                    <div style={{ textAlign: 'center' }}>
                        <img
                            src="/images/logo/moonbaylogo.png"
                            alt=""
                            style={{ height: '65px', borderRadius: '50%' }}
                        />
                        <div style={{ color: 'white', fontWeight: 'bold' }}>MANAGER</div>
                        <hr style={{ color: '#7d89a1' }} />
                    </div>
                    <div style={{ color: 'white', padding: '0 1rem' }}>
                        {features.map((label, i) => (
                            <div style={{ padding: '8px 0' }} key={i}>
                                <NavLink
                                    to={`/admin/${routes[i]}`}
                                    className={({ isActive }) =>
                                        isActive ? 'sidebar-link_Hung active' : 'sidebar-link_Hung'
                                    }
                                >
                                    <b>{label}</b>
                                </NavLink>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sidebar (mobile) */}
            {!isDesktop && sidebarOpen && (
                <div
                    className="mobile-sidebar-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        zIndex: 999,
                    }}
                    onClick={() => setSidebarOpen(false)}
                >
                    <div
                        className="mobile-sidebar-content"
                        style={{
                            backgroundColor: '#33393e',
                            width: '100%',
                            maxHeight: '100vh',
                            overflowY: 'auto',
                            padding: '1rem',
                            animation: 'slideDown 0.3s ease',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ color: 'white', fontWeight: 'bold' }}>MENU</div>
                            <button onClick={() => setSidebarOpen(false)} className="btn btn-light">✕</button>
                        </div>
                        <hr />
                        <div style={{ color: 'white' }}>
                            {features.map((label, i) => (
                                <div style={{ padding: '8px 0' }} key={i}>
                                    <NavLink
                                        to={`/admin/${routes[i]}`}
                                        className={({ isActive }) =>
                                            isActive ? 'sidebar-link_Hung active' : 'sidebar-link_Hung'
                                        }
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <b>{label}</b>
                                    </NavLink>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div
                className="main-content"
                style={{
                    marginLeft: isDesktop ? '220px' : '0',
                    width: '100%',
                    padding: '1rem',
                    transition: 'margin-left 0.3s ease',
                }}
            >
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    {/* Mobile menu button */}
                    {!isDesktop && (
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="btn btn-outline-dark"
                        >
                            ☰
                        </button>
                    )}

                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <b>Home page</b>
                    </Link>

                    <div>
                        <img
                            src="/images/Hung/admin.jpg"
                            alt="Admin"
                            style={{
                                width: '50px',
                                border: '2px solid black',
                                borderRadius: '50%',
                            }}
                        />
                        <b> Admin</b>
                    </div>
                </div>

                {/* Welcome section */}
                {isDashboardHome && (
                    <div align="center" style={{ padding: '2% 0' }}>
                        <h1>Welcome to Moonbay hotel management system!</h1>
                        <img
  src="/images/Hung/manager_BG.jpg"
  alt=""
  style={{
    maxWidth: '60%',
    height: 'auto',
    display: 'block', // Loại bỏ khoảng trống dưới hình ảnh
  }}
/>
                    </div>
                )}

                {/* Routing content */}
                <Outlet />
            </div>
        </div>
    );
};

export default AdminDashboard;