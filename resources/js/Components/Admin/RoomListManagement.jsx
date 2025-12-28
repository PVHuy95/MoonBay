import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../css/css_of_admin/RoomListManagement.css';

const RoomListManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    // State for modals and form
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [formData, setFormData] = useState({
        room_number: '',
        type: '',
        price: '',
        status: 'available'
    });

    useEffect(() => {
        fetchRooms();
    }, [currentPage]);

    const fetchRooms = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/room_list?page=${currentPage}`);
            setRooms(response.data.data);
            setLastPage(response.data.last_page);
            setLoading(false);
        } catch (err) {
            toast.error('Unable to load room list. Please try again later.');
            setLoading(false);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            room_number: '',
            type: '',
            price: '',
            status: 'available'
        });
    };

    // Add room
    const handleAddRoom = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/room_list', formData);
            toast.success('Room added successfully!');
            setShowAddModal(false);
            resetForm();
            fetchRooms();
        } catch (err) {
            toast.error('Failed to add room. Please try again.');
        }
    };

    // Edit room
    const handleEditRoom = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8000/api/room_list/${currentRoom.id}`, formData);
            toast.success('Room updated successfully!');
            setShowEditModal(false);
            fetchRooms();
        } catch (err) {
            toast.error('Failed to update room. Please try again.');
        }
    };

    // Delete room
    const handleDeleteRoom = async (id) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                await axios.delete(`http://localhost:8000/api/room_list/${id}`);
                toast.success('Room deleted successfully!');
                fetchRooms();
            } catch (err) {
                toast.error('Failed to delete room. Please try again.');
            }
        }
    };

    // Open edit modal
    const openEditModal = (room) => {
        setCurrentRoom(room);
        setFormData({
            room_number: room.room_number,
            type: room.type,
            price: room.price,
            status: room.status
        });
        setShowEditModal(true);
    };

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
                <h1 className="display-4 text-primary fw-bold">Room List Management</h1>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    Add New Room
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
                                        <th scope="col" className="text-center">Room Number</th>
                                        <th scope="col" className="text-center">Type</th>
                                        <th scope="col" className="text-center">Price (VND)</th>
                                        <th scope="col" className="text-center">Status</th>
                                        <th scope="col" className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rooms.length > 0 ? (
                                        rooms.map((room, index) => (
                                            <tr key={room.id}>
                                                <td className="text-center">{room.id}</td>
                                                <td className="text-center">{room.room_number}</td>
                                                <td className="text-center">{room.type}</td>
                                                <td className="text-center">
                                                    {new Intl.NumberFormat('vi-VN').format(room.price)}
                                                </td>
                                                <td className="text-center">
                                                    <span
                                                        className={`badge ${room.status === 'available'
                                                            ? 'bg-success'
                                                            : room.status === 'booked'
                                                                ? 'bg-warning'
                                                                : 'bg-danger'
                                                            }`}
                                                    >
                                                        {room.status}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className="btn btn-warning btn-sm me-2"
                                                        onClick={() => openEditModal(room)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDeleteRoom(room.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center text-muted">
                                                No rooms available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
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

            {/* Add Room Modal */}
            <div className={`modal fade ${showAddModal ? 'show d-block' : ''}`} tabIndex="-1" role="dialog" style={{ backgroundColor: showAddModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Add New Room</h5>
                            <button type="button" className="btn-close" onClick={() => setShowAddModal(false)} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleAddRoom}>
                                <div className="mb-3">
                                    <label htmlFor="room_number" className="form-label">Room Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="room_number"
                                        name="room_number"
                                        value={formData.room_number}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="type" className="form-label">Type</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="price" className="form-label">Price (VND)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                    />
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
                                        <option value="available">Available</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>
                                <div className='row'>
                                    <div className='col-md-6'>
                                        <button type="submit" className="btn btn-primary">Add Room</button>
                                    </div>
                                    <div className='col-md-6'>
                                        <button className='btn btn-secondary ms-2' onClick={resetForm}> Reset  </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Room Modal */}
            <div className={`modal fade ${showEditModal ? 'show d-block' : ''}`} tabIndex="-1" role="dialog" style={{ backgroundColor: showEditModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Edit Room</h5>
                            <button type="button" className="btn-close" onClick={() => setShowEditModal(false)} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleEditRoom}>
                                <div className="mb-3">
                                    <label htmlFor="room_number_edit" className="form-label">Room Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="room_number_edit"
                                        name="room_number"
                                        value={formData.room_number}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="type_edit" className="form-label">Type</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="type_edit"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="price_edit" className="form-label">Price (VND)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="price_edit"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="status_edit" className="form-label">Status</label>
                                    <select
                                        className="form-select"
                                        id="status_edit"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="available">Available</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>
                                <div className='row'>
                                    <div className='col-md-6'>
                                        <button type="submit" className="btn btn-primary">Update Room</button>

                                    </div>
                                    <div className='col-md-6'>
                                        <button className='btn btn-secondary ms-2' onClick={resetForm}> Reset  </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomListManagement;