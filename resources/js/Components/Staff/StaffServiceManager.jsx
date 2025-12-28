import React, { useEffect, useState } from 'react';
import { Edit, Save, X, Plus, Trash2, Loader2, Info, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Cookies from 'js-cookie';
import '../../../css/css_of_staff/StaffServiceManager.css';

const initialService = {
    title: '',
    image: '',
    description: '',
    detailed_description: '',
    working_hours: '',
    status: 'active', // ensure default status field
    pricing: []
};

const StaffServiceManager = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newService, setNewService] = useState(initialService);
    const [editingService, setEditingService] = useState(null);
    const [expandedService, setExpandedService] = useState(null);
    const [pricingInput, setPricingInput] = useState({ type: '', value: '' });
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Local search state - không dùng SearchContext
    const [localSearchQuery, setLocalSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [imageUploadLoading, setImageUploadLoading] = useState(false);
    const [editImagePreview, setEditImagePreview] = useState('');
    const [editImageUploadLoading, setEditImageUploadLoading] = useState(false);    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const servicesPerPage = 4;
    // Sorting state
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

    useEffect(() => {
        fetchServices();
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

    // Fetch services
    const fetchServices = async () => {
        setLoading(true);
        try {
            // Thêm độ trễ để hiển thị hiệu ứng loading
            await new Promise(resolve => setTimeout(resolve, 400));

            const token = Cookies.get('auth_token');
            const response = await axios.get('/api/services', {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Map data to ensure pricing is an array
            const mapped = response.data.map(service => ({
                ...service,
                pricing: service.pricing || []
            }));
            setServices(mapped);
            setLoading(false);
        } catch (err) {
            setError('Error fetching service list');
            setLoading(false);
        }
    };

    // Format currency for display
    const formatCurrency = (value) => {
        if (!value && value !== 0) return '';
        const number = parseFloat(value);
        if (isNaN(number)) return '';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(number).replace('₫', '').trim();
    };

    // Add new service
    const handleAddService = async () => {
        if (!newService.title) {
            toast.error('Please enter the service name.');
            return;
        }
        setLoading(true);
        try {
            const token = Cookies.get('auth_token');
            const { pricing, ...serviceData } = newService;
            // Gửi dữ liệu dịch vụ (không pricing)
            const res = await axios.post('/api/services', serviceData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Gửi pricing nếu có
            if (newService.pricing.length > 0) {
                for (const price of newService.pricing) {
                    await axios.post(`/api/service_pricing`, {
                        service_id: res.data.id,
                        type: price.type,
                        value: price.value
                    }, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                }
            }
            toast.success('Service added successfully!');
            setNewService(initialService);
            setShowAddForm(false);
            fetchServices();
        } catch (err) {
            toast.error('Error adding service');
        }
        setLoading(false);
    };

    // Edit service
    const handleEdit = (service) => {
        setEditingService({ ...service, pricing: service.pricing || [] });
        setExpandedService(service.id);
    };

    // Save edited service
    const handleSave = async () => {
        if (!editingService.title) {
            toast.error('Please enter the service name.');
            return;
        }
        setLoading(true);
        try {
            const token = Cookies.get('auth_token');
            const { pricing, ...rest } = editingService;
            const serviceData = { ...rest, status: editingService.status };
            await axios.put(`/api/services/${editingService.id}`, serviceData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (editingService.pricing && editingService.pricing.length > 0) {
                await axios.delete(`/api/service_pricing/by-service/${editingService.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                for (const price of editingService.pricing) {
                    await axios.post(`/api/service_pricing`, {
                        service_id: editingService.id,
                        type: price.type,
                        value: price.value
                    }, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                }
            }
            toast.success('Service updated successfully!');
            // Lấy lại service mới nhất và giữ form mở
            const updated = await axios.get(`/api/services/${editingService.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEditingService({ ...updated.data, pricing: updated.data.pricing || [] });
            fetchServices();
        } catch (err) {
            toast.error('Error updating service');
        }
        setLoading(false);
    };

    // Delete service
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        setLoading(true);
        try {
            const token = Cookies.get('auth_token');
            await axios.delete(`/api/services/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Service deleted successfully!');
            fetchServices();
        } catch (err) {
            toast.error('Error deleting service');
        }
        setLoading(false);
    };

    // Add pricing to new service
    const handleAddPricing = () => {
        if (!pricingInput.type || !pricingInput.value) return;
        setNewService(prev => ({
            ...prev,
            pricing: [...prev.pricing, pricingInput]
        }));
        setPricingInput({ type: '', value: '' });
    };

    // Remove pricing from new service
    const handleRemovePricing = (idx) => {
        setNewService(prev => ({
            ...prev,
            pricing: prev.pricing.filter((_, i) => i !== idx)
        }));
    };

    // Add pricing to editing service
    const handleAddPricingEdit = () => {
        if (!pricingInput.type || !pricingInput.value) return;
        setEditingService(prev => ({
            ...prev,
            pricing: [...(prev.pricing || []), pricingInput]
        }));
        setPricingInput({ type: '', value: '' });
    };

    // Remove pricing from editing service
    const handleRemovePricingEdit = (idx) => {
        setEditingService(prev => ({
            ...prev,
            pricing: prev.pricing.filter((_, i) => i !== idx)
        }));
    };    // Toggle details
    const toggleServiceDetails = (serviceId) => {
        if (expandedService === serviceId) setExpandedService(null);
        else setExpandedService(serviceId);
    };

    // Search handler functions
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

    // Sorting handler
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // Sorting logic
    const getSortedServices = (list) => {
        if (!sortField) return list;
        return [...list].sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];
            // Special handling for price (use first pricing value if exists)
            if (sortField === 'price') {
                aValue = a.pricing && a.pricing[0] ? parseFloat(a.pricing[0].value.replace(/[^\d.]/g, '')) : 0;
                bValue = b.pricing && b.pricing[0] ? parseFloat(b.pricing[0].value.replace(/[^\d.]/g, '')) : 0;
            }
            // Special handling for created_at
            if (sortField === 'created_at') {
                aValue = a.created_at ? new Date(a.created_at) : new Date(0);
                bValue = b.created_at ? new Date(b.created_at) : new Date(0);
            }
            // Status: sort by string
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                if (sortOrder === 'asc') return aValue.localeCompare(bValue);
                return bValue.localeCompare(aValue);
            }
            // Number/date
            if (sortOrder === 'asc') return aValue - bValue;
            return bValue - aValue;
        });
    };    // Filtered and sorted services
    const filteredServices = services.filter(service =>
        (service.title || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
    const sortedServices = getSortedServices(filteredServices);
    // Pagination logic
    const totalPages = Math.ceil(sortedServices.length / servicesPerPage);
    const paginatedServices = sortedServices.slice(
        (currentPage - 1) * servicesPerPage,
        currentPage * servicesPerPage
    );

    // At the top of the component
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageUploadLoading(true);
        setImagePreview(URL.createObjectURL(file));
        const formData = new FormData();
        formData.append('image', file);
        try {
            const token = Cookies.get('auth_token');
            const res = await axios.post('/api/upload-service-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            setNewService(prev => ({ ...prev, image: res.data.path }));
        } catch (err) {
            toast.error('Error uploading image');
        }
        setImageUploadLoading(false);
    };

    // Handle image upload when editing service
    const handleEditImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setEditImageUploadLoading(true);
        setEditImagePreview(URL.createObjectURL(file));
        const formData = new FormData();
        formData.append('image', file);
        // Gửi đường dẫn ảnh cũ nếu có
        if (editingService?.image) {
            formData.append('oldImage', editingService.image);
        }
        try {
            const token = Cookies.get('auth_token');
            const res = await axios.post('/api/upload-service-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            setEditingService(prev => ({ ...prev, image: res.data.path }));
        } catch (err) {
            toast.error('Error uploading image');
        }
        setEditImageUploadLoading(false);
    };

    // Confirm service status change
    const handleStatusChange = (status) => {
        setPendingStatus(status);
        setShowStatusConfirm(true);
    };
    const confirmStatusChange = () => {
        setEditingService(prev => ({ ...prev, status: pendingStatus }));
        setShowStatusConfirm(false);
        setPendingStatus(null);
    };
    const cancelStatusChange = () => {
        setShowStatusConfirm(false);
        setPendingStatus(null);
    };    // Reset page when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery]);

    return (
        <div className="staff-service-manager">
            <h2 className="staff-service-title">Service Management</h2>
            <p className="staff-service-description">Add, edit, delete and manage services for your hotel</p>            <div className="row-action-service">
                <div className="staff-service-add-container">
                    <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                        <Plus size={16} className="me-2" /> Add Service
                    </button>
                </div>                <div className="search-input-wrapper">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for services..."
                        value={localSearchQuery}
                        onChange={handleSearchChange}
                    />
                    {isSearching && <div className="search-spinner"></div>}
                    {localSearchQuery && !isSearching && (
                        <button className="clear-search-btn" onClick={clearSearch}>
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* Search Results Count */}
            {debouncedSearchQuery && !loading && (
                <div className="search-results-info">
                    Found {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} 
                    matching "{debouncedSearchQuery}"
                </div>
            )}
            {/* Sorting controls */}
            <div className="d-flex gap-3 align-items-center mb-3">
                <span className="fw-bold">Sort by:</span>
                <button className="btn btn-outline-secondary btn-sm d-flex align-items-center" onClick={() => handleSort('title')}>
                    Name {sortField === 'title' && (sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
                </button>
                <button className="btn btn-outline-secondary btn-sm d-flex align-items-center" onClick={() => handleSort('price')}>
                    Price {sortField === 'price' && (sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
                </button>
                <button className="btn btn-outline-secondary btn-sm d-flex align-items-center" onClick={() => handleSort('created_at')}>
                    Created Date {sortField === 'created_at' && (sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
                </button>
                <button className="btn btn-outline-secondary btn-sm d-flex align-items-center" onClick={() => handleSort('status')}>
                    Status {sortField === 'status' && (sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
                </button>
            </div>
            <div className="border p-4 rounded-bottom bg-white">
                {showAddForm && (
                    <div className="card card-body mb-4">
                        <h5>Add New Service</h5>
                        <form className="staff-service-form" onSubmit={e => e.preventDefault()}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Service Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newService.title}
                                        onChange={e => setNewService({ ...newService, title: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Image (upload)</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    {imageUploadLoading && <div className="mt-2"><span className="spinner-border spinner-border-sm text-primary" /> Uploading...</div>}
                                    {imagePreview && !imageUploadLoading && (
                                        <img src={imagePreview} alt="Preview" className="img-thumbnail mt-2" style={{ maxHeight: 100 }} />
                                    )}
                                    {!imagePreview && newService.image && !imageUploadLoading && (
                                        <img src={newService.image.startsWith('http') ? newService.image : newService.image.replace(/^\./, '')} alt="Preview" className="img-thumbnail mt-2" style={{ maxHeight: 100 }} onError={e => { e.target.onerror = null; e.target.src = '/images/default-service.png'; }} />
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Working Hours</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newService.working_hours}
                                        onChange={e => setNewService({ ...newService, working_hours: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-control"
                                        value={newService.status || 'inactive'}
                                        onChange={e => setNewService({ ...newService, status: e.target.value })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Short Description</label>
                                    <textarea
                                        className="form-control"
                                        rows={2}
                                        value={newService.description}
                                        onChange={e => setNewService({ ...newService, description: e.target.value })}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Detailed Description</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={newService.detailed_description}
                                        onChange={e => setNewService({ ...newService, detailed_description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="mt-3">
                                <label className="form-label">Service Pricing</label>
                                <div className="d-flex align-items-center mb-2">
                                    <input
                                        type="text"
                                        placeholder="Pricing type (e.g., Adult, Child)"
                                        className="form-control me-2"
                                        value={pricingInput.type}
                                        onChange={e => setPricingInput({ ...pricingInput, type: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value (e.g., 100,000đ)"
                                        className="form-control me-2"
                                        value={pricingInput.value}
                                        onChange={e => setPricingInput({ ...pricingInput, value: e.target.value })}
                                    />
                                    <button className="btn btn-success btn-sm" onClick={handleAddPricing} type="button">Add Price</button>
                                </div>
                                <ul className="mb-2">
                                    {newService.pricing.map((p, idx) => (
                                        <li key={idx}>
                                            {p.type}: {p.value} <button type="button" className="staff-service-btn-danger staff-service-btn-sm ms-2" onClick={() => handleRemovePricing(idx)}>Remove</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-3 d-flex gap-2">
                                <button className="btn btn-success" type="button" onClick={handleAddService}>
                                    <Save size={18} className="me-2" /> Save
                                </button>
                                <button className="btn btn-secondary" type="button" onClick={() => setShowAddForm(false)}>
                                    <X size={18} className="me-2" /> Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                {loading && services.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary mb-2" />
                        <p>Loading data...</p>
                    </div>                ) : sortedServices.length === 0 ? (
                    <div className="alert alert-info text-center">
                        <Info size={24} className="me-2" />
                        {debouncedSearchQuery ? 'No matching services found.' : 'No services available.'}
                    </div>
                ) : (
                    <div className="accordion" id="serviceAccordion">
                        {paginatedServices.map((service) => (
                            <div className="accordion-item mb-3" key={service.id}>
                                <h2 className="accordion-header">
                                    <button
                                        className={`accordion-button ${expandedService === service.id ? '' : 'collapsed'}`}
                                        type="button"
                                        onClick={() => editingService?.id !== service.id && toggleServiceDetails(service.id)}
                                    >
                                        <div className="flex-grow-1">
                                            <strong>{service.title}</strong>
                                            <div className="text-muted small mt-1">
                                                <span className="me-2">Service status: {service.status || 'Inactive'}</span>
                                            </div>
                                        </div>
                                    </button>
                                </h2>
                                <div className={`accordion-collapse collapse ${expandedService === service.id ? 'show' : ''}`}>
                                    <div className="accordion-body">
                                        {editingService?.id === service.id ? (
                                            <>
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Service Name</label>
                                                        <input
                                                            className="form-control"
                                                            value={editingService.title}
                                                            onChange={e => setEditingService({ ...editingService, title: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Image (upload)</label>
                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            accept="image/*"
                                                            onChange={handleEditImageChange}
                                                        />
                                                        {editImageUploadLoading && <div className="mt-2"><span className="spinner-border spinner-border-sm text-primary" /> Uploading...</div>}
                                                        {editImagePreview && !editImageUploadLoading && (
                                                            <img src={editImagePreview} alt="Preview" className="img-thumbnail mt-2" style={{ maxHeight: 100 }} />
                                                        )}
                                                        {!editImagePreview && editingService.image && !editImageUploadLoading && (
                                                            <img src={editingService.image.startsWith('http') ? editingService.image : editingService.image.replace(/^\./, '')} alt="Preview" className="img-thumbnail mt-2" style={{ maxHeight: 100 }} onError={e => { e.target.onerror = null; e.target.src = '/images/default-service.png'; }} />
                                                        )}
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Working Hours</label>
                                                        <input
                                                            className="form-control"
                                                            value={editingService.working_hours}
                                                            onChange={e => setEditingService({ ...editingService, working_hours: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Status</label>
                                                        <select
                                                            className="form-control"
                                                            value={editingService.status || 'inactive'}
                                                            onChange={e => {
                                                                // Chỉ mở modal xác nhận, không đổi giá trị ngay
                                                                setPendingStatus(e.target.value);
                                                                setShowStatusConfirm(true);
                                                            }}
                                                        >
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-12">
                                                        <label className="form-label">Short Description</label>
                                                        <textarea
                                                            className="form-control"
                                                            rows={2}
                                                            value={editingService.description}
                                                            onChange={e => setEditingService({ ...editingService, description: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="col-12">
                                                        <label className="form-label">Detailed Description</label>
                                                        <textarea
                                                            className="form-control"
                                                            rows={3}
                                                            value={editingService.detailed_description}
                                                            onChange={e => setEditingService({ ...editingService, detailed_description: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <label className="form-label">Service Pricing</label>
                                                    <div className="d-flex align-items-center mb-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Pricing type (e.g., Adult, Child)"
                                                            className="form-control me-2"
                                                            value={pricingInput.type}
                                                            onChange={e => setPricingInput({ ...pricingInput, type: e.target.value })}
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Value (e.g., 100,000đ)"
                                                            className="form-control me-2"
                                                            value={pricingInput.value}
                                                            onChange={e => setPricingInput({ ...pricingInput, value: e.target.value })}
                                                        />
                                                        <button className="btn btn-success btn-sm" onClick={handleAddPricingEdit} type="button">Add Price</button>
                                                    </div>
                                                    <ul className="mb-2">
                                                        {editingService.pricing && editingService.pricing.map((p, idx) => (
                                                            <li key={idx}>
                                                                {p.type}: {p.value} <button type="button" className="staff-service-btn-danger staff-service-btn-sm ms-2" onClick={() => handleRemovePricingEdit(idx)}>Remove</button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="d-flex gap-2 mt-3">
                                                    <button className="btn btn-success" onClick={handleSave}>
                                                        <Save size={18} className="me-2" /> Save
                                                    </button>
                                                    <button className="btn btn-secondary" onClick={() => setEditingService(null)}>
                                                        <X size={18} className="me-2" /> Cancel
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="row">
                                                    <div className="col-md-4 mb-2">
                                                        {service.image && (
                                                            <img
                                                                src={service.image.startsWith('http') ? service.image : service.image.replace(/^\./, '')}
                                                                alt="Service image"
                                                                className="img-fluid rounded"
                                                                style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'cover' }}
                                                                onError={e => { e.target.onerror = null; e.target.src = '/images/default-service.png'; }}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="col-md-8">
                                                        <p className="mb-1"><strong>Working Hours:</strong> {service.working_hours}</p>
                                                        <p className="mb-1"><strong>Description:</strong> {service.description}</p>
                                                        <p className="mb-1"><strong>Detailed Description:</strong> {service.detailed_description}</p>
                                                        <div className="mb-2">
                                                            <strong>Pricing:</strong>
                                                            <ul>
                                                                {service.pricing && service.pricing.length > 0 ? (
                                                                    service.pricing.map((p, idx) => (
                                                                        <li key={idx}>{p.type}: {p.value}</li>
                                                                    ))
                                                                ) : (
                                                                    <li>No pricing available.</li>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="d-flex gap-2 mt-2">
                                                    <button className="btn btn-warning" onClick={() => handleEdit(service)}>
                                                        <Edit size={18} /> Edit
                                                    </button>
                                                    <button className="staff-service-btn-danger staff-service-btn-sm" onClick={() => handleDelete(service.id)}>
                                                        <Trash2 size={18} /> Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>            {/* Pagination controls */}
            {totalPages > 1 && (
                <div className="staff-service-pagination">
                    <button
                        className="staff-service-page-btn"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        &lt;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            className={`staff-service-page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                            onClick={() => setCurrentPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        className="staff-service-page-btn"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        &gt;
                    </button>
                </div>
            )}
            {/* Modal xác nhận đổi trạng thái */}
            {showStatusConfirm && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Status Change</h5>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to change the service status to <b>{pendingStatus === 'active' ? 'Active' : 'Inactive'}</b>?</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => {
                                    setShowStatusConfirm(false);
                                    setPendingStatus(null);
                                }}>Cancel</button>
                                <button className="btn btn-primary" onClick={() => {
                                    setEditingService(prev => ({ ...prev, status: pendingStatus }));
                                    setShowStatusConfirm(false);
                                    setPendingStatus(null);
                                }}>Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default StaffServiceManager;
