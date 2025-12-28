import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../css/css_of_admin/UserManagement.css'; // File CSS đã được scoped

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newStatus, setNewStatus] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/users_manager?page=${currentPage}`);
                setUsers(response.data.data);
                setLastPage(response.data.last_page);
                setLoading(false);
            } catch (err) {
                toast.error('Unable to load customer list. Please try again later.');
                setLoading(false);
            }
        };

        fetchUsers();
    }, [currentPage]);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < lastPage) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setNewStatus(user.status);
        setShowModal(true);
    };

    const handleUpdateStatus = async () => {
        if (!selectedUser || !newStatus) return;

        try {
            await axios.put(`http://localhost:8000/api/users_manager/${selectedUser.id}`, {
                status: newStatus,
            });
            setUsers(users.map(user =>
                user.id === selectedUser.id ? { ...user, status: newStatus } : user
            ));
            setShowModal(false);
            toast.success('User status updated successfully');
        } catch (err) {
            toast.error('Failed to update user status. Please try again later.');
        }
    };

    return (
        <div className="user-management">
            <div className="container-fluid py-5 bg-light min-vh-100">
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                />
                <div className="text-center mb-5">
                    <h1 className="display-5 fw-bold text-primary">
                        <i className="bi bi-people-fill me-2"></i>Customer Management
                    </h1>
                </div>

                {loading && (
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                {!loading && (
                    <div className="card shadow-lg border-0">
                        <div className="card-body p-4">
                            <div className="table-responsive">
                                <table className="table table-hover table-bordered align-middle">
                                    <thead className="table-primary">
                                        <tr>
                                            <th scope="col" className="text-center">ID</th>
                                            <th scope="col" className="text-center">Name</th>
                                            <th scope="col" className="text-center">Email</th>
                                            <th scope="col" className="text-center">Phone</th>
                                            <th scope="col" className="text-center">Role</th>
                                            <th scope="col" className="text-center">Status</th>
                                            <th scope="col" className="text-center">Created At</th>
                                            <th scope="col" className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length > 0 ? (
                                            users.map((user, index) => (
                                                <tr key={user.id} className="hover-row">
                                                    <td className="text-center">{user.id}</td>
                                                    <td className="text-center">{user.name}</td>
                                                    <td className="text-center">{user.email}</td>
                                                    <td className="text-center">{user.phone || 'N/A'}</td>
                                                    <td className="text-center">
                                                        <span className="badge bg-info">{user.role}</span>
                                                    </td>
                                                    <td className="text-center">
                                                        <span
                                                            className={`badge ${
                                                                user.status === 'active'
                                                                    ? 'bg-success'
                                                                    : user.status === 'inactive'
                                                                    ? 'bg-warning'
                                                                    : 'bg-danger'
                                                            }`}
                                                        >
                                                            {user.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        {user.created_at
                                                            ? new Date(user.created_at).toLocaleDateString('vi-VN', {
                                                                  day: '2-digit',
                                                                  month: '2-digit',
                                                                  year: 'numeric',
                                                              })
                                                            : 'N/A'}
                                                    </td>
                                                    <td className="text-center">
                                                        <button
                                                            onClick={() => handleEdit(user)}
                                                            className="btn btn-primary btn-sm"
                                                            title="Edit User Status"
                                                        >
                                                            <i className="bi bi-pencil-fill"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="text-center text-muted py-3">
                                                    No customers available.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Modal for Editing Status */}
                            {showModal && selectedUser && (
                                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                    <div className="modal-dialog modal-dialog-centered">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Update User Status</h5>
                                                <button
                                                    type="button"
                                                    className="btn-close"
                                                    onClick={() => setShowModal(false)}
                                                ></button>
                                            </div>
                                            <div className="modal-body">
                                                <div className="mb-3">
                                                    <label className="form-label">Status for {selectedUser.name}</label>
                                                    <select
                                                        className="form-select"
                                                        value={newStatus}
                                                        onChange={(e) => setNewStatus(e.target.value)}
                                                    >
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                        <option value="banned">Banned</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="modal-footer">
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() => setShowModal(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={handleUpdateStatus}
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Phân trang */}
                            <nav aria-label="Page navigation">
                                <ul className="pagination justify-content-center mt-4">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={handlePreviousPage}
                                            disabled={currentPage === 1}
                                        >
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>
                                    <li className="page-item disabled">
                                        <span className="page-link">
                                            {currentPage} / {lastPage}
                                        </span>
                                    </li>
                                    <li className={`page-item ${currentPage === lastPage ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={handleNextPage}
                                            disabled={currentPage === lastPage}
                                        >
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;