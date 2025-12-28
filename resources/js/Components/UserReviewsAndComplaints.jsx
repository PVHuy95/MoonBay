import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from './AuthContext';
import axios from "axios";
import dayjs from "dayjs";

const UserReviewsAndComplaints = () => {
    const { user } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    // Lấy danh sách reviews
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return; // Không fetch nếu user chưa sẵn sàng
        }

        const fetchReviews = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/reviews/${user.id}`);
                if (response.data.success && Array.isArray(response.data.data)) {
                    setReviews(response.data.data);
                } else {
                    console.warn("Invalid reviews data:", response.data);
                    setReviews([]);
                    window.showNotification("No reviews data available", "warning");
                }
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
                setReviews([]);
                window.showNotification("Error loading reviews", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [user]);

    // Lấy danh sách complaints
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return; // Không fetch nếu user chưa sẵn sàng
        }

        const fetchComplaints = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`/api/complaints/${user.id}`);
            if (response.data.success && Array.isArray(response.data.data)) {
                setComplaints(response.data.data);
            } else {
                console.warn("Invalid complaints data:", response.data);
                setComplaints([]);
                window.showNotification("No complaints data available", "warning");
            }
        } catch (error) {
            console.error("Failed to fetch complaints:", error);
            setComplaints([]);
            window.showNotification("Error loading complaints", "error");
        } finally {
            setLoading(false);
        }
    };

        fetchComplaints();
    }, [user]);

    if (loading) {
        return <div>Loading reviews and complaints...</div>;
    }

    return (
        <div className="user-reviews">
            <h3>My Reviews & Complaints</h3>
            <div className="reviews-complaints-container">
                {/* Cột trái: Danh sách reviews */}
                <div className="reviews-column">
                    <h4>Reviews</h4>
                    {reviews.length === 0 ? (
                        <p>You have not submitted any reviews yet.</p>
                    ) : (
                        <div className="reviews-list">
                            {reviews.map((review) => (
                                <div key={review.id} className="review-card">
                                    <div className="review-header">
                                        <span className="review-date">
                                            {dayjs(review.created_at).format("DD/MM/YYYY")}
                                        </span>
                                        <span className="review-rating">
                                            {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                                        </span>
                                    </div>
                                    <p className="review-comment">{review.comment || "No comment"}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cột phải: Danh sách complaints */}
                <div className="complaints-column">
                    <h4>Complaints</h4>
                    {complaints.length === 0 ? (
                        <p>You have not submitted any complaints yet.</p>
                    ) : (
                        <div className="complaints-list">
                            {complaints.map((complaint) => (
                                <div key={complaint.id} className="complaint-card">
                                    <div className="complaint-header">
                                        <span className="complaint-date">
                                            {dayjs(complaint.created_at).format("DD/MM/YYYY")}
                                        </span>
                                        <span className="complaint-rating">
                                            {"★".repeat(complaint.rating) + "☆".repeat(5 - complaint.rating)}
                                        </span>
                                    </div>
                                    <p className="complaint-room">
                                        <strong>Complaint Type:</strong> {complaint.complaint_type}
                                    </p>
                                    <p className="complaint-comment">
                                        <strong>Description:</strong>
                                        {complaint.description || "No description"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserReviewsAndComplaints;