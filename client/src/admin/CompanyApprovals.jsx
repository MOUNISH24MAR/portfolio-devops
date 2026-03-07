import { useState, useEffect } from "react";
import "./admin_css/Approvals.css";
import { CheckCircle, XCircle, Eye, MessageSquare, History } from "lucide-react";

const CompanyApprovals = () => {
    const [pendingCompanies, setPendingCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [currentApproved, setCurrentApproved] = useState(null);
    const [comments, setComments] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const [pendingRes, approvedRes] = await Promise.all([
                fetch("http://localhost:5000/api/approvals/company", {
                    headers: { "Authorization": `Bearer ${token}` }
                }),
                fetch("http://localhost:5000/api/company", {
                    headers: { "Authorization": `Bearer ${token}` }
                })
            ]);

            const pendingData = await pendingRes.json();
            const approvedData = await approvedRes.json();

            setPendingCompanies(pendingData);
            setCurrentApproved(Object.keys(approvedData).length > 0 ? approvedData : null);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            const res = await fetch(`http://localhost:5000/api/approvals/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ action, comments, isCompany: true })
            });

            if (res.ok) {
                setSelectedCompany(null);
                setComments("");
                fetchData();
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
                    <p>Fetching Company Submissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="approvals-container">
            <header className="approvals-header">
                <h1>Company Profile Approvals</h1>
                <p>Review and verify changes to the organization's public identity</p>
            </header>

            <div className={`approvals-grid ${selectedCompany ? 'has-selection' : ''}`}>
                {/* Submissions List */}
                <div className="submissions-list">
                    {pendingCompanies.length === 0 ? (
                        <div className="no-submissions">
                            <MessageSquare size={32} strokeWidth={1.5} />
                            <p>No pending company profiles.</p>
                        </div>
                    ) : (
                        pendingCompanies.map(comp => (
                            <div
                                key={comp._id}
                                className={`submission-card ${selectedCompany?._id === comp._id ? 'active' : ''}`}
                                onClick={() => setSelectedCompany(comp)}
                            >
                                <div className="sub-meta">
                                    <span className="sub-type">VERSION: {comp.version}</span>
                                    <span className="sub-date">
                                        {new Date(comp.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3>{comp.name}</h3>
                                <p className="sub-description">Submitted by {comp.submittedBy?.name || 'Manager'}</p>
                                <div className="sub-actions">
                                    <button className="view-btn">
                                        <Eye size={14} /> <span>Review Version</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Submission Detail & Comparison */}
                <div className={`submission-detail ${selectedCompany ? 'active' : ''}`}>
                    {selectedCompany ? (
                        <div className="detail-content">
                            <button className="back-btn" onClick={() => setSelectedCompany(null)}>
                                ← Back to Queue
                            </button>

                            <div className="comparison-container">
                                <div className="comparison-header">
                                    <History size={20} />
                                    <h2>Version Comparison</h2>
                                </div>

                                <div className="comparison-grid">
                                    {/* Left: Current Approved */}
                                    <div className="comparison-pane">
                                        <h3>Current Approved (v{currentApproved?.version || '0'})</h3>
                                        {!currentApproved ? (
                                            <p className="empty-ver">No approved profile yet.</p>
                                        ) : (
                                            <div className="ver-data">
                                                <div className="data-row">
                                                    <span className="label">Name:</span>
                                                    <span className="val">{currentApproved.name}</span>
                                                </div>
                                                <div className="data-row">
                                                    <span className="label">Location:</span>
                                                    <span className="val">{currentApproved.location}</span>
                                                </div>
                                                <div className="data-row">
                                                    <span className="label">Established:</span>
                                                    <span className="val">{currentApproved.establishedYear}</span>
                                                </div>
                                                <div className="data-row">
                                                    <span className="label">Description:</span>
                                                    <p className="val-text">{currentApproved.description}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: New Submission */}
                                    <div className="comparison-pane new-version">
                                        <h3>New Submission (v{selectedCompany.version})</h3>
                                        <div className="ver-data">
                                            <div className={`data-row ${selectedCompany.name !== currentApproved?.name ? 'changed' : ''}`}>
                                                <span className="label">Name:</span>
                                                <span className="val">{selectedCompany.name}</span>
                                            </div>
                                            <div className={`data-row ${selectedCompany.location !== currentApproved?.location ? 'changed' : ''}`}>
                                                <span className="label">Location:</span>
                                                <span className="val">{selectedCompany.location}</span>
                                            </div>
                                            <div className={`data-row ${selectedCompany.establishedYear !== currentApproved?.establishedYear ? 'changed' : ''}`}>
                                                <span className="label">Established:</span>
                                                <span className="val">{selectedCompany.establishedYear}</span>
                                            </div>
                                            <div className={`data-row ${selectedCompany.description !== currentApproved?.description ? 'changed' : ''}`}>
                                                <span className="label">Description:</span>
                                                <p className="val-text">{selectedCompany.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Approval Form */}
                            <div className="approval-form">
                                <label htmlFor="comments">Admin Decision Rationale (Optional)</label>
                                <textarea
                                    id="comments"
                                    placeholder="Provide feedback to the manager..."
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    rows={3}
                                />
                                <div className="form-buttons">
                                    <button
                                        className="approve-btn"
                                        onClick={() => handleAction(selectedCompany._id, 'APPROVED')}
                                    >
                                        <CheckCircle size={18} /> <span>Approve Profile</span>
                                    </button>
                                    <button
                                        className="reject-btn"
                                        onClick={() => handleAction(selectedCompany._id, 'REJECTED')}
                                    >
                                        <XCircle size={18} /> <span>Reject Changes</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="select-prompt">
                            <History size={48} strokeWidth={1.5} />
                            <p>Select a company profile version to begin verification</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompanyApprovals;
