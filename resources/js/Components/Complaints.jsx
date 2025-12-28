import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import Banner from "./banner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sitemapmini from "./sitemapmini";

const Complaints = ({ checkLogins }) => {
  const { user, token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    user_id: user?.id || "",
    name: user?.name || "",
    customer_email: user?.email || "",
    customer_phone: user?.phone || "",
    complaint_type: "",
    description: "",
    contact_preference: false,
  });
  const [loading, setLoading] = useState(false);
  const [hasActiveBooking, setHasActiveBooking] = useState(null);

  const sitemap = [
    { label: "Home", link: "/" },
    { label: "Complaints" },
  ];

  // Check active booking and check-in status
  useEffect(() => {
    if (user && token) {
      const checkActiveBooking = async () => {
        try {
          const response = await axios.get(`/api/bookings/active/${user.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setHasActiveBooking(response.data.hasActiveBooking);
        } catch (err) {
          console.error("Error checking active booking:", err);
          setHasActiveBooking(false);
          toast.error("Cannot check booking status.");
        }
      };
      checkActiveBooking();
    }
  }, [user, token]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      user_id: user?.id || "",
      name: user?.name || "",
      customer_email: user?.email || "",
      customer_phone: user?.phone || "",
    }));
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "Yes" : "No") : value,
    }));
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();

    if (!formData.complaint_type || !formData.description) {
      toast.error("Please select a complaint type and enter the content!");
      return;
    }

    if (!token || token === "null" || token === "") {
      toast.error("Invalid token. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      console.log("Data sent:", formData);

      await axios.post(
        "/api/complaints",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Complaint submitted successfully!");

      setFormData((prev) => ({
        ...prev,
        complaint_type: "",
        description: "",
        contact_preference: false,
      }));
    } catch (err) {
      console.error("Error submitting complaint:", err);
      if (err.response?.status === 403) {
        toast.error(
          "You can only submit a complaint after check-in and during your stay."
        );
      } else {
        toast.error("Submission failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Banner />
      <ToastContainer />
      <div className="container border p-4 rounded mt-4 mb-4">
        <Sitemapmini items={sitemap} />
        <h4 align="center">Complaints</h4>

        {user ? (
          hasActiveBooking === null ? (
            <div className="alert alert-info" align="center">
              Checking booking status...
            </div>
          ) : hasActiveBooking ? (
            <form onSubmit={handleComplaintSubmit}>
              <div className="mb-2">
                <input
                  type="hidden"
                  name="user_id"
                  value={formData.user_id}
                  readOnly
                  className="form-control"
                />
              </div>

              <div className="mb-2">
                <label>Full Name:</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  readOnly
                />
              </div>

              <div className="mb-2">
                <label>Email:</label>
                <input
                  type="email"
                  name="customer_email"
                  className="form-control"
                  value={formData.customer_email}
                  readOnly
                />
              </div>

              <div className="mb-2">
                <label>Phone Number:</label>
                <input
                  type="text"
                  name="customer_phone"
                  className="form-control"
                  value={formData.customer_phone}
                  readOnly
                />
              </div>

              <div className="mb-2">
                <label>Complaint Type:</label>
                <select
                  name="complaint_type"
                  className="form-select"
                  value={formData.complaint_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Type --</option>
                  <option value="Room">Room</option>
                  <option value="Payment">Payment</option>
                  <option value="Staff Attitude">Staff Attitude</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-2">
                <label>Complaint Details:</label>
                <textarea
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  required
                ></textarea>
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="contact_preference"
                  checked={formData.contact_preference === "Yes"}
                  onChange={handleChange}
                  id="contactPreference"
                />
                <label className="form-check-label" htmlFor="contactPreference">
                  I would like to be contacted back
                </label>
              </div>

              <button type="submit" className="btn btn-danger w-100" disabled={loading}>
                {loading ? "Submitting..." : "Submit Complaint"}
              </button>
            </form>
          ) : (
            <div className="alert alert-warning" align="center">
              You can only submit a complaint after check-in and during your stay.
            </div>
          )
        ) : (
          <div className="alert alert-info" align="center">
            Please{" "}
            <button
              onClick={checkLogins}
              className="btn btn-link p-0"
              style={{ textDecoration: "none" }}
            >
              log in
            </button>{" "}
            to submit a complaint.
          </div>
        )}
      </div>
    </>
  );
};

export default Complaints;