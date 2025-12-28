import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Sitemapmini from "./sitemapmini";
import "../../css/Contact.css";
import "linearicons/dist/web-font/style.css";

const Contact = () => {
    const sitemap = [{ label: "Home", link: "/" }, { label: "Contact us" }];

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formError, setFormError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [validationError, setValidationError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Email validation helper
    const validateEmail = (email) => {
        // Simple regex for email validation
        return /^\S+@\S+\.\S+$/.test(email);
    };

    const validateForm = () => {
        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.subject.trim() ||
            !formData.message.trim()
        ) {
            setValidationError("All fields are required.");
            return false;
        }
        if (!validateEmail(formData.email)) {
            setValidationError("Please enter a valid email address.");
            return false;
        }
        setValidationError("");
        return true;
    };

    const contactSubmit = async (e) => {
        e.preventDefault();
        setFormError(false);
        setFormSubmitted(false);
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");
            const headers = {
                "Content-Type": "application/json",
                Accept: "application/json",
            };
            if (csrfToken) {
                headers["X-CSRF-TOKEN"] = csrfToken;
            }
            const response = await axios.post("/api/contact", formData, {
                headers,
                timeout: 10000,
            });
            if (response.data.success) {
                setFormSubmitted(true);
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                setFormError(true);
                setErrorMessage(
                    response.data.message ||
                        "Failed to send message. Please try again."
                );
            }
        } catch (error) {
            setFormError(true);
            if (error.code === "ECONNABORTED") {
                setErrorMessage("Request timed out. Please try again later.");
            } else if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage(
                    "An error occurred while sending your message. Please try again later."
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="banner">
                <img
                    src="./images/banner/about_banner.jpg"
                    alt="Banner"
                    className="banner-img"
                />
                <div className="banner-text anima-text">
                    <h1>Contact Us</h1>
                </div>
            </div>
            <div className="container mb-5">
                <Sitemapmini items={sitemap} />
                <div className="contact-container">
                    <div className="contact-header">
                        <h2>We are always ready to listen to you</h2>
                        <p>
                            Please contact us if you have any questions or
                            requests
                        </p>
                    </div>
                    <div className="contact-content">
                        <div className="contact-info-section">
                            <div className="contact-info-card">
                                <div className="info-icon">
                                    <i className="fas fa-map-marker-alt"></i>
                                </div>
                                <div className="info-content">
                                    <h3>Address</h3>
                                    <p>
                                        Nam Du Island, Kien Giang Province,
                                        Vietnam
                                    </p>
                                </div>
                            </div>
                            <div className="contact-info-card">
                                <div className="info-icon">
                                    <i className="fas fa-phone-alt"></i>
                                </div>
                                <div className="info-content">
                                    <h3>Phone</h3>
                                    <p>+84 (0) 986 555 666</p>
                                    <p className="info-note">
                                        24 hours a day, 7 days a week
                                    </p>
                                </div>
                            </div>

                            <div className="contact-info-card">
                                <div className="info-icon">
                                    <i className="fas fa-envelope"></i>
                                </div>
                                <div className="info-content">
                                    <h3>Email</h3>
                                    <p>info@moonbay.vn</p>
                                    <p className="info-note">
                                        Response within 24 hours
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="contact-form-section">
                            {formSubmitted ? (
                                <div className="success-message">
                                    <div className="success-icon">
                                        <i className="fas fa-check-circle"></i>
                                    </div>
                                    <h3>Thank you for contacting us!</h3>
                                    <p>We will respond as soon as possible.</p>
                                </div>
                            ) : (
                                <form
                                    className="contact-form"
                                    onSubmit={contactSubmit}
                                >
                                    {validationError && (
                                        <div className="error-message">
                                            <i className="fas fa-exclamation-circle"></i>
                                            <p>{validationError}</p>
                                        </div>
                                    )}
                                    {formError && (
                                        <div className="error-message">
                                            <i className="fas fa-exclamation-circle"></i>
                                            <p>{errorMessage}</p>
                                        </div>
                                    )}

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="name">Name</label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                placeholder="Enter your name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="email">Email</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                placeholder="Enter your email address"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="subject">Subject</label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            placeholder="Enter the subject of your message"
                                            required
                                            value={formData.subject}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="message">Message</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows="5"
                                            placeholder="Enter the content of your message"
                                            required
                                            value={formData.message}
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="contact-submit-button"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span>Sending...</span>
                                                <span
                                                    className="spinner-border spinner-border-sm ms-2"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Send Message</span>
                                                <i className="fas fa-paper-plane"></i>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="location-row">
                        <div className="location-column map-section">
                            <h2>Our Location</h2>
                            <div
                                style={{
                                    position: "relative",
                                    overflow: "hidden",
                                    height: "400px",
                                }}
                            >
                                <iframe
                                    src="https://www.google.com/maps/d/embed?mid=1FTMogPpDF4RFkkE6-idbOgnK0l6Xq5Y&ehbc=2E312F"
                                    width="100%"
                                    height="480px"
                                    style={{
                                        position: "absolute",
                                        top: -70,
                                        left: 0,
                                        border: 0,
                                    }}
                                    allowFullScreen
                                    loading="lazy"
                                    title="Moon Bay Hotel Map"
                                ></iframe>
                            </div>
                        </div>

                        <div className="location-column nearby-attractions">
                            <h2>Nearby Attractions</h2>
                            <div className="attractions-list">
                                <div className="attraction-item">
                                    <i className="fas fa-umbrella-beach"></i>
                                    <div className="attraction-info">
                                        <h4>Bai Cay Men Beach</h4>
                                        <p>0.5 km - 5 minutes walk</p>
                                    </div>
                                </div>

                                <div className="attraction-item">
                                    <i className="fas fa-lighthouse"></i>
                                    <div className="attraction-info">
                                        <h4>Nam Du Lighthouse</h4>
                                        <p>2 km - 10 minutes by motobike</p>
                                    </div>
                                </div>

                                <div className="attraction-item">
                                    <i className="fas fa-mountain"></i>
                                    <div className="attraction-info">
                                        <h4>Hon Mau Island</h4>
                                        <p>3 km - 15 minutes by boat</p>
                                    </div>
                                </div>

                                <div className="attraction-item">
                                    <i className="fas fa-city"></i>
                                    <div className="attraction-info">
                                        <h4>Rach Gia City</h4>
                                        <p>80 km - 2 hours by ferry</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Contact;
