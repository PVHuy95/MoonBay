import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import axios from '../../axios-config';
import { FaStar, FaRegStar } from 'react-icons/fa';
import SortStart from '../SortStart';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReviewsManagement = () => {
    const { token } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [expandedComments, setExpandedComments] = useState({});
    const [sortRating, setSortRating] = useState('');
    const [filterRating, setFilterRating] = useState(null);
    const [ratingsCount, setRatingsCount] = useState({});
    const [totalReviews, setTotalReviews] = useState(0);
    const [replyText, setReplyText] = useState({});
    const [showBanModal, setShowBanModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [banLoading, setBanLoading] = useState(false);
    const [bannedUsers, setBannedUsers] = useState(new Set());

    const fetchReviews = async (pageNumber = 1) => {
        setLoading(true);
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get('http://localhost:8000/api/admin/reviews', {
                params: {
                    page: pageNumber,
                    sort_rating: sortRating,
                    filter_rating: filterRating,
                },
                headers,
            });
            setReviews(res.data.reviews.data);
            setPage(res.data.reviews.current_page);
            setLastPage(res.data.reviews.last_page);
            setTotalReviews(res.data.reviews.total);
            setRatingsCount(res.data.ratingsCount || {});
            const bannedUserIds = res.data.reviews.data
                .filter(review => review.user?.is_banned)
                .map(review => review.user_id);
            setBannedUsers(new Set(bannedUserIds));
        } catch (error) {
            console.error('Error loading reviews:', error.response?.data || error.message);
            toast.error("Failed to load reviews. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                await axios.delete(`http://localhost:8000/api/reviews/${id}`, { headers });
                toast.success("Review deleted successfully!");
                fetchReviews(page);
            } catch (error) {
                console.error('Deletion failed:', error.response?.data || error.message);
                toast.error("Failed to delete review. Please try again.");
            }
        }
    };

    const handleReply = async (reviewId) => {
        const reply = replyText[reviewId] || '';
        if (!reply.trim()) {
            toast.error("Please enter a reply!");
            return;
        }
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.post(`http://localhost:8000/api/admin/reviews/${reviewId}/reply`, { admin_reply: reply }, { headers });
            toast.success(response.data.message || "Reply submitted successfully!");
            setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
            fetchReviews(page);
        } catch (error) {
            console.error('Error submitting reply:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to submit reply. Please try again.");
        }
    };

    const handleBanUser = async () => {
        if (!selectedUserId) return;

        setBanLoading(true);
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.post(`http://localhost:8000/api/admin/users/${selectedUserId}/ban`, {}, { headers });
            toast.success(response.data.message || "User has been banned and can no longer submit reviews!");
            setBannedUsers((prev) => new Set(prev).add(selectedUserId));
            fetchReviews(page);
        } catch (error) {
            console.error('Ban failed:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || "Failed to ban user. Please try again.";
            if (error.response?.status === 409) {
                toast.error("User is already banned and cannot submit reviews.");
                setBannedUsers((prev) => new Set(prev).add(selectedUserId));
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setBanLoading(false);
            setShowBanModal(false);
            setSelectedUserId(null);
        }
    };

    const handleUnbanUser = async (userId) => {
        if (window.confirm('Are you sure you want to unban this user?')) {
            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const response = await axios.post(`http://localhost:8000/api/admin/users/${userId}/unban`, {}, { headers });
                toast.success(response.data.message || "User has been unbanned and can now submit reviews!");
                setBannedUsers((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(userId);
                    return newSet;
                });
                fetchReviews(page);
            } catch (error) {
                console.error('Unban failed:', error.response?.data || error.message);
                toast.error(error.response?.data?.message || "Failed to unban user. Please try again.");
            }
        }
    };

    const openBanModal = (userId) => {
        setSelectedUserId(userId);
        setShowBanModal(true);
    };

    const closeBanModal = () => {
        setShowBanModal(false);
        setSelectedUserId(null);
    };

    useEffect(() => {
        fetchReviews(page);
    }, [page, sortRating, filterRating]);

    const handlePrev = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNext = () => {
        if (page < lastPage) setPage(page + 1);
    };

    const toggleComment = (id, type) => {
        setExpandedComments((prev) => ({
            ...prev,
            [`${type}-${id}`]: !prev[`${type}-${id}`],
        }));
    };

    const handleSortChange = (e) => {
        setSortRating(e.target.value);
        setPage(1);
    };

    const handleFilterRatingChange = (rating) => {
        setFilterRating(rating);
        setPage(1);
    };

    return (
        <div className="p-4 bg-light min-vh-100">
            <ToastContainer />
            <h1 className="display-5 fw-bold mb-4 text-center">Manage Reviews</h1>

            <div className="row mb-4">
                <div className="col-md-6">
                    <label className="me-2">Sort by rating:</label>
                    <select
                        value={sortRating}
                        onChange={handleSortChange}
                        className="form-select w-auto d-inline-block"
                    >
                        <option value="">Default</option>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>
                <div className="col-md-6">
                    <label className="me-2">Filter by rating:</label>
                    <SortStart selectedRating={filterRating} onChange={handleFilterRatingChange} ratingsCount={ratingsCount} />
                </div>
            </div>

            {loading ? (
                <p className="text-center">Loading data...</p>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="table table-striped table-hover table-bordered">
                            <thead className="table-light">
                                <tr>
                                    <th className="py-3 text-start" scope="col">ID</th>
                                    <th className="py-3 text-start" scope="col">UserID</th>
                                    <th className="py-3 text-start" scope="col">Email</th>
                                    <th className="py-3 text-start" scope="col">Rating</th>
                                    <th className="py-3 text-start" scope="col">Comment</th>
                                    <th className="py-3 text-start" scope="col">Admin Reply</th>
                                    <th className="py-3 text-start" scope="col">Date</th>
                                    <th className="py-3 text-start" scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map((review) => (
                                    <tr key={review.id} className="align-middle">
                                        <td className="py-2 text-center">{review.id}</td>
                                        <td className="py-2 text-center">{review.user_id}</td>
                                        <td className="py-2 text-center text-truncate" style={{ maxWidth: '150px' }}>{review.email}</td>
                                        <td className="py-2 text-center" style={{ minWidth: '100px' }}>
                                            <div className="d-flex justify-content-center align-items-center">
                                                {[...Array(5)].map((_, i) =>
                                                    i < review.rating ? (
                                                        <FaStar key={i} color="#F59E0B" />
                                                    ) : (
                                                        <FaRegStar key={i} color="#F59E0B" />
                                                    )
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-2 text-center" style={{ maxWidth: '100%', wordBreak: 'break-word' }}>
                                            {expandedComments[`comment-${review.id}`] ? (
                                                <>
                                                    {review.comment}
                                                    <button
                                                        onClick={() => toggleComment(review.id, 'comment')}
                                                        className="btn btn-link text-decoration-underline ms-2"
                                                    >
                                                        Collapse
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    {review.comment.length > 100
                                                        ? `${review.comment.slice(0, 40)}...`
                                                        : review.comment}
                                                    {review.comment.length > 100 && (
                                                        <button
                                                            onClick={() => toggleComment(review.id, 'comment')}
                                                            className="btn btn-link text-decoration-underline ms-2"
                                                        >
                                                            Read more
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                        <td className="py-2 text-center" style={{ maxWidth: '100%', wordBreak: 'break-all' }}>
                                            {review.admin_reply ? (
                                                expandedComments[`admin_reply-${review.id}`] ? (
                                                    <>
                                                        {review.admin_reply}
                                                        <button
                                                            onClick={() => toggleComment(review.id, 'admin_reply')}
                                                            className="btn btn-link text-decoration-underline ms-2"
                                                        >
                                                            Collapse
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        {review.admin_reply.length > 100
                                                            ? `${review.admin_reply.slice(0, 40)}...`
                                                            : review.admin_reply}
                                                        {review.admin_reply.length > 100 && (
                                                            <button
                                                                onClick={() => toggleComment(review.id, 'admin_reply')}
                                                                className="btn btn-link text-decoration-underline ms-2"
                                                            >
                                                                Read more
                                                            </button>
                                                        )}
                                                    </>
                                                )
                                            ) : (
                                                'No reply yet'
                                            )}
                                        </td>
                                        <td className="py-2 text-center">
                                            {new Date(review.created_at).toLocaleString('vi-VN', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                                hour12: false,
                                            })}
                                        </td>
                                        <td className="py-2 text-center">
                                            <div className="d-flex flex-column gap-2">
                                                <div>
                                                    <textarea
                                                        value={replyText[review.id] || ''}
                                                        onChange={(e) => setReplyText((prev) => ({ ...prev, [review.id]: e.target.value }))}
                                                        placeholder="Enter admin reply"
                                                        className="form-control mb-1"
                                                        rows="2"
                                                    />
                                                    <button
                                                        onClick={() => handleReply(review.id)}
                                                        className="btn btn-primary rounded w-100"
                                                    >
                                                        Reply
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(review.id)}
                                                    className="btn btn-danger rounded"
                                                >
                                                    Delete
                                                </button>
                                                {!bannedUsers.has(review.user_id) ? (
                                                    <button
                                                        onClick={() => openBanModal(review.user_id)}
                                                        className="btn btn-warning rounded"
                                                    >
                                                        Ban User
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUnbanUser(review.user_id)}
                                                        className="btn btn-success rounded"
                                                    >
                                                        Unban User
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {reviews.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4">
                                            No reviews available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <p className="text-center mb-4 text-secondary">Total reviews: <strong>{totalReviews}</strong></p>
                    </div>
                    <div className="mt-4 mb-4 d-flex justify-content-center gap-3">
                        <button
                            onClick={handlePrev}
                            disabled={page === 1}
                            className="btn btn-primary px-4 py-2"
                        >
                            Previous
                        </button>
                        <span className="d-flex align-items-center">
                            Page {page} / {lastPage}
                        </span>
                        <button
                            onClick={handleNext}
                            disabled={page === lastPage}
                            className="btn btn-primary px-4 py-2"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}

            <div className={`modal fade ${showBanModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showBanModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirm Ban User</h5>
                            <button type="button" className="btn-close" onClick={closeBanModal}></button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to ban this user? This will prevent them from submitting reviews.
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={closeBanModal}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleBanUser}
                                disabled={banLoading}
                            >
                                {banLoading ? 'Banning...' : 'Ban User'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewsManagement;