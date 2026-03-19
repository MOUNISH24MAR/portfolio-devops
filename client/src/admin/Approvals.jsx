import { API_BASE_URL } from "../config";
import { useState, useEffect } from "react";
import "./admin_css/Approvals.css";
import { CheckCircle, XCircle, Eye, MessageSquare } from "lucide-react";

const Approvals = () => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "revocable"

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/approvals`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      setSubmissions(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAction = async (id, action, isCompany = false, reason = "") => {
    try {
      const endpoint = action === 'Revoke' ? `${API_BASE_URL}/api/approvals/${id}/revoke` : `${API_BASE_URL}/api/approvals/${id}`;
      const method = "POST";
      const body = action === 'Revoke' ? { reason } : { action, comments, isCompany };

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setSelectedSubmission(null);
        setComments("");
        fetchSubmissions();
      } else {
        const errorData = await res.json();
        alert(errorData.msg || "Action failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="approvals-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Initializing Approval Queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="approvals-container">
      <header className="approvals-header">
        <div className="header-main">
          <h1>Verification Queue</h1>
          <p>Verify data integrity across all operational nodes</p>
        </div>
        
        <div className="approvals-tabs">
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('pending');
              setSelectedSubmission(null);
            }}
          >
            Pending Verification
            <span className="count-badge">
              {submissions.filter(s => s.status === 'Pending').length}
            </span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'revocable' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('revocable');
              setSelectedSubmission(null);
            }}
          >
            Safety Window (Revokable)
            <span className="count-badge revocable">
              {submissions.filter(s => s.status === 'Approved').length}
            </span>
          </button>
        </div>
      </header>

      <div className={`approvals-grid ${selectedSubmission ? 'has-selection' : ''}`}>
        {/* Submissions List */}
        <div className="submissions-list">
          {(() => {
            const filtered = submissions.filter(sub => {
              if (activeTab === 'pending') return sub.status === 'Pending';
              return sub.status === 'Approved';
            });

            if (filtered.length === 0) {
              return (
                <div className="no-submissions">
                  <MessageSquare size={32} strokeWidth={1.5} />
                  <p>No {activeTab} records found.</p>
                </div>
              );
            }

            return filtered.map(sub => {
              const isApproved = sub.status === 'Approved';
              const isWithinWindow = sub.approvalDeadline && new Date(sub.approvalDeadline) > new Date();

              return (
                <div
                  key={sub._id}
                  className={`submission-card ${selectedSubmission?._id === sub._id ? 'active' : ''} ${isApproved ? 'status-approved' : ''}`}
                  onClick={() => setSelectedSubmission(sub)}
                >
                  <div className="sub-meta">
                    <span className="sub-type">{sub.entityType}</span>
                    <span className="sub-status-tag">{sub.status}</span>
                    <span className="sub-date">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3>{sub.managerId?.username || 'Unknown User'}</h3>
                  <p className="sub-description">
                    {isApproved ? 'Approved - Revokable' : 'Submitted for global alignment'}
                  </p>
                  <div className="sub-actions">
                    <button
                      className="view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubmission(sub);
                      }}
                    >
                      <Eye size={14} /> <span>{isApproved ? 'Manage' : 'Review'}</span>
                    </button>
                    {isApproved && isWithinWindow && (
                      <span className="revoke-timer-mini">
                        {Math.max(0, Math.floor((new Date(sub.approvalDeadline) - new Date()) / 3600000))}h left
                      </span>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>

        {/* Submission Detail */}
        <div className={`submission-detail ${selectedSubmission ? 'active' : ''}`}>
          {selectedSubmission ? (
            <div className="detail-content">
              <button className="back-btn" onClick={() => setSelectedSubmission(null)}>
                ← Back to List
              </button>
              <h2>Review: {selectedSubmission.entityType}</h2>

              {/* Data Snapshot */}
              <div className="data-snapshot">
                <h3>Submission Data</h3>

                {/* Media & Product Preview Logic */}
                {(selectedSubmission.entityType === 'Media' || selectedSubmission.entityType === 'Product') && (
                  <div className="media-preview-container">
                    {(selectedSubmission.dataSnapshot.url || selectedSubmission.dataSnapshot.image) && (
                      selectedSubmission.dataSnapshot.type === 'video' ? (
                        <div className="video-preview">
                          {(selectedSubmission.dataSnapshot.url.includes('youtube.com') || selectedSubmission.dataSnapshot.url.includes('youtu.be')) ? (
                            <iframe
                              className="snapshot-video"
                              src={`https://www.youtube.com/embed/${selectedSubmission.dataSnapshot.url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([^"&?\/\s]{11})/)?.[1]}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          ) : selectedSubmission.dataSnapshot.url.includes('vimeo.com') ? (
                            <iframe
                              className="snapshot-video"
                              src={`https://player.vimeo.com/video/${selectedSubmission.dataSnapshot.url.split('/').pop()}`}
                              frameBorder="0"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <video controls className="snapshot-video">
                              <source src={selectedSubmission.dataSnapshot.url} />
                              Your browser does not support the video tag.
                            </video>
                          )}
                          <div className="source-overlay">
                            Source: {selectedSubmission.dataSnapshot.url.length > 50 ? selectedSubmission.dataSnapshot.url.substring(0, 50) + '...' : selectedSubmission.dataSnapshot.url}
                          </div>
                        </div>
                      ) : (
                        <img
                          src={selectedSubmission.dataSnapshot.url || selectedSubmission.dataSnapshot.image}
                          alt="Preview"
                          className="snapshot-image"
                        />
                      )
                    )}
                  </div>
                )}

                {Object.entries(selectedSubmission.dataSnapshot)
                  .filter(([key]) => !['_id', 'createdAt', 'updatedAt', '__v', 'managerId', 'submissionStatus', 'url'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="snapshot-row">
                      <span className="key">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="value">
                        {typeof value === 'object' && value !== null
                          ? JSON.stringify(value, null, 2)
                          : String(value)}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Approval Form / Revoke Panel */}
              <div className="approval-form">
                {selectedSubmission.status === 'Pending' ? (
                  <>
                    {selectedSubmission.entityType === 'Company' && (
                      <div style={{ padding: '12px', backgroundColor: '#e9fac8', border: '1px solid #c0eb75', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem' }}>
                        <strong>Tip:</strong> You can view a detailed side-by-side version comparison on the <a href="/admin/company-approvals" style={{ color: '#2b8a3e', fontWeight: 'bold', textDecoration: 'underline' }}>Company Profiling</a> page.
                      </div>
                    )}
                    <label htmlFor="comments">Verification Comments</label>
                    <textarea
                      id="comments"
                      placeholder="Add rationale for approval or rejection..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={4}
                    />
                    <div className="form-buttons">
                      <button
                        className="approve-btn"
                        onClick={() => handleAction(selectedSubmission._id, 'Approved')}
                      >
                        <CheckCircle size={18} /> <span>Approve</span>
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleAction(selectedSubmission._id, 'Rejected')}
                      >
                        <XCircle size={18} /> <span>Reject</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="revoke-panel">
                    <div className="revoke-info">
                      <div className="status-banner approved">
                        <CheckCircle size={20} />
                        <div>
                          <strong>Submission Approved</strong>
                          <p>You have 24 hours to revoke this decision if needed.</p>
                        </div>
                      </div>
                      
                      <div className="deadline-timer">
                        <span>Revoke Window Lock in:</span>
                        <div className="timer-value">
                          {(() => {
                            const diff = new Date(selectedSubmission.approvalDeadline) - new Date();
                            const hours = Math.floor(diff / 3600000);
                            const minutes = Math.floor((diff % 3600000) / 60000);
                            return `${hours}h ${minutes}m`;
                          })()}
                        </div>
                      </div>
                    </div>

                    <label htmlFor="revokeReason">Revocation Reason (Optional)</label>
                    <textarea
                      id="revokeReason"
                      placeholder="Why is this approval being revoked?"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={3}
                    />

                    <button
                      className="revoke-btn"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to revoke this approval? This will rollback all changes to the previous state.")) {
                          handleAction(selectedSubmission._id, 'Revoke', false, comments);
                        }
                      }}
                    >
                      <XCircle size={18} /> <span>Revoke Approval</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="select-prompt">
              <MessageSquare size={48} strokeWidth={1.5} />
              <p>Select a submission to begin verification protocol</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Approvals;