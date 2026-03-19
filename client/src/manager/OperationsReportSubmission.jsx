import { API_BASE_URL } from "../config";
import { useState, useEffect } from "react";
import "./mang_css/ManagerCommon.css";

const OperationsReportSubmission = () => {
    const [reports, setReports] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        reportingPeriod: '', teamSize: 0, completedTasks: 0,
        ongoingTasks: 0, blockers: '', remarks: ''
    });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/reports`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setReports(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAction = async (submit = false) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/reports`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ ...formData, submit }),
            });
            if (res.ok) {
                setIsAdding(false);
                fetchReports();
                setFormData({
                    reportingPeriod: '', teamSize: 0, completedTasks: 0,
                    ongoingTasks: 0, blockers: '', remarks: ''
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="manager-page-content">
            <header className="page-title-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>Performance Reports</h2>
                    <p>Submit periodic operational metrics for administrative review</p>
                </div>
                <button className="btn-save" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? "Cancel" : "+ New Submission"}
                </button>
            </header>

            {isAdding && (
                <div style={{ marginBottom: '60px', padding: '40px', border: '1px solid var(--text-primary)', background: 'var(--bg-muted)' }}>
                    <h3>New Operational Report</h3>
                    <form className="mgmt-form" style={{ marginTop: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="form-row">
                                <label>Reporting Period</label>
                                <input name="reportingPeriod" value={formData.reportingPeriod} onChange={handleChange} placeholder="e.g. January 2026" required />
                            </div>
                            <div className="form-row">
                                <label>Active Team Size</label>
                                <input name="teamSize" type="number" value={formData.teamSize} onChange={handleChange} required />
                            </div>
                            <div className="form-row">
                                <label>Completed Tasks</label>
                                <input name="completedTasks" type="number" value={formData.completedTasks} onChange={handleChange} required />
                            </div>
                            <div className="form-row">
                                <label>Ongoing Tasks</label>
                                <input name="ongoingTasks" type="number" value={formData.ongoingTasks} onChange={handleChange} required />
                            </div>
                            <div className="form-row" style={{ gridColumn: 'span 2' }}>
                                <label>Current Blockers / Issues</label>
                                <textarea name="blockers" value={formData.blockers} onChange={handleChange} style={{ width: '100%', minHeight: '60px', background: 'none', border: '1px solid var(--text-primary)', padding: '12px' }} />
                            </div>
                            <div className="form-row" style={{ gridColumn: 'span 2' }}>
                                <label>Additional Remarks</label>
                                <textarea name="remarks" value={formData.remarks} onChange={handleChange} style={{ width: '100%', minHeight: '60px', background: 'none', border: '1px solid var(--text-primary)', padding: '12px' }} />
                            </div>
                        </div>
                        <div className="form-actions" style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
                            <button type="button" className="btn-secondary" onClick={() => handleAction(false)}>Save Draft</button>
                            <button type="button" className="btn-save" onClick={() => handleAction(true)}>Finalize & Submit</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="mgmt-table-container">
                <table className="mgmt-table">
                    <thead>
                        <tr>
                            <th>Period</th>
                            <th>Metrics (Team/Done/Active)</th>
                            <th>Status</th>
                            <th>Last Update</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(rep => (
                            <tr key={rep._id}>
                                <td><strong>{rep.reportingPeriod}</strong></td>
                                <td>{rep.teamSize} / {rep.completedTasks} / {rep.ongoingTasks}</td>
                                <td>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: rep.submissionStatus === 'Approved' ? '#2b8a3e' : rep.submissionStatus === 'PendingApproval' ? '#f08c00' : '#1f1f1d' }}>
                                        {rep.submissionStatus}
                                    </span>
                                </td>
                                <td>{new Date(rep.updatedAt).toLocaleDateString()}</td>
                                <td>
                                    {(rep.submissionStatus === 'Draft' || rep.submissionStatus === 'Rejected') && (
                                        <button
                                            className="btn-save"
                                            style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                                            onClick={async () => {
                                                const token = localStorage.getItem("token");
                                                await fetch(`${API_BASE_URL}/api/reports/${rep._id}`, {
                                                    method: "PUT",
                                                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                                                    body: JSON.stringify({ submit: true })
                                                });
                                                fetchReports();
                                            }}
                                        >
                                            Submit
                                        </button>
                                    )}
                                    {rep.submissionStatus === 'Rejected' && (
                                        <div style={{ fontSize: '0.7rem', color: '#e03131', marginTop: '4px' }}>
                                            Reason: {rep.verificationMetadata?.rejectionReason}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OperationsReportSubmission;
