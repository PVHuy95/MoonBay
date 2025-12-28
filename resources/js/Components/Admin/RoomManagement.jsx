import React, { useEffect, useState } from 'react';
import { Edit, Save, X, Plus, Trash2, Search, Loader2, Info, Users, DollarSign } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    capacity: '',
    price: '',
    description: '',
    image: null,
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = () => {
    setLoading(true);
    fetch('/api/room_types')
      .then(res => res.json())
      .then(data => {
        const roomsWithImageUrl = data.map(room => {
          if (room.image && room.image_url) {
            room.image_url = room.image_url;
          } else {
            room.image_url = null;
          }
          return room;
        });
        setRooms(roomsWithImageUrl);
        setLoading(false);
      })
      .catch(err => {
        console.error("ERROR: ", err);
        toast.error('Failed to fetch rooms.');
        setLoading(false);
      });
  };

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

  const parseCurrencyInput = (value) => {
    // Loại bỏ ký tự không phải số (dấu phẩy, khoảng trắng, v.v.)
    return value.replace(/[^0-9]/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price') {
      // Lưu giá trị thô (số) và định dạng hiển thị
      const rawValue = parseCurrencyInput(value);
      setEditingRoom({ ...editingRoom, [name]: rawValue });
    } else {
      setEditingRoom({ ...editingRoom, [name]: value });
    }
  };

  const handleNewRoomInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price') {
      const rawValue = parseCurrencyInput(value);
      setNewRoom({ ...newRoom, [name]: rawValue });
    } else {
      setNewRoom({ ...newRoom, [name]: value });
    }
  };

  const handleEdit = (room) => {
    setEditingRoom({ ...room, image: null });
    setExpandedRoom(room.id);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file instanceof File && ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must not exceed 2MB.');
        return;
      }
      setEditingRoom({ ...editingRoom, image: file });
    } else {
      toast.error('Please select a valid image file (JPEG, PNG, JPG, GIF).');
    }
  };

  const handleNewRoomImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file instanceof File && ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must not exceed 2MB.');
        return;
      }
      setNewRoom({ ...newRoom, image: file });
    } else {
      toast.error('Please select a valid image file (JPEG, PNG, JPG, GIF).');
    }
  };

  const handleSave = () => {
    if (!editingRoom) {
      toast.error('No room selected for editing.');
      return;
    }

    if (!editingRoom.name || !editingRoom.capacity || !editingRoom.price) {
      toast.error('Please fill in all required fields (Name, Capacity, Price).');
      return;
    }

    const capacity = parseInt(editingRoom.capacity);
    const price = parseFloat(editingRoom.price);
    if (isNaN(capacity) || capacity < 1) {
      toast.error('Capacity must be a positive integer.');
      return;
    }
    if (isNaN(price) || price < 0) {
      toast.error('Price must be a non-negative number.');
      return;
    }

    const formData = new FormData();
    formData.append('name', String(editingRoom.name));
    formData.append('capacity', String(capacity));
    formData.append('price', String(price));
    formData.append('description', String(editingRoom.description || ''));

    if (editingRoom.image && editingRoom.image instanceof File) {
      formData.append('image', editingRoom.image);
    }

    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }

    setLoading(true);
    formData.append('_method', 'PUT');
    fetch(`/api/room_types/${editingRoom.id}`, {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(`HTTP ERROR! status: ${response.status}, response: ${JSON.stringify(data)}`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log("Response from server:", data);
        toast.success('Room updated successfully!');
        setEditingRoom(null);
        fetchRooms();
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error.message);
        try {
          const errorData = JSON.parse(error.message.split('response: ')[1]);
          if (errorData.messages) {
            const errorMessages = Object.values(errorData.messages).flat().join(' ');
            toast.error(`Update failed: ${errorMessages}`);
          } else {
            toast.error(`Update failed: ${errorData.error || error.message}`);
          }
        } catch (e) {
          toast.error(`Update failed: ${error.message}`);
        }
        setLoading(false);
      });
  };

  const handleAddRoom = () => {
    if (!newRoom.name || !newRoom.capacity || !newRoom.price) {
      toast.error('Please fill in all required fields (Name, Capacity, Price).');
      return;
    }

    const capacity = parseInt(newRoom.capacity);
    const price = parseFloat(newRoom.price);
    if (isNaN(capacity) || capacity < 1) {
      toast.error('Capacity must be a positive integer.');
      return;
    }
    if (isNaN(price) || price < 0) {
      toast.error('Price must be a non-negative number.');
      return;
    }

    const formData = new FormData();
    formData.append('name', String(newRoom.name));
    formData.append('capacity', String(capacity));
    formData.append('price', String(price));
    formData.append('description', String(newRoom.description || ''));

    if (newRoom.image && newRoom.image instanceof File) {
      formData.append('image', newRoom.image);
    }

    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }

    setLoading(true);
    fetch('/api/room_types', {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(`HTTP ERROR! status: ${response.status}, response: ${JSON.stringify(data)}`);
          });
        }
        return response.json();
      })
      .then(data => {
        toast.success('New room added successfully!');
        setShowAddForm(false);
        setNewRoom({ name: '', capacity: '', price: '', description: '', image: null });
        fetchRooms();
        setLoading(false);
      })
      .catch(error => {
        console.error('ERROR when adding room:', error);
        try {
          const errorData = JSON.parse(error.message.split('response: ')[1]);
          if (errorData.messages) {
            const errorMessages = Object.values(errorData.messages).flat().join(' ');
            toast.error(`Add room failed: ${errorMessages}`);
          } else {
            toast.error(`Add room failed: ${errorData.error || error.message}`);
          }
        } catch (e) {
          toast.error(`Add room failed: ${error.message}`);
        }
        setLoading(false);
      });
  };

  const toggleRoomDetails = (roomId) => {
    if (expandedRoom === roomId) setExpandedRoom(null);
    else setExpandedRoom(roomId);
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room type?')) return;

    setLoading(true);
    fetch(`/api/room_types/${roomId}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(`HTTP ERROR! status: ${response.status}, response: ${JSON.stringify(data)}`);
          });
        }
        toast.success('Room deleted successfully!');
        fetchRooms();
      })
      .catch(error => {
        console.error('ERROR when deleting room:', error);
        toast.error(`Delete failed: ${error.message}`);
        setLoading(false);
      });
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <div className="bg-primary text-white p-4 rounded-top">
        <h2 className="h4 mb-1">Room Type Management</h2>
        <p className="mb-0">Add, edit and manage room types in your hotel</p>
      </div>

      <div className="border p-4 rounded-bottom bg-white">
        <div className="row mb-4">
          <div className="col-md-6 mb-2">
            <div className="row mb-4">
              <div className="col-md-8 mb-2">
                <div className="position-relative">
                  <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
                  <input
                    type="text"
                    className="form-control ps-5"
                    placeholder="Search room type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 text-md-end">
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              <Plus size={16} className="me-2" /> Add Room Type
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="card card-body mb-4">
            <h5>Add New Room Type</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Room Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={newRoom.name}
                  onChange={handleNewRoomInputChange}
                  name="name"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Capacity</label>
                <input
                  type="number"
                  className="form-control"
                  value={newRoom.capacity}
                  onChange={handleNewRoomInputChange}
                  name="capacity"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Price (VND)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formatCurrency(newRoom.price)}
                  onChange={handleNewRoomInputChange}
                  name="price"
                />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={newRoom.description}
                  onChange={handleNewRoomInputChange}
                  name="description"
                />
              </div>
              <div className="col-12">
                <label className="form-label">Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/jpeg,image/png,image/jpg,image/gif"
                  onChange={handleNewRoomImageChange}
                />
              </div>
            </div>
            <div className="mt-3 d-flex gap-2">
              <button className="btn btn-success" onClick={handleAddRoom}>
                <Save size={18} className="me-2" /> Save
              </button>
              <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                <X size={18} className="me-2" /> Cancel
              </button>
            </div>
          </div>
        )}

        {loading && rooms.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-2" />
            <p>Loading data...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="alert alert-info text-center">
            <Info size={24} className="me-2" />
            {searchTerm ? 'No matching room type found.' : 'No room types available.'}
          </div>
        ) : (
          <div className="accordion" id="roomAccordion">
            {filteredRooms.map((room) => (
              <div className="accordion-item mb-3" key={room.id}>
                <h2 className="accordion-header">
                  <button
                    className={`accordion-button ${expandedRoom === room.id ? '' : 'collapsed'}`}
                    type="button"
                    onClick={() => editingRoom?.id !== room.id && toggleRoomDetails(room.id)}
                  >
                    <div className="flex-grow-1">
                      <strong>{room.name}</strong>
                      <div className="text-muted small mt-1">
                        <Users size={14} className="me-1" /> {room.capacity} people |{' '}
                        <DollarSign size={14} className="me-1 text-success" /> {formatCurrency(room.price)}
                      </div>
                    </div>
                  </button>
                </h2>
                <div className={`accordion-collapse collapse ${expandedRoom === room.id ? 'show' : ''}`}>
                  <div className="accordion-body">
                    {editingRoom?.id === room.id ? (
                      <>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label">Room Name</label>
                            <input
                              name="name"
                              className="form-control"
                              value={editingRoom.name}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Capacity</label>
                            <input
                              type="number"
                              name="capacity"
                              className="form-control"
                              value={editingRoom.capacity}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Price (VND)</label>
                            <input
                              type="text"
                              name="price"
                              className="form-control"
                              value={formatCurrency(editingRoom.price)}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Description</label>
                            <textarea
                              name="description"
                              className="form-control"
                              value={editingRoom.description}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <label className="form-label">Image</label>
                            <input
                              type="file"
                              name="image"
                              className="form-control"
                              accept="image/jpeg,image/png,image/jpg,image/gif"
                              onChange={handleImageChange}
                            />
                          </div>
                        </div>
                        <div className="d-flex gap-2 mt-3">
                          <button className="btn btn-success" onClick={handleSave}>
                            <Save size={18} className="me-2" /> Save
                          </button>
                          <button className="btn btn-secondary" onClick={() => setEditingRoom(null)}>
                            <X size={18} className="me-2" /> Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p>{room.description}</p>
                        {room.image_url && (
                          <img src={room.image_url} alt={room.name} className="img-fluid mb-2" style={{ maxWidth: '50%' }} />
                        )}
                        <div className="d-flex gap-2">
                          <button className="btn btn-warning" onClick={() => handleEdit(room)}>
                            <Edit size={18} /> Edit
                          </button>
                          <button className="btn btn-danger" onClick={() => handleDelete(room.id)}>
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
      </div>
    </div>
  );
};

export default RoomManagement;