import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const statusPriority = {
  pending: 1,
  resolved: 2,
  rejected: 3,
};

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editedComplaints, setEditedComplaints] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (pageNumber) => {
    setLoading(true);
    try {
      const [complaintsRes, staffRes] = await Promise.all([
        axios.get(`/api/admin/complaints?page=${pageNumber}`),
        axios.get('/api/admin/employees'),
      ]);

      const sorted = complaintsRes.data.data.sort((a, b) => {
        if (statusPriority[a.status] !== statusPriority[b.status]) {
          return statusPriority[a.status] - statusPriority[b.status];
        }
        return new Date(a.created_at) - new Date(b.created_at);
      });

      setComplaints(sorted);
      setStaffList(staffRes.data);
      setTotalPages(complaintsRes.data.last_page);
      setTotal(complaintsRes.data.total);
      setLoading(false);
      setEditedComplaints({});
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Failed to load complaints!');
      setLoading(false);
    }
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
    }
  };

  const handleChangeLocal = (id, field, value) => {
    setEditedComplaints((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async (id) => {
    if (!window.confirm('Are you sure you want to save changes?')) return;

    try {
      const updatedData = editedComplaints[id];
      if (!updatedData) return;

      await axios.put(`/api/admin/complaints/${id}`, updatedData);
      toast.success('Changes saved successfully!');

      const updatedComplaints = complaints.map((c) => {
        if (c.id === id) {
          return { ...c, ...updatedData };
        }
        return c;
      });

      const sorted = [...updatedComplaints].sort((a, b) => {
        const aPriority = statusPriority[a.status] || 99;
        const bPriority = statusPriority[b.status] || 99;
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        return new Date(a.created_at) - new Date(b.created_at);
      });
      setComplaints(sorted);

      setEditedComplaints((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      console.error('Error saving:', err);
      toast.error('Failed to save changes!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;

    try {
      await axios.delete(`/api/admin/complaints/${id}`);
      toast.success('Complaint deleted successfully!');
      fetchData(page);
    } catch (err) {
      console.error('Error deleting:', err);
      toast.error('Failed to delete complaint!');
    }
  };

  if (loading) return <div className="container text-center py-5">Loading data...</div>;

  return (
    <div className="container py-5 bg-light rounded-3 shadow-sm">
      <ToastContainer />
      <h2 className="text-center mb-4 fw-bold">Manage Complaints</h2>

      <style>
        {`
          /* Điều chỉnh độ rộng cột */
          .custom-table th, .custom-table td {
            vertical-align: middle;
            text-align: center;
            white-space: nowrap; /* Ngăn wrap nội dung */
            overflow: hidden;
            text-overflow: ellipsis; /* Hiển thị ... nếu nội dung quá dài */
          }

          /* Độ rộng cố định cho từng cột */
          .custom-table th:nth-child(1), .custom-table td:nth-child(1) {
            width: 50px; /* ID */
          }
          .custom-table th:nth-child(2), .custom-table td:nth-child(2) {
            width: 60px; /* UserID */
          }
          .custom-table th:nth-child(3), .custom-table td:nth-child(3) {
            width: 80px; /* Name */
          }
          .custom-table th:nth-child(4), .custom-table td:nth-child(4) {
            width: 120px; /* Email */
          }
          .custom-table th:nth-child(5), .custom-table td:nth-child(5) {
            width: 100px; /* Phone Number */
          }
          .custom-table th:nth-child(6), .custom-table td:nth-child(6) {
            width: 100px; /* Complaint Type */
          }
          .custom-table th:nth-child(7), .custom-table td:nth-child(7) {
            width: 150px; /* Description */
          }
          .custom-table th:nth-child(8), .custom-table td:nth-child(8) {
            width: 80px; /* Contact Preference */
          }
          .custom-table th:nth-child(9), .custom-table td:nth-child(9) {
            width: 100px; /* Created Date */
          }
          .custom-table th:nth-child(10), .custom-table td:nth-child(10) {
            width: 150px; /* Status */
          }
          .custom-table th:nth-child(11), .custom-table td:nth-child(11) {
            width: 150px; /* Handler */
          }
          .custom-table th:nth-child(12), .custom-table td:nth-child(12) {
            width: 120px; /* Action */
          }

          /* Đảm bảo dropdown hiển thị đầy đủ nội dung */
          .custom-table .form-select {
            width: 100%;
            min-width: 120px;
            padding: 5px;
          }

          /* Responsive cho màn hình nhỏ */
          @media (max-width: 768px) {
            .custom-table th, .custom-table td {
              font-size: 14px;
              padding: 8px 4px; /* Giảm padding trên mobile */
            }
            .custom-table th:nth-child(1), .custom-table td:nth-child(1) {
              width: 40px;
            }
            .custom-table th:nth-child(2), .custom-table td:nth-child(2) {
              width: 50px;
            }
            .custom-table th:nth-child(3), .custom-table td:nth-child(3) {
              width: 60px;
            }
            .custom-table th:nth-child(4), .custom-table td:nth-child(4) {
              width: 100px;
            }
            .custom-table th:nth-child(5), .custom-table td:nth-child(5) {
              width: 80px;
            }
            .custom-table th:nth-child(6), .custom-table td:nth-child(6) {
              width: 80px;
            }
            .custom-table th:nth-child(7), .custom-table td:nth-child(7) {
              width: 120px;
            }
            .custom-table th:nth-child(8), .custom-table td:nth-child(8) {
              width: 60px;
            }
            .custom-table th:nth-child(9), .custom-table td:nth-child(9) {
              width: 80px;
            }
            .custom-table th:nth-child(10), .custom-table td:nth-child(10) {
              width: 120px;
            }
            .custom-table th:nth-child(11), .custom-table td:nth-child(11) {
              width: 120px;
            }
            .custom-table th:nth-child(12), .custom-table td:nth-child(12) {
              width: 100px;
            }
          }

          /* Đảm bảo các nút Save/Delete không bị co lại */
          .custom-table .btn-sm {
            padding: 5px 10px;
            font-size: 14px;
          }
        `}
      </style>

      <div className="table-responsive">
        <table className="table table-striped table-bordered table-hover align-middle custom-table">
          <thead className="table-light">
            <tr className="text-center">
              <th scope="col">ID</th>
              <th scope="col">UserID</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Phone Number</th>
              <th scope="col">Complaint Type</th>
              <th scope="col">Description</th>
              <th scope="col">Contact Preference</th>
              <th scope="col">Created Date</th>
              <th scope="col">Status</th>
              <th scope="col">Handler</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => {
              const edited = editedComplaints[c.id] || {};
              const status = edited.status ?? c.status ?? 'pending';
              const handler_name = edited.handler_name ?? c.handler_name ?? '';

              return (
                <tr key={c.id} className="text-center">
                  <td>{c.id}</td>
                  <td>{c.user_id}</td>
                  <td>{c.name}</td>
                  <td>{c.customer_email}</td>
                  <td>{c.customer_phone}</td>
                  <td>{c.complaint_type}</td>
                  <td>{c.description}</td>
                  <td>{c.contact_preference}</td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={status}
                      onChange={(e) => handleChangeLocal(c.id, 'status', e.target.value)}
                      className="form-select form-select-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={handler_name}
                      onChange={(e) => handleChangeLocal(c.id, 'handler_name', e.target.value)}
                      className="form-select form-select-sm"
                    >
                      <option value="">-- Select employee --</option>
                      {staffList.map((staff) => (
                        <option key={staff.id} value={staff.name}>
                          {staff.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        onClick={() => handleSave(c.id)}
                        className="btn btn-primary btn-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-3">
        <p className="fw-bold">Total complaints: {total}</p>
      </div>

      <nav aria-label="Page navigation" className="d-flex justify-content-center mt-3">
        <ul className="pagination">
          <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(page - 1)}>
              Previous
            </button>
          </li>
          {getPageNumbers().map((p, i) =>
            p === '...' ? (
              <li key={i} className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            ) : (
              <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(p)}>
                  {p}
                </button>
              </li>
            )
          )}
          <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(page + 1)}>
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ManageComplaints;