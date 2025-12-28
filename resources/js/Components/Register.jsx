import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import '../../css/my_css/Register.css';

export default function Register({ isPopupRegister, closePopup, openLoginPopup }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Regex for validation
        const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/u;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)[A-Za-z\d\W]{8,16}$/;
        const phoneRegex = /^\d{10,15}$/;
        
        let isValid = true;
        const newErrors = {};

        // Validate Name
        if (!nameRegex.test(name)) {
            isValid = false;
            newErrors.name = "Name must not contain special characters and can include Vietnamese diacritics.";
        }

        // Validate Phone
        if (!phone) {
            isValid = false;
            newErrors.phone = "Phone number is required.";
        } else if (!phoneRegex.test(phone)) {
            isValid = false;
            newErrors.phone = "Phone number must contain only digits and be 10 to 15 digits long.";
        }

        // Validate Password
        if (!passwordRegex.test(password)) {
            isValid = false;
            newErrors.password = "Password must be 8 to 16 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.";
        }

        // Validate Confirm Password
        if (password !== confirmPassword) {
            isValid = false;
            newErrors.confirmPassword = "Passwords do not match.";
        }

        setErrors(newErrors); // Set errors to show in UI

        if (!isValid) return; // Stop form submission if validation fails

        // Submit data to backend
        try {
            const response = await axios.post("/api/register", {
                name,
                email,
                phone,
                password,
            });
            if (response.status === 201) {
                window.showNotification("Registered successfully!", "success");
                openLoginPopup();
            }
        } catch (error) {
            alert(error.response?.data?.message || "Error during registration.");
        }
    };

    return (
        <>
            {isPopupRegister && (
                <div className="popup-overlay" onClick={(e) => e.target.classList.contains("popup-overlay") && closePopup()}>
                    <div className="popup-content">
                        <button className="close-popup-btn" onClick={closePopup} style={{ color: 'black' }} >&times;</button>
                        <h2>Register</h2>
                        <form onSubmit={handleSubmit}>
                            {[
                                { label: "Name", type: "text", value: name, onChange: setName, error: errors.name },
                                { label: "Email", type: "email", value: email, onChange: setEmail, error: errors.email },
                                { label: "Phone", type: "text", value: phone, onChange: setPhone, error: errors.phone },
                                { label: "Password", type: "password", value: password, onChange: setPassword, error: errors.password },
                                { label: "Confirm Password", type: "password", value: confirmPassword, onChange: setConfirmPassword, error: errors.confirmPassword },
                            ].map(({ label, type, value, onChange, error }, idx) => (
                                <label key={idx}>
                                    {label}:
                                    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
                                    {error && <div className="error-message">{error}</div>}
                                </label>
                            ))}
                            <button type="submit">Register</button>
                        </form>
                        <p>
                            Already have an account?{" "}
                            <Link onClick={openLoginPopup}>Login Now</Link>
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}