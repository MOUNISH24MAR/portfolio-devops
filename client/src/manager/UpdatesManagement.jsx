import { API_BASE_URL } from "../config";
import { useState, useEffect } from "react";
import "./mang_css/ManagerCommon.css";

const UpdatesManagement = () => {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', category: 'News' });

    useEffect(() => {
        fetchUpdates();
    }, []);

    const fetchUpdates = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/updates/all`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            setUpdates(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSubmit = async (e, submit = false) => {
        if (e) e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/updates`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ ...formData, submit }),
            });
            if (res.ok) {
                setIsAdding(false);
                setFormData({ title: '', content: '', category: 'News' });
                fetchUpdates();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading Updates...</div>;

    return (
        <div className="manager-page-content">
            <header className="page-title-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>News & Updates</h2>
                    <p>Communicate organizational milestones and collection news</p>
                </div>
                <button className="btn-save" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? "Cancel" : "+ New Update"}
                </button>
            </header>

            {isAdding && (
                <div style={{ marginBottom: '60px', padding: '40px', border: '1px solid var(--text-primary)', background: 'var(--bg-muted)' }}>
                    <h3>Create New Update</h3>
                    <form className="mgmt-form" style={{ marginTop: '24px' }} onSubmit={(e) => handleSubmit(e, false)}>
                        <div className="form-row">
                            <label>Update Title</label>
                            <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                        </div>
                        <div className="form-row">
                            <label>Category</label>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option value="News">News</option>
                                <option value="Milestone">Milestone</option>
                                <option value="Collection">Collection</option>
                                <option value="CSR">CSR</option>
                            </select>
                        </div>
                        <div className="form-row">
                            <label>Content</label>
                            <textarea rows="6" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} required />
                        </div>
                        <div className="form-actions" style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
                            <button type="submit" className="btn-save">Save as Draft</button>
                            <button type="button" className="btn-secondary" onClick={() => handleSubmit(null, true)}>Submit for Approval</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="mgmt-table-container">
                <table className="mgmt-table">
                    <thead>
                        <tr>
                            <th>Update Title</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th>Verification</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {updates.map(update => (
                            <tr key={update._id}>
                                <td><strong>{update.title}</strong></td>
                                <td>{update.category}</td>
                                <td>{new Date(update.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        color: update.submissionStatus === 'Approved' ? '#2b8a3e' : update.submissionStatus === 'PendingApproval' ? '#f08c00' : '#1f1f1d'
                                    }}>
                                        {update.submissionStatus}
                                    </span>
                                </td>
                                <td>
                                    {(update.submissionStatus === 'Draft' || update.submissionStatus === 'Rejected') && (
                                        <button
                                            className="btn-save"
                                            style={{ padding: '4px 12px', fontSize: '0.75rem', minWidth: 'auto', height: 'auto' }}
                                            onClick={async () => {
                                                const token = localStorage.getItem("token");
                                                await fetch(`${API_BASE_URL}/api/updates/${update._id}`, {
                                                    method: "PUT",
                                                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                                                    body: JSON.stringify({ submit: true })
                                                });
                                                fetchUpdates();
                                            }}
                                        >
                                            Submit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {updates.length === 0 && !isAdding && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', opacity: 0.5 }}>No updates found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UpdatesManagement;
