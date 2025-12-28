import React, { useState, useEffect, useContext } from "react";
import axios from '../axios-config';
import { AuthContext } from "./AuthContext";
import { FaStar, FaRegStar } from "react-icons/fa";
import SortStart from "./SortStart";
import Banner from "./banner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sitemapmini from "./sitemapmini";

const Reviews = ({ checkLogins }) => {
  const { user, token } = useContext(AuthContext);
  const [reviewForm, setReviewForm] = useState({
    user_id: user?.id || "",
    email: user?.email || "",
    rating: "",
    comment: "",
  });
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [expandedComments, setExpandedComments] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filterRating, setFilterRating] = useState(null);
  const [ratingsCount, setRatingsCount] = useState({});
  const [totalReviews, setTotalReviews] = useState(0);
  const sitemap = [
    { label: 'Home', link: '/' },
    { label: 'Reviews' }
  ];

  const fetchReviews = async (page = 1) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // const response = await axios.get('http://localhost:8000/api/reviews'
      const response = await axios.get('/api/reviews', {
        params: {
          page,
          filter_rating: filterRating,
        },
        headers,
      });

      const paginated = response.data.reviews;
      setReviews(paginated.data);
      setLastPage(paginated.last_page);
      setRatingsCount(response.data.ratingsCount || {});
      setTotalReviews(response.data.reviews.total);
    } catch (err) {
      console.error("Error loading reviews:", err.response?.data || err.message);
      toast.error("Failed to load reviews. Please try again.");
    }
  };

  useEffect(() => {
    fetchReviews(currentPage);
  }, [currentPage, filterRating]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!reviewForm.rating || !reviewForm.comment) {
      toast.error("Please select a star rating and enter a comment!");
      return;
    }

    if (!token || token === "null" || token === "") {
      toast.error("Invalid token, please log in again!");
      return;
    }

    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(
        "http://localhost:8000/api/reviews",
        {
          user_id: user?.id,
          email: user?.email,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        },
        { headers }
      );

      toast.success("Thank you for submitting your review!");

      setCurrentPage(lastPage);
      fetchReviews(lastPage);

      setReviewForm({
        user_id: reviewForm.user_id,
        email: reviewForm.email,
        rating: "",
        comment: "",
      });
    } catch (err) {
      console.error("Error submitting review:", err.response?.data || err.message);
      if (err.response?.data?.message === 'Banned users cannot access this resource') {
        toast.error("You are banned from submitting reviews. Please contact support.");
      } else {
        toast.error("Unable to submit review. Please try again or contact support.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleComment = (id, type) => {
    setExpandedComments((prev) => ({
      ...prev,
      [`${type}-${id}`]: !prev[`${type}-${id}`],
    }));
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < lastPage) setCurrentPage(currentPage + 1);
  };

  const maskEmail = (email) => {
    if (!email) return "Customer";
    const [user, domain] = email.split("@");
    if (!domain) return "Customer";

    const visiblePart = user.slice(0, 3);
    return `${visiblePart}***@${domain}`;
  };

  const handleFilterRatingChange = (rating) => {
    setFilterRating(rating);
    setCurrentPage(1);
  };

  // StarRating Component
  const StarRating = () => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleRatingClick = (rating) => {
      setReviewForm({ ...reviewForm, rating: rating.toString() });
    };

    return (
      <div className="star-rating mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${
              star <= (hoverRating || parseInt(reviewForm.rating) || 0) ? 'filled' : ''
            }`}
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            role="button"
            tabIndex={0}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            {star <= (hoverRating || parseInt(reviewForm.rating) || 0) ? (
              <FaStar color="#F59E0B" />
            ) : (
              <FaRegStar color="#F59E0B" />
            )}
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      <Banner />
      <ToastContainer />
      <div className="container border p-4 rounded mt-4 mb-4">
        <Sitemapmini items={sitemap} />
        <h3 align="center">Customer Reviews</h3>

        {user ? (
          <form onSubmit={handleReviewSubmit} className="border p-3 rounded mb-4">
            <h5 className="text-center">Submit Your Review</h5>

            <input type="hidden" value={reviewForm.user_id} />

            <input
              type="email"
              className="form-control mb-2"
              value={reviewForm.email}
              readOnly
            />

            <StarRating />

            <textarea
              className="form-control mb-2"
              placeholder="Share your experience"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              required
              rows="3"
            ></textarea>

            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
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
            to submit your review.
          </div>
        )}

        <div>
          <p className="text-center mb-6 text-gray-700">
            Total reviews: <strong>{totalReviews}</strong>
          </p>
        </div>

        <div className="mb-3">
          <label className="me-2">Filter by star rating:</label>
          <SortStart
            selectedRating={filterRating}
            onChange={handleFilterRatingChange}
            ratingsCount={ratingsCount}
          />
        </div>

        {Array.isArray(reviews) && reviews.length > 0 ? (
          <>
            <div className="text-center">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border rounded p-3 mb-3"
                  style={{
                    height: "auto",
                    overflow: "hidden",
                    position: "relative",
                    alignContent: "center",
                  }}
                >
                  <strong>{maskEmail(review.email) || "Customer"}</strong> -{" "}
                  {[...Array(5)].map((_, i) =>
                    i < review.rating ? (
                      <FaStar key={i} color="#F59E0B" />
                    ) : (
                      <FaRegStar key={i} color="#F59E0B" />
                    )
                  )}
                  <p className="mt-2" style={{ textAlign: "center" }}>
                    {expandedComments[`comment-${review.id}`] ? (
                      <>
                        {review.comment}
                        <button
                          className="btn btn-link p-0 ms-2"
                          onClick={() => toggleComment(review.id, 'comment')}
                        >
                          Hide
                        </button>
                      </>
                    ) : (
                      <>
                        {review.comment.length > 100
                          ? `${review.comment.slice(0, 100)}...`
                          : review.comment}
                        {review.comment.length > 100 && (
                          <button
                            className="btn btn-link p-0 ms-2"
                            onClick={() => toggleComment(review.id, 'comment')}
                          >
                            Read more
                          </button>
                        )}
                      </>
                    )}
                  </p>
                  {review.admin_reply && (
                    <p className="mt-2 text-green-600" style={{ textAlign: "center" }}>
                      <b style={{ color: "red" }}>Moonbay Hotel:</b> {expandedComments[`admin_reply-${review.id}`] ? (
                        <>
                          {review.admin_reply}
                          <button
                            className="btn btn-link p-0 ms-2"
                            onClick={() => toggleComment(review.id, 'admin_reply')}
                          >
                            Hide
                          </button>
                        </>
                      ) : (
                        <>
                          {review.admin_reply.length > 100
                            ? `${review.admin_reply.slice(0, 100)}...`
                            : review.admin_reply}
                          {review.admin_reply.length > 100 && (
                            <button
                              className="btn btn-link p-0 ms-2"
                              onClick={() => toggleComment(review.id, 'admin_reply')}
                            >
                              Read more
                            </button>
                          )}
                        </>
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-center align-items-center gap-3 mt-3 mb-3">
              <button
                className="btn btn-primary"
                onClick={handlePrev}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} / {lastPage}
              </span>
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={currentPage === lastPage}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p className="mb-4">No reviews yet.</p>
        )}
      </div>

      {/* Inline CSS for StarRating */}
      <style>
        {`
          .star-rating {
            display: flex;
            gap: 5px;
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
          }
          .star {
            cursor: pointer;
            transition: transform 0.2s ease;
          }
          .star:hover {
            transform: scale(1.1);
          }
        `}
      </style>
    </>
  );
};

export default Reviews;