import React, { useState, useContext, useRef, useEffect, Navigate } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import Cookies from 'js-cookie';
import Navbar from './Components/Navbar.jsx';
import Home from './Components/Home.jsx';
import AboutUs from './Components/AboutUs.jsx';
import OurHotels from './Components/ourhotels.jsx';
import Rooms from './Components/rooms.jsx';
import Contact from './Components/Contact.jsx';
import ServicePage from './Components/Services.jsx';
import Footer from './Components/Footer.jsx';
import Back_Top from './Components/Back_Top.jsx';
import Booking from './Components/booking.jsx';
import Login from './Components/login.jsx';
import Register from './Components/Register.jsx';
import { AuthContext, AuthProvider } from './Components/AuthContext.jsx';
import Account from './Components/account.jsx';
import ForgotPassword from './Components/ForgotPassword.jsx';
import PopupBookNow from './Components/PopupBookNow.jsx';
import NotificationManager from './Components/NotificationManager.jsx';
import ProtectedAdminRoute from './Components/ProtectedAdminRoute.jsx';
import ProtectedStaffRoute from './Components/ProtectedStaffRoute.jsx';
import ResetPassword from './Components/ResetPassword.jsx';
import AdminDashboard from './Components/Admin/AdminDashboard.jsx';
import StaffDashboard from './Components/Staff/StaffDashboard.jsx';
import { ChatbotProvider } from './Components/Chatbot.jsx';
import UserManagement from './Components/Admin/UserManagement.jsx';
import RoomListManagement from './Components/Admin/RoomListManagement.jsx';
import EmployeeListManagement from './Components/Admin/EmployeeListManagement.jsx';
import EditOffer from './Components/Admin/EditOffer.jsx';
import ReviewsManagement from './Components/Admin/ReviewsManagement.jsx';
import ManageComplaints from './Components/Admin/ManageComplaints.jsx';
import RoomManagement from './Components/Admin/RoomManagement.jsx';
import Reviews from './Components/Reviews.jsx';
import ManageBookings from './Components/Admin/ManageBookings.jsx';
import Chart from './Components/Admin/Chart.jsx';
import StaffProfile from './Components/Staff/StaffProfile.jsx';
//-----------------------------------------------------

//components staff
import StaffBookingList from './Components/Staff/StaffBookingList.jsx';
import { SearchProvider } from './Components/Staff/SearchContext.jsx'
import StaffRoomManagement from './Components/Staff/StaffRoomManagement.jsx';
import Staff_BookingRooms from './Components/Staff/Staff_BookingRooms.jsx';
import StaffCustomerManagement from './Components/Staff/StaffCustomerManagement.jsx';
import Complaints from './Components/Complaints.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaRobot } from 'react-icons/fa';
import '../css/App.css';
import StaffServiceManager from './Components/Staff/StaffServiceManager.jsx';
import ContactAdminManager from './Components/Staff/ContactAdminManager.jsx';

// PopupContext để quản lý trạng thái popup
export const PopupContext = React.createContext();

// Layout cho các route công khai
const PublicLayout = ({ children, openLoginPopup, isPopupLogin, isPopupRegister, isPopupForgotPassword, isPopupBookNow, closePopup, openRegisterPopup, openForgotPassword, selectedRoomName }) => {
    return (
        <div>
            <Navbar openLoginPopup={openLoginPopup} />
            <Login
                isPopupLogin={isPopupLogin}
                closePopup={closePopup}
                openRegisterPopup={openRegisterPopup}
                openForgotPassword={openForgotPassword}
            />
            <Register
                isPopupRegister={isPopupRegister}
                closePopup={closePopup}
                openLoginPopup={openLoginPopup}
            />
            <ForgotPassword
                closePopup={closePopup}
                openLoginPopup={openLoginPopup}
                isPopupForgotPassword={isPopupForgotPassword}
            />
            <PopupBookNow
                isPopupBookNow={isPopupBookNow}
                closePopup={closePopup}
                selectedRoomName={selectedRoomName}
            />
            <NotificationManager />
            {children}
            <Footer />
            <Back_Top />
        </div>
    );
};

// Layout cho các route admin
const AdminLayout = ({ children }) => {
    return (
        <div>
            {children}
        </div>
    );
};

// Layout cho các route staff
const StaffLayout = ({ children }) => {
    return (
        <div>
            {children}
        </div>
    );
};

const AuthHandler = () => {
    const { user, login } = useContext(AuthContext);
    const { closePopup } = useContext(PopupContext) || {};
    const location = useLocation();
    const navigate = useNavigate();
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        const userData = urlParams.get('user');
        const error = urlParams.get('error');

        if (token && userData && !user) {
            hasProcessed.current = true;
            const parsedUserData = JSON.parse(decodeURIComponent(userData));
            const authUser = { ...parsedUserData, token };
            login(authUser, token);
            window.location.href = '/';
        } else if (error) {
            console.log('Error from backend:', error);
            navigate('/', { replace: true });
            if (closePopup) closePopup();
        }
    }, [location.search, login, user, navigate, closePopup]);

    return null;
};

const App = () => {
    const [isPopupLogin, setIsPopupLogin] = useState(false);
    const [isPopupRegister, setIsPopupRegister] = useState(false);
    const [isPopupForgotPassword, setIsPopupForgotPassword] = useState(false);
    const [isPopupBookNow, setIsPopupBookNow] = useState(false);
    const [selectedRoomName, setSelectedRoomName] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const toggleChatbot = () => {
        setIsChatOpen(prev => !prev);
    };

    // Mở popup đăng nhập
    const openLoginPopup = () => {
        setIsPopupLogin(true);
        setIsPopupRegister(false);
        setIsPopupForgotPassword(false);
    };

    // Mở popup đăng ký
    const openRegisterPopup = () => {
        setIsPopupRegister(true);
        setIsPopupLogin(false);
        setIsPopupForgotPassword(false);
    };

    // Mở popup quên mật khẩu
    const openForgotPassword = () => {
        setIsPopupForgotPassword(true);
        setIsPopupLogin(false);
        setIsPopupRegister(false);
    };

    // Đóng cả hai popup
    const closePopup = () => {
        setIsPopupLogin(false);
        setIsPopupRegister(false);
        setIsPopupForgotPassword(false);
        setIsPopupBookNow(false);
    };

    const checkLogin = () => {
        const user = Cookies.get('user');
        if (!user) {
            setIsPopupLogin(true);
            return false;
        }
        return true;
    };

    const checkLogins = (roomName) => {
        if (!checkLogin()) {
            setIsPopupLogin(true);
            return false;
        }

        setIsPopupBookNow(true);
        setSelectedRoomName(roomName);
        return true;
    };

    return (
        <PopupContext.Provider value={{ closePopup }}>
            <AuthProvider>
                <ChatbotProvider isOpen={isChatOpen} setIsOpen={setIsChatOpen}>
                    <SearchProvider>
                        <Router>
                            <AuthHandler />
                            <button
                                onClick={toggleChatbot}
                                style={{
                                    position: 'fixed',
                                    bottom: '2%',
                                    right: '6%',
                                    zIndex: 10000,
                                    background: '#007bff',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '60px',
                                    height: '60px',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#0056b3";
                                    e.currentTarget.style.transform = "scale(1.1)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "#007bff";
                                    e.currentTarget.style.transform = "scale(1)";
                                }}
                            >
                                <FaRobot />
                            </button>
                            <Routes>
                                <Route path="/reset-password" element={<ResetPassword openLoginPopup={openLoginPopup} />} />
                                {/* Các route công khai */}
                                <Route
                                    path="/"
                                    element={
                                        <PublicLayout
                                            openLoginPopup={openLoginPopup}
                                            isPopupLogin={isPopupLogin}
                                            isPopupRegister={isPopupRegister}
                                            isPopupForgotPassword={isPopupForgotPassword}
                                            isPopupBookNow={isPopupBookNow}
                                            closePopup={closePopup}
                                            openRegisterPopup={openRegisterPopup}
                                            openForgotPassword={openForgotPassword}
                                            selectedRoomName={selectedRoomName}
                                        >
                                            <Home />
                                        </PublicLayout>
                                    }
                                />
                                <Route
                                    path="/booking"
                                    element={
                                        <PublicLayout
                                            openLoginPopup={openLoginPopup}
                                            isPopupLogin={isPopupLogin}
                                            isPopupRegister={isPopupRegister}
                                            isPopupForgotPassword={isPopupForgotPassword}
                                            isPopupBookNow={isPopupBookNow}
                                            closePopup={closePopup}
                                            openRegisterPopup={openRegisterPopup}
                                            openForgotPassword={openForgotPassword}
                                            selectedRoomName={selectedRoomName}
                                        >
                                            <Booking
                                                checkLogin={checkLogin}
                                                checkLogins={checkLogins}
                                                isPopupBookNow={isPopupBookNow}
                                                closePopup={closePopup}
                                            />
                                        </PublicLayout>
                                    }
                                />
                                <Route
                                    path="/account"
                                    element={
                                        <PublicLayout
                                            openLoginPopup={openLoginPopup}
                                            isPopupLogin={isPopupLogin}
                                            isPopupRegister={isPopupRegister}
                                            isPopupForgotPassword={isPopupForgotPassword}
                                            isPopupBookNow={isPopupBookNow}
                                            closePopup={closePopup}
                                            openRegisterPopup={openRegisterPopup}
                                            openForgotPassword={openForgotPassword}
                                            selectedRoomName={selectedRoomName}
                                        >
                                            <Account openLoginPopup={openLoginPopup} />
                                        </PublicLayout>
                                    }
                                />
                                <Route
                                    path="/About"
                                    element={
                                        <PublicLayout
                                            openLoginPopup={openLoginPopup}
                                            isPopupLogin={isPopupLogin}
                                            isPopupRegister={isPopupRegister}
                                            isPopupForgotPassword={isPopupForgotPassword}
                                            isPopupBookNow={isPopupBookNow}
                                            closePopup={closePopup}
                                            openRegisterPopup={openRegisterPopup}
                                            openForgotPassword={openForgotPassword}
                                            selectedRoomName={selectedRoomName}
                                        >
                                            <AboutUs />
                                        </PublicLayout>
                                    }
                                />
                                <Route
                                    path="/Ourhotels"
                                    element={
                                        <PublicLayout
                                            openLoginPopup={openLoginPopup}
                                            isPopupLogin={isPopupLogin}
                                            isPopupRegister={isPopupRegister}
                                            isPopupForgotPassword={isPopupForgotPassword}
                                            isPopupBookNow={isPopupBookNow}
                                            closePopup={closePopup}
                                            openRegisterPopup={openRegisterPopup}
                                            openForgotPassword={openForgotPassword}
                                            selectedRoomName={selectedRoomName}
                                        >
                                            <OurHotels />
                                        </PublicLayout>
                                    }
                                />
                                <Route
                                    path="/Rooms"
                                    element={
                                        <PublicLayout
                                            openLoginPopup={openLoginPopup}
                                            isPopupLogin={isPopupLogin}
                                            isPopupRegister={isPopupRegister}
                                            isPopupForgotPassword={isPopupForgotPassword}
                                            isPopupBookNow={isPopupBookNow}
                                            closePopup={closePopup}
                                            openRegisterPopup={openRegisterPopup}
                                            openForgotPassword={openForgotPassword}
                                            selectedRoomName={selectedRoomName}
                                        >
                                            <Rooms checkLogins={checkLogins} />
                                        </PublicLayout>
                                    }
                                />
                                <Route
                                    path="/Contact"
                                    element={
                                        <PublicLayout
                                            openLoginPopup={openLoginPopup}
                                            isPopupLogin={isPopupLogin}
                                            isPopupRegister={isPopupRegister}
                                            isPopupForgotPassword={isPopupForgotPassword}
                                            isPopupBookNow={isPopupBookNow}
                                            closePopup={closePopup}
                                            openRegisterPopup={openRegisterPopup}
                                            openForgotPassword={openForgotPassword}
                                            selectedRoomName={selectedRoomName}
                                        >
                                            <Contact />
                                        </PublicLayout>
                                    }
                                />
                                <Route
                                    path="/Services"
                                    element={
                                        <PublicLayout
                                            openLoginPopup={openLoginPopup}
                                            isPopupLogin={isPopupLogin}
                                            isPopupRegister={isPopupRegister}
                                            isPopupForgotPassword={isPopupForgotPassword}
                                            isPopupBookNow={isPopupBookNow}
                                            closePopup={closePopup}
                                            openRegisterPopup={openRegisterPopup}
                                            openForgotPassword={openForgotPassword}
                                            selectedRoomName={selectedRoomName}
                                        >
                                            <ServicePage />
                                        </PublicLayout>
                                    }
                                />
                                <Route
                                    path="/review"
                                    element={
                                        <PublicLayout
                                            openLoginPopup={openLoginPopup}
                                            isPopupLogin={isPopupLogin}
                                            isPopupRegister={isPopupRegister}
                                            isPopupForgotPassword={isPopupForgotPassword}
                                            isPopupBookNow={isPopupBookNow}
                                            closePopup={closePopup}
                                            openRegisterPopup={openRegisterPopup}
                                            openForgotPassword={openForgotPassword}
                                            selectedRoomName={selectedRoomName}
                                        >
                                            <Reviews checkLogins={checkLogin} />
                                        </PublicLayout>
                                    }
                                />
                                <Route
                                    path="/complaint"
                                    element={
                                        <PublicLayout
                                            openLoginPopup={openLoginPopup}
                                            isPopupLogin={isPopupLogin}
                                            isPopupRegister={isPopupRegister}
                                            isPopupForgotPassword={isPopupForgotPassword}
                                            isPopupBookNow={isPopupBookNow}
                                            closePopup={closePopup}
                                            openRegisterPopup={openRegisterPopup}
                                            openForgotPassword={openForgotPassword}
                                            selectedRoomName={selectedRoomName}
                                        >
                                            <Complaints checkLogins={checkLogin} />
                                        </PublicLayout>
                                    }
                                />
                                <Route
                                    path="*"
                                    element={
                                        <PublicLayout
                                            openLoginPopup={openLoginPopup}
                                            isPopupLogin={isPopupLogin}
                                            isPopupRegister={isPopupRegister}
                                            isPopupForgotPassword={isPopupForgotPassword}
                                            isPopupBookNow={isPopupBookNow}
                                            closePopup={closePopup}
                                            openRegisterPopup={openRegisterPopup}
                                            openForgotPassword={openForgotPassword}
                                            selectedRoomName={selectedRoomName}
                                        >
                                            <Home />
                                        </PublicLayout>
                                    }
                                />

                                {/* Route Admin */}
                                <Route
                                    path="/admin"
                                    element={
                                        <ProtectedAdminRoute>
                                            <AdminLayout>
                                                <AdminDashboard />
                                            </AdminLayout>
                                        </ProtectedAdminRoute>
                                    }
                                >
                                    <Route path="UserManagement" element={<UserManagement />} />
                                    <Route path="RoomListManagement" element={<RoomListManagement />} />
                                    <Route path="EmployeeListManagement" element={<EmployeeListManagement />} />
                                    <Route path="EditOffer" element={<EditOffer />} />
                                    <Route path="ManageBookings" element={<ManageBookings />} />
                                    <Route path="Chart" element={<Chart />} />
                                    <Route path="ReviewsManagement" element={<ReviewsManagement />} />
                                    <Route path="ManageComplaints" element={<ManageComplaints />} />
                                    <Route path="RoomManagement" element={<RoomManagement />} />
                                </Route>
                                <Route
                                    path="/admin/users"
                                    element={
                                        <ProtectedAdminRoute>
                                            <AdminLayout>
                                            </AdminLayout>
                                        </ProtectedAdminRoute>
                                    }
                                />
                                <Route
                                    path="/admin/bookings"
                                    element={
                                        <ProtectedAdminRoute>
                                            <AdminLayout>
                                            </AdminLayout>
                                        </ProtectedAdminRoute>
                                    }
                                />
                                <Route
                                    path="/admin/rooms"
                                    element={
                                        <ProtectedAdminRoute>
                                            <AdminLayout>
                                            </AdminLayout>
                                        </ProtectedAdminRoute>
                                    }
                                />

                                {/* Route Staff */}

                                <Route
                                    path="/staff"
                                    element={
                                        <ProtectedStaffRoute>
                                            <StaffLayout>
                                                <StaffDashboard />
                                            </StaffLayout>
                                        </ProtectedStaffRoute>
                                    }
                                >
                                    <Route
                                        index element={<Staff_BookingRooms />}
                                    />
                                    <Route
                                        path="BookingList"
                                        element={
                                            <StaffBookingList />
                                        }
                                    />
                                    <Route
                                        path="StaffCustomerManagement"
                                        element={
                                            <StaffCustomerManagement />
                                        }
                                    />
                                    <Route
                                        path="StaffRoomManagement"
                                        element={
                                            <StaffRoomManagement />
                                        }
                                    />
                                    {/* Thêm route mới cho profile */}
                                    <Route
                                        path="Profile"
                                        element={
                                            <StaffProfile />
                                        }
                                    />
                                </Route>

                        {/* Route Admin */}
                        <Route
                            path="/admin"
                            element={
                                <ProtectedAdminRoute>
                                    <AdminLayout>
                                        <AdminDashboard />
                                    </AdminLayout>
                                </ProtectedAdminRoute>
                            }
                        >
                        <Route path="UserManagement" element={<UserManagement />} />
                        <Route path="RoomListManagement" element={<RoomListManagement />} />
                        <Route path="EmployeeListManagement" element={<EmployeeListManagement />} />
                        <Route path="EditOffer" element={<EditOffer />} />
                        <Route path="ManageBookings" element={<ManageBookings />} />
                        <Route path="ReviewsManagement" element={<ReviewsManagement />} />
                            <Route path="ManageComplaints" element={<ManageComplaints />} />
                        <Route path="RoomManagement" element={<RoomManagement />} />
                        </Route>
                        <Route
                            path="/admin/users"
                            element={
                                <ProtectedAdminRoute>
                                    <AdminLayout>
                                    </AdminLayout>
                                </ProtectedAdminRoute>
                            }
                        />
                        <Route
                            path="/admin/bookings"
                            element={
                                <ProtectedAdminRoute>
                                    <AdminLayout>
                                    </AdminLayout>
                                </ProtectedAdminRoute>
                            }
                        />
                        <Route
                            path="/admin/rooms"
                            element={
                                <ProtectedAdminRoute>
                                    <AdminLayout>
                                    </AdminLayout>
                                </ProtectedAdminRoute>
                            }
                        />

                        {/* Route Staff */}

                        <Route
                                path="/staff"
                                element={
                                    <ProtectedStaffRoute>
                                        <StaffLayout>
                                            <StaffDashboard />
                                        </StaffLayout>
                                    </ProtectedStaffRoute>
                                }
                            >
                                <Route
                                    index element={<Staff_BookingRooms />}
                                />
                                <Route
                                    path="BookingList"
                                    element={
                                        <StaffBookingList />
                                    }
                                />
                                <Route
                                    path="StaffCustomerManagement"
                                    element={
                                        <StaffCustomerManagement />
                                    }
                                />
                                <Route
                                    path="StaffRoomManagement"
                                    element={
                                        <StaffRoomManagement />
                                    }
                                />
                                <Route
                                    path="StaffServiceManager"
                                    element={
                                        <StaffServiceManager />
                                    }
                                />
                                <Route
                                    path="ContactAdminManager"
                                    element={<ContactAdminManager />}
                                />
                                {/* Thêm route mới cho profile */}
                                <Route
                                    path="Profile"
                                    element={<StaffProfile />}
                                />
                            </Route>
                        </Routes>
                    </Router>
                </SearchProvider>
                </ChatbotProvider>
            </AuthProvider>
        </PopupContext.Provider>
    );
};

export default App;

ReactDOM.createRoot(document.getElementById('app')).render(<App />);