import React from 'react';
import '../../css/banner.css';

const Banner = ({title = "Welcome to Moon Bay hotel"}) => {
  return (
    <div className="banner">
      <img src="/images/banner/about_banner.jpg" alt="Banner" className='banner-img' />
      <div className='banner-text anima-text'>
        <h1>{title}</h1>
      </div>
    </div>
  );
};

export default Banner;
