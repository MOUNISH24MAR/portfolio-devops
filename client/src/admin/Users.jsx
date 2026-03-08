import { useState, useEffect } from "react";
import { Search, MoreVertical, Shield, CheckCircle, X, UserPlus, Mail, User, ShieldAlert, Trash2, Edit2 } from "lucide-react";
import "./admin_css/AdminMaster.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
    role: "MANAGER"
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchData();
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const checkMobile = () => setIsMobile(window.innerWidth < 768);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };



  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ username: "", password: "", email: "", name: "", role: "MANAGER" });
        fetchData();
      } else {
        const error = await res.json();
        alert(error.msg || "Error creating user");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id, isEmployee) => {
    if (isEmployee) {
      alert("Cannot delete verified employees from here. Use Employee Management.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Mapping Personnel Directory...</div>;

  return (
    <div className="admin-content-wrapper">
      <div className="chart-card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: '20px',
          marginBottom: '32px' 
        }}>
          <div>
            <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.25rem', marginBottom: '4px' }}>Access Control</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Manage internal system identities and role assignments</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              background: 'var(--bg-light)', 
              padding: '10px 16px', 
              borderRadius: '4px', 
              border: '1px solid var(--border-subtle)',
              width: '100%'
            }}>
              <Search size={16} color="var(--text-secondary)" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'none', border: 'none', padding: '4px 8px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', width: '100%' }}
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="admin-btn-primary"
              style={{ padding: '12px 24px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <UserPlus size={18} />
              <span>Create User</span>
            </button>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Identity</th>
                <th>Access Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user.username}</td>
                  <td>{user.name}</td>
                  <td>{user.email || "N/A"}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {user.role === 'ADMIN' ? (
                        <Shield size={14} color="var(--admin-danger)" />
                      ) : (
                        <CheckCircle size={14} color="var(--admin-success)" />
                      )}
                      {user.isEmployee ? `Verified ${user.role} Personnel` : `System ${user.role}`}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: user.status === 'VERIFIED' ? 'var(--admin-success)' : 'var(--admin-warning)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                      {user.status || 'VERIFIED'}
                    </span>
                  </td>
                  <td>
                    <div className="dropdown-container">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === user._id ? null : user._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      >
                        <MoreVertical size={18} />
                      </button>
                      {activeDropdown === user._id && (
                        <div className="dropdown-menu">
                          <div className="dropdown-item">
                            <Edit2 size={14} /> Edit Access
                          </div>
                          {!user.isEmployee && (
                            <div
                              className="dropdown-item danger"
                              onClick={() => {
                                handleDeleteUser(user._id, user.isEmployee);
                                setActiveDropdown(null);
                              }}
                            >
                              <Trash2 size={14} /> Terminate
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No personnel records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Create Identity</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="admin-form-group">
                <label>Username / User ID</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    className="admin-input"
                    style={{ paddingLeft: '40px' }}
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. manager_jane"
                  />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="admin-input"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="admin-form-group">
                <label>Email Identity</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type="email"
                    className="admin-input"
                    style={{ paddingLeft: '40px' }}
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@vrfashions.com"
                  />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Initial Password</label>
                <input
                  type="password"
                  className="admin-input"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="admin-form-group">
                <label>Access Level</label>
                <select
                  className="admin-select-full"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="MANAGER">MANAGER (Standard Access)</option>
                  <option value="ADMIN">ADMIN (Full System Access)</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Provision Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
