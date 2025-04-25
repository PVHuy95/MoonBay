import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sitemapmini from './sitemapmini';

const Contact = () => {
  const sitemap = [
    { label: 'Home', link: '/' },
    { label: 'Contact Us' }
  ];
  return (
    <>
      <div className="banner">
        <img src="./images/banner/about_banner.jpg" alt="Banner" className='banner-img' />
        <div className='banner-text anima-text'>
          <h1>Contact Us</h1>
        </div>
      </div>
      <section className="contact_area section_gap">
        <div className="container">
        <Sitemapmini items={sitemap} />
        <br /><br />
          <div className="row ">
            <div className="col-md-12">
              <div className="mapBox">
                <iframe
                  title="Google Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.835434509374!2d-122.4194154846817!3d37.77492977975962!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858064dfd8e7b1%3A0x8f0b8e8b8b8b8b8b!2sSan%20Francisco%2C%20CA%2C%20USA!5e0!3m2!1sen!2s!4v1616161616161!5m2!1sen!2s"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <div className="contact_info">
                <div className="info_item">
                  <i className="lnr lnr-home"></i>
                  <h6>391A Nam Kỳ Khởi Nghĩa</h6>
                  <p>P. Võ Thị Sáu, Q.3, Tp. Hồ Chí Minh</p>
                </div>
                <div className="info_item">
                  <i className="lnr lnr-phone-handset"></i>
                  <h6><a href="#">0834 999 810</a></h6>
                  <p>Mon to Fri 9am to 6 pm</p>
                </div>
                <div className="info_item">
                  <i className="lnr lnr-envelope"></i>
                  <h6><a href="#">aptech.fpt@fe.edu.vn</a></h6>
                  <p>Send us your query anytime!</p>
                </div>
              </div>
            </div>
            <div className="col-md-9">
              <form
                className="row contact_form"
                action="contact_process.php"
                method="post"
                id="contactForm"
                noValidate="novalidate"
              >
                <div className="col-md-6">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      id="subject"
                      name="subject"
                      placeholder="Enter Subject"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <textarea
                      className="form-control"
                      name="message"
                      id="message"
                      rows="1"
                      placeholder="Enter Message"
                    ></textarea>
                  </div>
                </div>
                <div className="col-md-12 text-right">
                  <button type="submit" value="submit" className="btn theme_btn button_hover">
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;