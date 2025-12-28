import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "../../../css/css_of_staff/StaffCustomerManagement.css";

const StaffCustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isStayHistoryModalOpen, setIsStayHistoryModalOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [stayHistory, setStayHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [noteList, setNoteList] = useState([]);    const [newNote, setNewNote] = useState("");
    const [newType, setNewType] = useState("regular");
    const [currentType, setCurrentType] = useState("regular");    // Local search state - không dùng SearchContext
    const [localSearchQuery, setLocalSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const itemsPerPage = 6; // Số lượng khách hàng hiển thị trên mỗi trang    // Sort state
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("asc"); // 'asc' hoặc 'desc'    // Debounce search query to improve performance
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

    // Fetch customers data
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                // Thêm độ trễ để hiển thị hiệu ứng loading
                await new Promise((resolve) => setTimeout(resolve, 400));

                const token = Cookies.get("auth_token");
                if (!token) {
                    throw new Error("Không tìm thấy token xác thực");
                }

                const response = await axios.get("/api/staff_customers", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const customerData = response.data.filter(
                    (user) => user.role === "user"
                );
                setCustomers(customerData);
                setFilteredCustomers(customerData);
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);    // Apply search filter
    useEffect(() => {
        if (debouncedSearchQuery) {
            const filtered = customers.filter(
                (customer) =>
                    customer.name
                        .toLowerCase()
                        .includes(debouncedSearchQuery.toLowerCase()) ||
                    customer.email
                        .toLowerCase()
                        .includes(debouncedSearchQuery.toLowerCase()) ||
                    (customer.phone &&
                        customer.phone
                            .toLowerCase()
                            .includes(debouncedSearchQuery.toLowerCase()))
            );
            setFilteredCustomers(filtered);
            setCurrentPage(1);
        } else {
            setFilteredCustomers(customers);
        }
    }, [debouncedSearchQuery, customers]);

    // Sort handler
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    // Sort logic
    const getSortedCustomers = (list) => {
        if (!sortField) return list;
        return [...list].sort((a, b) => {
            let aValue = a[sortField] || "";
            let bValue = b[sortField] || "";
            if (sortField === "customer_type") {
                // Đảm bảo VIP > Special > Regular
                const typeOrder = { vip: 3, special: 2, regular: 1 };
                aValue = typeOrder[a.customer_type] || 0;
                bValue = typeOrder[b.customer_type] || 0;
                return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
            }
            if (typeof aValue === "string" && typeof bValue === "string") {
                return sortOrder === "asc"
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            return 0;
        });
    };

    // Pagination calculation
    const sortedCustomers = getSortedCustomers(filteredCustomers);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCustomers = sortedCustomers.slice(
        indexOfFirstItem,
        indexOfLastItem
    );
    const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Handle local search
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setLocalSearchQuery(value);
        setCurrentPage(1); // Reset to first page when searching
    };    // Clear search
    const clearSearch = () => {
        setLocalSearchQuery("");
        setDebouncedSearchQuery("");
        setCurrentPage(1);
    };

    // Fetch customer stay history
    const fetchCustomerHistory = async (customerId) => {
        setHistoryLoading(true);
        try {
            const token = Cookies.get("auth_token");
            const response = await axios.get(
                `/api/staff_customers/${customerId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data && response.data.stay_history) {
                setStayHistory(response.data.stay_history);
            } else {
                setStayHistory([]);
            }
        } catch (error) {
            setStayHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    // Fetch all notes for customer
    const fetchCustomerNotes = async (customerId) => {
        try {
            const token = Cookies.get("auth_token");
            const res = await axios.get(`/api/customer-notes/${customerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNoteList(res.data.notes || []);
        } catch {
            setNoteList([]);
        }
    };

    // Mở modal Stay History
    const handleOpenStayHistory = (customer) => {
        setSelectedCustomer(customer);
        setIsStayHistoryModalOpen(true);
        fetchCustomerHistory(customer.id);
    };

    // Mở modal Note
    const handleOpenNote = (customer) => {
        setSelectedCustomer(customer);
        setCurrentType(customer.customer_type || "regular");
        setNewType(customer.customer_type || "regular");
        fetchCustomerNotes(customer.id);
        setIsNoteModalOpen(true);
    };

    // Đóng modal Stay History
    const closeStayHistoryModal = () => {
        setIsStayHistoryModalOpen(false);
        setStayHistory([]);
    };

    // Đóng modal Note
    const closeNoteModal = () => {
        setIsNoteModalOpen(false);
        setNoteList([]);
    };
    // Chuẩn hóa status cho Stay History
    const normalizeStatus = (status) => {
        if (!status) return { className: "notcheckin", text: "Not check in" };
        const s = status.trim().toLowerCase().replace(/\s+/g, "");
        if (s === "checkin" || s === "checkedin")
            return { className: "checkin", text: "Check in" };
        if (s === "checkout" || s === "checkedout")
            return { className: "checkout", text: "Check out" };
        return { className: "notcheckin", text: "Not check in" };
    };
    return (
        <div className="staff-customer-management">
            <h2 className="staff-title">Customer Management</h2>
            <p className="staff-customer-description">
                Manage customer information, view stay history, and add notes.
            </p>{" "}            <div className="staff-search-container">
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder="Search by name, email or phone number..."
                        value={localSearchQuery}
                        onChange={handleSearchChange}
                        className="staff-search-input"
                    />
                    {isSearching && (
                        <div className="search-indicator">
                            <div className="search-spinner"></div>
                        </div>
                    )}
                    {localSearchQuery && !isSearching && (
                        <button 
                            type="button" 
                            onClick={clearSearch}
                            className="clear-search-btn"
                            title="Clear search"
                        >
                            ×
                        </button>
                    )}                </div>
            </div>
            
            {/* Search Results Count */}
            {debouncedSearchQuery && !loading && (
                <div className="search-results-info">
                    Found {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} 
                    {debouncedSearchQuery && ` matching "${debouncedSearchQuery}"`}
                </div>
            )}
            
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-2" />
                    <p>Loading data...</p>
                </div>
            ) : (
                <div className="staff-table-container">
                    <table className="staff-data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th
                                    style={{
                                        cursor: "pointer",
                                        userSelect: "none",
                                    }}
                                    onClick={() => handleSort("name")}
                                >
                                    Name
                                    <span
                                        style={{
                                            marginLeft: 4,
                                            opacity:
                                                sortField === "name" ? 1 : 0.3,
                                        }}
                                    >
                                        {sortField === "name"
                                            ? sortOrder === "asc"
                                                ? "▲"
                                                : "▼"
                                            : "▲"}
                                    </span>
                                </th>
                                <th
                                    style={{
                                        cursor: "pointer",
                                        userSelect: "none",
                                    }}
                                    onClick={() => handleSort("email")}
                                >
                                    Email
                                    <span
                                        style={{
                                            marginLeft: 4,
                                            opacity:
                                                sortField === "email" ? 1 : 0.3,
                                        }}
                                    >
                                        {sortField === "email"
                                            ? sortOrder === "asc"
                                                ? "▲"
                                                : "▼"
                                            : "▲"}
                                    </span>
                                </th>
                                <th>Phone</th>
                                <th
                                    style={{
                                        cursor: "pointer",
                                        userSelect: "none",
                                    }}
                                    onClick={() => handleSort("customer_type")}
                                >
                                    Type
                                    <span
                                        style={{
                                            marginLeft: 4,
                                            opacity:
                                                sortField === "customer_type"
                                                    ? 1
                                                    : 0.3,
                                        }}
                                    >
                                        {sortField === "customer_type"
                                            ? sortOrder === "asc"
                                                ? "▲"
                                                : "▼"
                                            : "▲"}
                                    </span>
                                </th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCustomers.length > 0 ? (
                                currentCustomers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td>{customer.id}</td>
                                        <td>{customer.name}</td>
                                        <td>{customer.email}</td>
                                        <td>{customer.phone || "N/A"}</td>
                                        <td>
                                            <span
                                                className={`staff-badge staff-badge-${
                                                    customer.customer_type ||
                                                    "regular"
                                                }`}
                                            >
                                                {customer.customer_type ===
                                                "vip"
                                                    ? "VIP"
                                                    : customer.customer_type ===
                                                      "special"
                                                    ? "Special"
                                                    : "Regular"}
                                            </span>
                                        </td>
                                        <td className="staff-actions">
                                            <button
                                                className="btn btn-history staff-btn-history"
                                                onClick={() =>
                                                    handleOpenStayHistory(
                                                        customer
                                                    )
                                                }
                                            >
                                                <i className="fas fa-history"></i>{" "}
                                                Stay History
                                            </button>
                                            <button
                                                className="btn btn-note staff-btn-note"
                                                onClick={() =>
                                                    handleOpenNote(customer)
                                                }
                                            >
                                                <i className="fas fa-sticky-note"></i>{" "}
                                                Notes
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="staff-no-data">
                                        No customers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="staff-customer-pagination">
                    <button
                        className="staff-customer-page-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        &#60;
                    </button>
                    {[...Array(totalPages)].map((_, idx) => (
                        <button
                            key={idx + 1}
                            className={`staff-customer-page-btn ${
                                currentPage === idx + 1 ? "active" : ""
                            }`}
                            onClick={() => handlePageChange(idx + 1)}
                        >
                            {idx + 1}
                        </button>
                    ))}
                    <button
                        className="staff-customer-page-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        &#62;
                    </button>
                </div>
            )}
            {/* Stay History Modal */}
            {isStayHistoryModalOpen && selectedCustomer && (
                <div
                    className="staff-modal-backdrop"
                    onClick={closeStayHistoryModal}
                >
                    <div
                        className="staff-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="staff-modal-header staff-modal-header-note">
                            <h3 className="staff-modal-title-center">
                                Stay History
                            </h3>
                            <button
                                className="close-btn staff-close-btn-wow"
                                onClick={closeStayHistoryModal}
                                aria-label="Close Stay History Modal"
                            >
                                <span className="staff-close-x">&times;</span>
                            </button>
                        </div>

                        <div className="staff-customer-info">
                            <div className="staff-info-item">
                                <span className="staff-info-label">ID:</span>
                                <span className="staff-info-value">
                                    {selectedCustomer.id}
                                </span>
                            </div>
                            <div className="staff-info-item">
                                <span className="staff-info-label">Name:</span>
                                <span className="staff-info-value">
                                    {selectedCustomer.name}
                                </span>
                            </div>
                            <div className="staff-info-item">
                                <span className="staff-info-label">Email:</span>
                                <span className="staff-info-value">
                                    {selectedCustomer.email}
                                </span>
                            </div>
                            <div className="staff-info-item">
                                <span className="staff-info-label">Phone:</span>
                                <span className="staff-info-value">
                                    {selectedCustomer.phone || "N/A"}
                                </span>
                            </div>
                            <div className="staff-info-item">
                                <span className="staff-info-label">Type:</span>
                                <span className="staff-info-value">
                                    <span
                                        className={`staff-badge staff-badge-${
                                            selectedCustomer.customer_type ||
                                            "regular"
                                        }`}
                                    >
                                        {selectedCustomer.customer_type ===
                                        "vip"
                                            ? "VIP"
                                            : selectedCustomer.customer_type ===
                                              "special"
                                            ? "Special"
                                            : "Regular"}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div className="staff-stay-history">
                            <h4>List of Stays</h4>
                            {historyLoading ? (
                                <div className="staff-loading-spinner">
                                    <div className="staff-spinner"></div>
                                    <p>Loading stay history...</p>
                                </div>
                            ) : Array.isArray(stayHistory) &&
                              stayHistory.length > 0 ? (
                                <div className="staff-table-container">
                                    <table className="staff-data-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Number of room</th>
                                                <th>Member</th>
                                                <th>Children</th>
                                                <th>Check-in</th>
                                                <th>Check-out</th>
                                                <th>Room</th>
                                                <th>Total Price</th>
                                                <th>Status</th>
                                                <th>Note</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stayHistory.map((stay) => {
                                                const statusObj =
                                                    normalizeStatus(
                                                        stay.check_status
                                                    );
                                                return (
                                                    <tr key={stay.id}>
                                                        <td>{stay.id}</td>
                                                        <td>
                                                            {
                                                                stay.number_of_rooms
                                                            }
                                                        </td>
                                                        <td>{stay.member}</td>
                                                        <td>{stay.children}</td>
                                                        <td>
                                                            {new Date(
                                                                stay.checkin_date
                                                            ).toLocaleDateString(
                                                                "vi-VN"
                                                            )}
                                                        </td>
                                                        <td>
                                                            {new Date(
                                                                stay.checkout_date
                                                            ).toLocaleDateString(
                                                                "vi-VN"
                                                            )}
                                                        </td>
                                                        <td className="staff-room-info">
                                                            {stay.room_id
                                                                ? `P${stay.room_id} - ${stay.room_type}`
                                                                : stay.room_type}
                                                        </td>
                                                        <td className="staff-price">
                                                            {stay.total_price?.toLocaleString(
                                                                "vi-VN"
                                                            )}
                                                            đ
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={`staff-badge staff-badge-${statusObj.className}`}
                                                            >
                                                                {statusObj.text}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {selectedCustomer.customer_type ===
                                                            "vip"
                                                                ? "VIP"
                                                                : selectedCustomer.customer_type ===
                                                                  "special"
                                                                ? "Special"
                                                                : "Regular"}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="staff-no-history">
                                    This customer has no stay history.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Note Modal */}
            {isNoteModalOpen && selectedCustomer && (
                <div className="staff-modal-backdrop" onClick={closeNoteModal}>
                    <div
                        className="staff-modal staff-note-modal"
                        style={{ maxHeight: "none" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="staff-modal-header staff-modal-header-note">
                            <h3 className="staff-modal-title-center">
                                Note Timeline
                            </h3>
                            <button
                                className="close-btn staff-close-btn-wow"
                                onClick={closeNoteModal}
                                aria-label="Close Note Modal"
                            >
                                <span className="staff-close-x">&times;</span>
                            </button>
                        </div>

                        <div className="staff-customer-info">
                            <div className="staff-info-item">
                                <span className="staff-info-label">ID:</span>{" "}
                                <span className="staff-info-value">
                                    {selectedCustomer.id}
                                </span>
                            </div>
                            <div className="staff-info-item">
                                <span className="staff-info-label">Name:</span>{" "}
                                <span className="staff-info-value">
                                    {selectedCustomer.name}
                                </span>
                            </div>
                            <div className="staff-info-item">
                                <span className="staff-info-label">Email:</span>{" "}
                                <span className="staff-info-value">
                                    {selectedCustomer.email}
                                </span>
                            </div>
                            <div className="staff-info-item">
                                <span className="staff-info-label">Phone:</span>{" "}
                                <span className="staff-info-value">
                                    {selectedCustomer.phone || "N/A"}
                                </span>
                            </div>
                        </div>

                        {/* Note History */}
                        <div className="staff-notes-section">
                            <h4>Note History</h4>
                            {Array.isArray(noteList) &&
                            noteList.length === 0 ? (
                                <div className="staff-no-notes">
                                    No notes available.
                                </div>
                            ) : (
                                <ul className="staff-note-list staff-note-list-scrollable">
                                    {Array.isArray(noteList) &&
                                        noteList.map((note, idx) => (
                                            <li
                                                key={note.id}
                                                className={`staff-note-item ${
                                                    idx === 0 ? "newest" : ""
                                                }`}
                                            >
                                                <div className="staff-note-header">
                                                    <span
                                                        className={`staff-badge staff-badge-${note.customer_type}`}
                                                    >
                                                        {note.customer_type ===
                                                        "vip"
                                                            ? "🌟 VIP"
                                                            : note.customer_type ===
                                                              "special"
                                                            ? "💎 Special"
                                                            : "👤 Regular"}
                                                    </span>
                                                    <span className="staff-note-staff">
                                                        {note.staff_name}
                                                    </span>
                                                    <span className="staff-note-date">
                                                        {new Date(
                                                            note.created_at
                                                        ).toLocaleString(
                                                            "en-US"
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="staff-note-content">
                                                    {note.note ? (
                                                        note.note
                                                    ) : (
                                                        <span className="staff-empty-note">
                                                            (No content)
                                                        </span>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                </ul>
                            )}
                        </div>

                        {/* Add New Note */}
                        <div className="staff-add-note">
                            <h4>Add New Note</h4>
                            <textarea
                                className="staff-note-input"
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Enter new note (allergies, special requests, etc.)"
                            ></textarea>
                            <div
                                className="staff-change-type-row"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "12px",
                                    margin: "12px 0",
                                }}
                            >
                                <div
                                    className="staff-change-type-label"
                                    style={{
                                        fontWeight: 500,
                                        color: "#1976d2",
                                    }}
                                >
                                    Change customer type
                                </div>
                                <select
                                    value={newType}
                                    onChange={(e) => {
                                        setNewType(e.target.value);
                                        setCurrentType(e.target.value); // cập nhật luôn currentType để giao diện phản ánh ngay
                                    }}
                                    className="staff-type-select"
                                    style={{ margin: 0 }}
                                >
                                    <option value="regular">👤 Regular</option>
                                    <option value="vip">🌟 VIP</option>
                                    <option value="special">💎 Special</option>
                                </select>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    marginTop: "10px",
                                }}
                            >
                                <button
                                    className="save-btn staff-save-btn"
                                    style={{
                                        minWidth: "160px",
                                        fontWeight: 600,
                                        fontSize: "1.08em",
                                        borderRadius: "8px",
                                        boxShadow: "0 2px 8px #1976d21a",
                                    }}
                                    onClick={async () => {
                                        try {
                                            const token =
                                                Cookies.get("auth_token");
                                            await axios.post(
                                                "/api/customer-notes",
                                                {
                                                    user_id:
                                                        selectedCustomer.id,
                                                    note: newNote,
                                                    customer_type: newType,
                                                },
                                                {
                                                    headers: {
                                                        Authorization: `Bearer ${token}`,
                                                    },
                                                }
                                            );
                                            setNewNote("");
                                            // Không reset newType về 'regular', giữ nguyên giá trị vừa chọn
                                            setCurrentType(newType);
                                            fetchCustomerNotes(
                                                selectedCustomer.id
                                            );
                                            setCustomers((prevCustomers) => {
                                                return prevCustomers.map(
                                                    (customer) => {
                                                        if (
                                                            customer.id ===
                                                            selectedCustomer.id
                                                        ) {
                                                            return {
                                                                ...customer,
                                                                customer_type:
                                                                    newType,
                                                            };
                                                        }
                                                        return customer;
                                                    }
                                                );
                                            });
                                            setTimeout(() => {
                                                const el =
                                                    document.querySelector(
                                                        ".staff-note-list .staff-note-item.newest"
                                                    );
                                                if (el)
                                                    el.classList.add(
                                                        "highlight-new"
                                                    );
                                            }, 300);
                                            alert("Note added successfully!");
                                        } catch {
                                            alert("Error adding note.");
                                        }
                                    }}
                                >
                                    Save Note
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffCustomerManagement;
