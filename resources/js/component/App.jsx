import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';

import NavBar from './NavBar';
import Footer from './Footer';
import Home from './Home';
import AboutUs from './AboutUs';
import OurHotels from './ourhotels';
import Rooms from './rooms';
import ContactUsPage from './Contact.jsx';
import ServicePage from './Services';

const App = () => {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/About" element={<AboutUs />} />
        <Route path="/Ourhotels" element={<OurHotels />} />
        <Route path="/Rooms" element={<Rooms />} />
        <Route path="/Contact" element={<ContactUsPage />} />
        <Route path="/Services" element={<ServicePage />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;