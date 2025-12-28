import React, { useState, useEffect } from 'react';
import axios from '../../axios-config';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../css/css_of_admin/EmployeeListManagement.css'; // File CSS tùy chỉnh

const EmployeeListManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'staff',
        status: 'active',
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/staff_manager?page=${currentPage}`);
                const staffUsers = response.data.data;
                setUsers(staffUsers);
                setLastPage(response.data.last_page);
                setLoading(false);
            } catch (err) {
                toast.error('Unable to load staff list. Please try again later.');
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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this staff?')) {
            try {
                await axios.delete(`http://localhost:8000/api/staff_manager/${id}`);
                setUsers(users.filter(user => user.id !== id));
                toast.success('Staff deleted successfully');
                if (users.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
            } catch (err) {
                toast.error('Failed to delete staff. Please try again later.');
            }
        }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/staff_manager', formData);
            setUsers([...users, response.data]);
            setShowAddModal(false);
            resetForm();
            toast.success('Staff added successfully');
        } catch (err) {
            toast.error('Failed to add staff. Please try again later.');
        }
    };

    const handleEditStaff = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:8000/api/staff_manager/${selectedUser.id}`, formData);
            setUsers(users.map(user => (user.id === selectedUser.id ? response.data : user)));
            setShowEditModal(false);
            resetForm();
            toast.success('Staff updated successfully');
        } catch (err) {
            toast.error('Failed to update staff. Please try again later.');
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            status: user.status,
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            role: 'staff',
            status: 'active',
        });
        setSelectedUser(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
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
            />
            <div className="text-center mb-4">
                <h1 className="display-4 text-primary fw-bold">Staff List Management</h1>
                <button
                    className="btn btn-primary mt-3"
                    onClick={() => setShowAddModal(true)}
                >
                    Add New Staff
                </button>
            </div>

            {loading && (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {!loading && (
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-striped table-hover table-bordered align-middle">
                                <thead className="table-dark">
                                    <tr>
                                        <th scope="col" className="text-center">ID</th>
                                        <th scope="col" className="text-center">Name</th>
                                        <th scope="col" className="text-center">Email</th>
                                        <th scope="col" className="text-center">Phone Number</th>
                                        <th scope="col" className="text-center">Role</th>
                                        <th scope="col" className="text-center">Status</th>
                                        <th scope="col" className="text-center">Created At</th>
                                        <th scope="col" className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? (
                                        users.map((user, index) => (
                                            <tr key={user.id}>
                                                <td className="text-center">{user.id}</td>
                                                <td className="text-center">{user.name}</td>
                                                <td className="text-center">{user.email}</td>
                                                <td className="text-center">{user.phone || 'N/A'}</td>
                                                <td className="text-center">{user.role}</td>
                                                <td className="text-center">
                                                    <span
                                                        className={`badge ${user.status === 'active'
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
                                                        ? new Date(user.created_at).toLocaleDateString('vi-VN')
                                                        : 'N/A'}
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="btn btn-warning btn-sm me-2"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="btn btn-danger btn-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="text-center text-muted">
                                                No staff members available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Phân trang */}
                        <nav aria-label="Page navigation">
                            <ul className="pagination justify-content-center mt-4">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 1}
                                    >
                                        <span aria-hidden="true">«</span>
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
                                        <span aria-hidden="true">»</span>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            )}

            {/* Modal Thêm Nhân Viên */}
            <div className={`modal fade ${showAddModal ? 'show d-block' : ''}`} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header" style={{ backgroundColor: '#a37d2c', color: 'white' }}>
                            <h5 className="modal-title">Add New Staff</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetForm();
                                }}
                            ></button>
                        </div>
                        <form onSubmit={handleAddStaff}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="phone" className="form-label">Phone Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="role" className="form-label">Role</label>
                                    <select
                                        className="form-select"
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="status" className="form-label">Status</label>
                                    <select
                                        className="form-select"
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <div className="col-md-5" align="center">
                                    <button type="button" className="btn btn-secondary" onClick={() => resetForm()} style={{ width: '80px', height: '40px' }}>
                                        Reset
                                    </button>
                                </div>
                                <div className="col-md-6" align="center">
                                    <button type="submit" className="btn btn-primary" style={{ width: '130px', height: '40px' }}>
                                        Add Staff
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal Sửa Nhân Viên */}
            <div className={`modal fade ${showEditModal ? 'show d-block' : ''}`} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header" style={{ backgroundColor: '#408074', color: 'white' }}>
                            <h5 className="modal-title">Edit Staff</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => {
                                    setShowEditModal(false);
                                    resetForm();
                                }}
                            ></button>
                        </div>
                        <form onSubmit={handleEditStaff} >
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="phone" className="form-label">Phone Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="role" className="form-label">Role</label>
                                    <select
                                        className="form-select"
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="status" className="form-label">Status</label>
                                    <select
                                        className="form-select"
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer row">
                                <div className="col-md-5" align="center">
                                    <button type="button" className="btn btn-secondary" onClick={() => resetForm()} style={{ width: '80px', height: '40px' }} >
                                        Reset
                                    </button>
                                </div>
                                <div className="col-md-6" align="center">
                                    <button type="submit" className="btn btn-primary " style={{ width: '130px', height: '40px' }}>
                                        Save
                                    </button>
                                </div>

                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeListManagement;