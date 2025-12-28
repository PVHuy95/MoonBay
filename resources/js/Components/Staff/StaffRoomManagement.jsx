import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Save, X, Plus, Trash2, Loader2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../css/css_of_staff/StaffRoomManagement.css"; // Import CSS styles

function StaffRoomManagement() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        room_number: "",
        type: "",
        description: "",
        price: "",
        status: "",
    });
    const [editingId, setEditingId] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all"); // Thêm state cho filter

    // Local search state - không dùng SearchContext
    const [localSearchQuery, setLocalSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const [actionLoading, setActionLoading] = useState(false); // Add state for action loading

    // Thêm state cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4; // Số phòng mỗi trang
    useEffect(() => {
        fetchRooms();
    }, []);

    // Debounce search query to improve performance
    useEffect(() => {
        if (localSearchQuery !== debouncedSearchQuery) {
            setIsSearching(true);
        }

        const timer = setTimeout(() => {
            setDebouncedSearchQuery(localSearchQuery);
            setIsSearching(false);
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [localSearchQuery]);

    const fetchRooms = async () => {
        setLoading(true);
        setError("");
        try {
            // Thêm độ trễ để hiển thị hiệu ứng loading
            await new Promise((resolve) => setTimeout(resolve, 400));

            const res = await axios.get("http://localhost:8000/api/rooms");
            setRooms(res.data);
        } catch (error) {
            setError("Failed to load room list. Please try again later.");
            toast.error("Failed to load room list");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const response = await axios.put(
                `http://localhost:8000/api/rooms/${editingId}`,
                form
            );

            // Cập nhật trực tiếp room trong state thay vì fetch lại
            setRooms((prevRooms) =>
                prevRooms.map((room) =>
                    room.id === editingId
                        ? { ...room, ...form } // Cập nhật với dữ liệu mới
                        : room
                )
            );

            setEditingId(null);
            setForm({
                room_number: "",
                type: "",
                description: "",
                price: "",
                status: "",
            });
            toast.success("Room updated successfully!");
        } catch (error) {
            setError("Failed to update room!");
            toast.error("Failed to update room");
        } finally {
            setActionLoading(false);
        }
    };

    const handleEdit = (room) => {
        setForm(room);
        setEditingId(room.id);
    };
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this room?")) {
            setActionLoading(true);
            try {
                await axios.delete(`http://localhost:8000/api/rooms/${id}`);

                // Xóa room khỏi state trực tiếp thay vì fetch lại
                setRooms((prevRooms) =>
                    prevRooms.filter((room) => room.id !== id)
                );

                toast.success("Room deleted successfully!");
            } catch (error) {
                setError("Unable to delete room!");
                toast.error("Failed to delete room");
            } finally {
                setActionLoading(false);
            }
        }
    };

    // Tính toán dữ liệu phân trang
    const totalPages = Math.ceil(rooms.length / itemsPerPage);
    const paginatedRooms = rooms.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Xử lý thay đổi cho bộ lọc trạng thái
    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1); // Đặt lại trang hiện tại về 1 khi thay đổi bộ lọc
    }; // Search handler functions
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setLocalSearchQuery(value);
        if (value !== debouncedSearchQuery) {
            setIsSearching(true);
        }
        setCurrentPage(1); // Reset page when searching
    };

    const clearSearch = () => {
        setLocalSearchQuery("");
        setDebouncedSearchQuery("");
        setIsSearching(false);
        setCurrentPage(1);
    };

    // Lọc và tìm kiếm dữ liệu phòng
    const filteredRooms = rooms.filter((room) => {
        const matchesStatus =
            statusFilter === "all" || room.status === statusFilter;
        const matchesSearch =
            room.room_number
                .toLowerCase()
                .includes(debouncedSearchQuery.toLowerCase()) ||
            room.type
                .toLowerCase()
                .includes(debouncedSearchQuery.toLowerCase()) ||
            room.price.toString().includes(debouncedSearchQuery);
        return matchesStatus && matchesSearch;
    });

    // Cập nhật lại tổng số trang khi có thay đổi về lọc hoặc tìm kiếm
    const totalFilteredPages = Math.ceil(filteredRooms.length / itemsPerPage);

    return (
        <div className="staff-room-management">
            <ToastContainer position="top-right" autoClose={3000} />
            <h2 className="staff-room-title">Room Management</h2>
            <p className="staff-room-description">
                Manage room information, including room status.
            </p>
            <div className="staff-room-actions">
                <div className="staff-room-filter-container">
                    <select
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        className="staff-room-status-filter"
                    >
                        <option value="all">All</option>
                        <option value="available">Available</option>                        <option value="maintenance">Maintenance</option>
                    </select>
                </div>
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder="Search by room number, type, price..."
                        className="search-input"
                        value={localSearchQuery}
                        onChange={handleSearchChange}
                    />
                    {isSearching && <div className="search-spinner"></div>}
                    {localSearchQuery && !isSearching && (                        <button
                            className="clear-search-btn"
                            onClick={clearSearch}
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* Search Results Count */}
            {debouncedSearchQuery && !loading && (
                <div className="search-results-info">
                    Found {filteredRooms.length} room
                    {filteredRooms.length !== 1 ? "s" : ""}
                    {statusFilter !== "all" && ` (filtered by ${statusFilter})`}
                </div>
            )}

            <div className="staff-room-table-container">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary mb-2" />
                        <p>Loading data...</p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger text-center">
                        {error}
                    </div>
                ) : (
                    <>
                        {editingId && (
                            <form
                                onSubmit={handleSubmit}
                                className="staff-room-edit-form"
                            >
                                <div className="staff-room-form-row">
                                    <input
                                        name="room_number"
                                        placeholder="Room Number"
                                        value={form.room_number}
                                        onChange={handleChange}
                                        required
                                        disabled
                                    />
                                    <input
                                        name="type"
                                        placeholder="Room Type"
                                        value={form.type}
                                        onChange={handleChange}
                                        required
                                    />
                                    <input
                                        name="description"
                                        placeholder="Description"
                                        value={form.description}
                                        onChange={handleChange}
                                    />
                                    <input
                                        name="price"
                                        placeholder="Price"
                                        value={form.price}
                                        onChange={handleChange}
                                        required
                                        type="number"
                                    />
                                    <input
                                        name="status"
                                        placeholder="Status"
                                        value={form.status}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="staff-room-form-actions">
                                    <button
                                        type="submit"
                                        className="btn update"
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? (
                                            <>
                                                <Loader2
                                                    className="animate-spin mr-2"
                                                    size={16}
                                                />
                                                Updating...
                                            </>
                                        ) : (
                                            <>Update</>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn cancel"
                                        onClick={() => {
                                            setEditingId(null);
                                            setForm({
                                                room_number: "",
                                                type: "",
                                                description: "",
                                                price: "",
                                                status: "",
                                            });
                                        }}
                                        disabled={actionLoading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                        <table className="staff-room-data-table">
                            <thead>
                                <tr>
                                    <th>Room Number</th>
                                    <th>Room Type</th>
                                    <th>Description</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRooms
                                    .slice(
                                        (currentPage - 1) * itemsPerPage,
                                        currentPage * itemsPerPage
                                    )
                                    .map((room) => (
                                        <tr key={room.id}>
                                            <td>{room.room_number}</td>
                                            <td>{room.type}</td>
                                            <td>{room.description}</td>
                                            <td>{room.price}</td>
                                            <td>
                                                <span
                                                    className={`staff-room-badge staff-room-badge-${room.status.toLowerCase()}`}
                                                >
                                                    {room.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-history staff-room-btn-history"
                                                    onClick={() =>
                                                        handleEdit(room)
                                                    }
                                                    disabled={actionLoading}
                                                >
                                                    <Edit
                                                        size={16}
                                                        className="mr-1"
                                                    />
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-note staff-room-btn-note"
                                                    onClick={() =>
                                                        handleDelete(room.id)
                                                    }
                                                    disabled={actionLoading}
                                                >
                                                    <Trash2
                                                        size={16}
                                                        className="mr-1"
                                                    />                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                        {/* Phân trang */}
                        {totalFilteredPages > 1 && (
                            <div className="staff-room-pagination">
                                <button
                                    className="staff-room-page-btn"
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                    disabled={
                                        currentPage === 1 || actionLoading
                                    }
                                >
                                    &#60;
                                </button>
                                {[...Array(totalFilteredPages)].map(
                                    (_, idx) => (
                                        <button
                                            key={idx + 1}
                                            className={`staff-room-page-btn ${
                                                currentPage === idx + 1
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handlePageChange(idx + 1)
                                            }
                                            disabled={actionLoading}
                                        >
                                            {idx + 1}
                                        </button>
                                    )
                                )}
                                <button
                                    className="staff-room-page-btn"
                                    onClick={() =>
                                        handlePageChange(currentPage + 1)
                                    }
                                    disabled={
                                        currentPage === totalFilteredPages ||
                                        actionLoading
                                    }
                                >
                                    &#62;
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default StaffRoomManagement;
