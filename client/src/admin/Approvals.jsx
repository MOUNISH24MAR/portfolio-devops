import { useState, useEffect } from "react";
import "./admin_css/Approvals.css";
import { CheckCircle, XCircle, Eye, MessageSquare } from "lucide-react";

const Approvals = () => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/approvals", {
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

  const handleAction = async (id, action, isCompany = false) => {
    try {
      const res = await fetch(`http://localhost:5000/api/approvals/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ action, comments, isCompany })
      });

      if (res.ok) {
        setSelectedSubmission(null);
        setComments("");
        fetchSubmissions();
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
        <h1>Verification Queue</h1>
        <p>Verify data integrity across all operational nodes</p>
      </header>

      <div className={`approvals-grid ${selectedSubmission ? 'has-selection' : ''}`}>
        {/* Submissions List */}
        <div className="submissions-list">
          {submissions.length === 0 ? (
            <div className="no-submissions">
              <MessageSquare size={32} strokeWidth={1.5} />
              <p>No pending verifications.</p>
            </div>
          ) : (
            submissions.map(sub => (
              <div
                key={sub._id}
                className={`submission-card ${selectedSubmission?._id === sub._id ? 'active' : ''}`}
                onClick={() => setSelectedSubmission(sub)}
              >
                <div className="sub-meta">
                  <span className="sub-type">{sub.entityType}</span>
                  <span className="sub-date">
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3>{sub.managerId?.username || 'Unknown User'}</h3>
                <p className="sub-description">Submitted for global alignment</p>
                <div className="sub-actions">
                  <button
                    className="view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSubmission(sub);
                    }}
                  >
                    <Eye size={14} /> <span>Review</span>
                  </button>
                </div>
              </div>
            ))
          )}
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

              {/* Approval Form */}
              <div className="approval-form">
                {selectedSubmission.isCompany && (
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
                    onClick={() => handleAction(selectedSubmission._id, 'Approved', selectedSubmission.isCompany)}
                  >
                    <CheckCircle size={18} /> <span>Approve</span>
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleAction(selectedSubmission._id, 'Rejected', selectedSubmission.isCompany)}
                  >
                    <XCircle size={18} /> <span>Reject</span>
                  </button>
                </div>
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