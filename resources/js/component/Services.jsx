import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Sitemapmini from './sitemapmini';

const Services = () => {
  const sitemap = [
    { label: 'Home', link: '/' },
    { label: 'Services' }
  ];
  return (
    <>
    <div className="banner">
        <img src="./images/banner/about_banner.jpg" alt="Banner" className='banner-img' />
        <div className='banner-text anima-text'>
          <h1>Services</h1>
        </div>
      </div>
      {/* Special Accomodation Section */}
      <section className="accomodation_area section_gap">
        <div className="container">
        <Sitemapmini items={sitemap} />
          <div className="section_title text-center">
            <h2 className="title_color">Special Accomodation</h2>
            <p>
              We all live in an age that belongs to the young at heart. Life
              that is becoming extremely fast,
            </p>
          </div>
          <div className="row mb_30">
            {[
              {
                img: "./images/Long/Service/room1.jpg",
                title: "Double Deluxe Room",
                price: "$250",
              },
              {
                img: "./images/Long/Service/room2.jpg",
                title: "Single Deluxe Room",
                price: "$200",
              },
              {
                img: "./images/Long/Service/room3.jpg",
                title: "Honeymoon Suit",
                price: "$750",
              },
              {
                img: "./images/Long/Service/room4.jpg",
                title: "Economy Double",
                price: "$200",
              },
            ].map((room, index) => (
              <div className="col-lg-3 col-sm-6" key={index}>
                <div className="accomodation_item text-center">
                  <div className="hotel_img">
                    <img src={room.img} alt={room.title} />
                    <a href="#" className="btn theme_btn button_hover">
                      Book Now
                    </a>
                  </div>
                  <a href="#">
                    <h4 className="sec_h4">{room.title}</h4>
                  </a>
                  <h5>
                    {room.price}
                    <small>/night</small>
                  </h5>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Table Section */}
      <section className="hotel_booking_area">
        <div className="container">
          <div className="row hotel_booking_table">
            <div className="col-md-3">
              <h2>
                Book
                <br /> Your Room
              </h2>
            </div>
            <div className="col-md-9">
              <div className="boking_table">
                <div className="row">
                  <div className="col-md-4">
                    <div className="book_tabel_item">
                      <div className="form-group">
                        <div className="input-group date" id="datetimepicker11">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Arrival Date"
                          />
                          <span className="input-group-addon">
                            <i className="fa fa-calendar" aria-hidden="true"></i>
                          </span>
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="input-group date" id="datetimepicker1">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Departure Date"
                          />
                          <span className="input-group-addon">
                            <i className="fa fa-calendar" aria-hidden="true"></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="book_tabel_item">
                      <div className="input-group">
                        <select className="wide">
                          <option data-display="Adult">Adult</option>
                          <option value="1">Old</option>
                          <option value="2">Younger</option>
                          <option value="3">Potato</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <select className="wide">
                          <option data-display="Child">Child</option>
                          <option value="1">Child</option>
                          <option value="2">Baby</option>
                          <option value="3">Child</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="book_tabel_item">
                      <div className="input-group">
                        <select className="wide">
                          <option data-display="Child">Number of Rooms</option>
                          <option value="1">Room 01</option>
                          <option value="2">Room 02</option>
                          <option value="3">Room 03</option>
                        </select>
                      </div>
                      <a className="book_now_btn button_hover" href="#">
                        Book Now
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Normal Accomodation Section */}
      <section className="accomodation_area section_gap">
        <div className="container">
          <div className="section_title text-center">
            <h2 className="title_color">Normal Accomodation</h2>
            <p>
              We all live in an age that belongs to the young at heart. Life
              that is becoming extremely fast,
            </p>
          </div>
          <div className="row accomodation_two">
            {[
              {
                img: "./images/Long/Service/room1.jpg",
                title: "Double Deluxe Room",
                price: "$250",
              },
              {
                img: "./images/Long/Service/room2.jpg",
                title: "Single Deluxe Room",
                price: "$200",
              },
              {
                img: "./images/Long/Service/room3.jpg",
                title: "Honeymoon Suit",
                price: "$750",
              },
              {
                img: "./images/Long/Service/room4.jpg",
                title: "Economy Double",
                price: "$200",
              },
            ].map((room, index) => (
              <div className="col-lg-3 col-sm-6" key={index}>
                <div className="accomodation_item text-center">
                  <div className="hotel_img">
                    <img src={room.img} alt={room.title} />
                    <a href="#" className="btn theme_btn button_hover">
                      Book Now
                    </a>
                  </div>
                  <a href="#">
                    <h4 className="sec_h4">{room.title}</h4>
                  </a>
                  <h5>
                    {room.price}
                    <small>/night</small>
                  </h5>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;