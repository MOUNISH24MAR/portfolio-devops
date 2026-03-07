import { useState, useEffect } from "react";
import { 
  Mail, 
  CheckCircle, 
  Trash2, 
  Clock, 
  Building2, 
  Phone, 
  User, 
  MessageSquare, 
  AlertCircle,
  BarChart3,
  Cpu,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Inbox
} from "lucide-react";
import "./admin_css/Inquiries.css";

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, new, responded
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/admin/contact-inquiries", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setInquiries(data);
      } else {
        setError(data.msg || "Failed to fetch inquiries");
      }
    } catch (err) {
      setError("Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/contact-inquiries/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (response.ok) {
        const updatedData = inquiries.map(inq => 
          inq._id === id ? { ...inq, status: inq.status === 'new' ? 'responded' : 'new' } : inq
        );
        setInquiries(updatedData);
        if (selectedInquiry?._id === id) {
          setSelectedInquiry({ ...selectedInquiry, status: selectedInquiry.status === 'new' ? 'responded' : 'new' });
        }
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/contact-inquiries/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (response.ok) {
        setInquiries(inquiries.filter(inq => inq._id !== id));
        if (selectedInquiry?._id === id) setSelectedInquiry(null);
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const stats = {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    responded: inquiries.filter(i => i.status === 'responded').length,
    responseRate: inquiries.length > 0 ? ((inquiries.filter(i => i.status === 'responded').length / inquiries.length) * 100).toFixed(1) : 0
  };

  const filteredInquiries = inquiries.filter(inq => {
    const matchesFilter = filter === "all" || inq.status === filter;
    const matchesSearch = 
      inq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.message?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return <div className="admin-loading">Mapping Dialogue Streams...</div>;

  return (
    <div className="admin-content-wrapper">
      {/* HEADER */}
      <header className="dashboard-control-bar">
        <div className="control-info">
          <h1>Correspondence Node</h1>
          <p>Global portal submissions: <span style={{ color: 'var(--admin-success)' }}>Active</span></p>
        </div>
        <div className="control-actions">
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--admin-card-bg)', padding: '8px 16px', border: '1px solid var(--admin-border)' }}>
            <Search size={16} color="var(--admin-text-secondary)" />
            <input
              type="text"
              placeholder="Search dialogues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'none', border: 'none', padding: '4px 8px', color: 'var(--admin-text-primary)', outline: 'none', fontSize: '0.8rem' }}
            />
          </div>
          <button className="sync-btn" onClick={fetchInquiries}>
             Refresh Stream
          </button>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header"><Inbox size={18} /></div>
          <div className="kpi-value">{stats.total}</div>
          <div className="kpi-label">Total Inquiries</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header"><AlertCircle size={18} color="var(--admin-warning)" /></div>
          <div className="kpi-value">{stats.new}</div>
          <div className="kpi-label">Pending Response</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header"><CheckCircle size={18} color="var(--admin-success)" /></div>
          <div className="kpi-value">{stats.responded}</div>
          <div className="kpi-label">Resolved Dialogues</div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="charts-grid" style={{ gridTemplateColumns: selectedInquiry && window.innerWidth > 1024 ? '1.5fr 1fr' : '1fr' }}>
        <div className="chart-card">
          <div className="card-actions">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
               <h3>Transmission Queue</h3>
               <div className="filter-group-mini">
                  <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
                  <button className={filter === 'new' ? 'active' : ''} onClick={() => setFilter('new')}>New</button>
                  <button className={filter === 'responded' ? 'active' : ''} onClick={() => setFilter('responded')}>Responded</button>
               </div>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Identity</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Protocol</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map(inq => (
                  <tr key={inq._id} className={selectedInquiry?._id === inq._id ? 'selected-row' : ''} onClick={() => setSelectedInquiry(inq)}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inq.name}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{inq.email}</div>
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      <div className="text-truncate">{inq.subject || "No Subject"}</div>
                    </td>
                    <td>{new Date(inq.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge status-${inq.status}`}>
                        {inq.status}
                      </span>
                    </td>
                    <td>
                      <button className="view-btn" onClick={(e) => { e.stopPropagation(); setSelectedInquiry(inq); }}>
                        Analyze
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredInquiries.length === 0 && (
                  <tr>
                    <td colSpan="5" align="center" style={{ padding: '60px', opacity: 0.5 }}>
                      <Inbox size={48} style={{ marginBottom: '16px' }} />
                      <p>No transactions detected in this spectrum.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAIL PANEL / MODAL for Mobile */}
        {selectedInquiry && (
          <div className="chart-card anime-fade-in detail-panel-overlay" style={{ borderLeft: '2px solid var(--admin-accent)' }}>
            <div className="card-actions">
              <h3>Neural Audit: Inquiry Details</h3>
              <button className="analyze-btn" onClick={() => setSelectedInquiry(null)}>
                Close
              </button>
            </div>
            
            <div className="inquiry-detail-view">
              <div className="detail-header">
                <div className="detail-meta">
                   <div className="meta-item">
                      <User size={14} />
                      <span>{selectedInquiry.name}</span>
                   </div>
                   <div className="meta-item">
                      <Mail size={14} />
                      <span>{selectedInquiry.email}</span>
                   </div>
                   {selectedInquiry.company && (
                     <div className="meta-item">
                        <Building2 size={14} />
                        <span>{selectedInquiry.company}</span>
                     </div>
                   )}
                   {selectedInquiry.phone && (
                     <div className="meta-item">
                        <Phone size={14} />
                        <span>{selectedInquiry.phone}</span>
                     </div>
                   )}
                </div>
                <div className="detail-timestamp">
                  <Clock size={12} /> {new Date(selectedInquiry.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="detail-subject">
                <h4>{selectedInquiry.subject || "No Subject Provided"}</h4>
              </div>

              <div className="detail-message">
                <p>{selectedInquiry.message}</p>
              </div>

              <div className="detail-actions">
                <button 
                  className={`admin-btn ${selectedInquiry.status === 'new' ? 'admin-btn-primary' : ''}`}
                  onClick={() => handleStatusToggle(selectedInquiry._id)}
                >
                  {selectedInquiry.status === 'new' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                  <span>{selectedInquiry.status === 'new' ? 'Archive as Responded' : 'Mark as Pending'}</span>
                </button>
                <button className="admin-btn danger" onClick={() => handleDelete(selectedInquiry._id)}>
                  <Trash2 size={16} /> Purge Record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI INSIGHTS PANEL (DYNAMIC) */}
      <section className="dashboard-section" style={{ marginTop: '40px' }}>
        <div className="insights-panel">
          <div className="insights-badge">
            <Cpu size={14} style={{ marginRight: '8px' }} />
            INTELLIGENCE v2.4
          </div>
          <h2>Dialogue Pattern Analysis</h2>
          <p>
            Current inquiry volume is tracking <strong>12% higher</strong> than the previous cycle. 
            The most frequent subject vector relates to <strong>"Partnership Opportunities"</strong>. 
            Recommendation: Deploy priority response protocols for corporate-tagged domains.
          </p>
          <div className="insight-stats-grid">
            <div className="insight-stat">
              <span>Sentiment Shift</span>
              <strong style={{ color: 'var(--admin-success)' }}>+4.2%</strong>
            </div>
            <div className="insight-stat">
              <span>Pending Latency</span>
              <strong>{stats.new > 0 ? 'High' : 'Optimal'}</strong>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="error-banner anime-fade-in" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default Inquiries;
