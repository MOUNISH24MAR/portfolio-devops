import { API_BASE_URL } from "../config";
import { useState, useEffect } from "react";
import "./mang_css/ManagerCommon.css";

const CompanyManagement = () => {
    const [companyInfo, setCompanyInfo] = useState({
        name: '',
        description: '',
        establishedYear: '',
        location: '',
    });
    const [loading, setLoading] = useState(true);
    const [currentRecord, setCurrentRecord] = useState(null);

    useEffect(() => {
        fetchCompany();
    }, []);

    const fetchCompany = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/company/all`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.length > 0) {
                // Find the latest one that isn't deleted, or just take the first from the sorted list
                const latest = data[0];
                setCurrentRecord(latest);
                setCompanyInfo({
                    name: latest.name || '',
                    description: latest.description || '',
                    establishedYear: latest.establishedYear || '',
                    location: latest.location || ''
                });
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setCompanyInfo({ ...companyInfo, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (submit = false) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/company`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ ...companyInfo, submit }),
            });
            const data = await res.json();
            if (res.ok) {
                alert(submit ? "Profile submitted for approval." : "Draft saved successfully.");
                fetchCompany();
            } else {
                alert(data.message || "Error saving data");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return '#2b8a3e'; // Green
            case 'PENDING': return '#f08c00'; // Yellow
            case 'REJECTED': return '#e03131'; // Red
            default: return '#868e96'; // Gray (DRAFT)
        }
    };

    if (loading) return <div>Loading Profile Data...</div>;

    const isPending = currentRecord?.status === 'PENDING';

    return (
        <div className="manager-page-content">
            <header className="header-flex page-title-block">
                <div>
                    <h2>Company Profile</h2>
                    <p>Manage the identity and overview of the organization</p>
                </div>
                {currentRecord && (
                    <div className="status-badge-container">
                        <span style={{
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            backgroundColor: getStatusColor(currentRecord.status) + '22',
                            color: getStatusColor(currentRecord.status),
                            border: `1px solid ${getStatusColor(currentRecord.status)}`
                        }}>
                            Status: {currentRecord.status || 'DRAFT'}
                        </span>
                    </div>
                )}
            </header>

            {isPending && (
                <div style={{ backgroundColor: '#fff9db', border: '1px solid #fab005', padding: '16px', marginBottom: '24px', color: '#856404', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🟡</span>
                    <strong>Waiting for Admin Approval. Further edits are restricted during this period.</strong>
                </div>
            )}

            {currentRecord?.status === 'REJECTED' && (
                <div style={{ backgroundColor: '#fff5f5', border: '1px solid #ffc9c9', padding: '16px', marginBottom: '24px', color: '#e03131', fontSize: '0.9rem', borderRadius: '8px' }}>
                    <strong>Needs Correction:</strong> Please review the details and resubmit.
                </div>
            )}

            <form className="mgmt-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }}>
                <div className="form-row">
                    <label>Company Name</label>
                    <input
                        name="name"
                        value={companyInfo.name}
                        onChange={handleChange}
                        required
                        disabled={isPending}
                    />
                </div>
                <div className="form-row">
                    <label>Core Narrative / Description</label>
                    <textarea
                        name="description"
                        rows="5"
                        value={companyInfo.description}
                        onChange={handleChange}
                        required
                        disabled={isPending}
                    />
                </div>
                <div className="form-row">
                    <label>Established Year</label>
                    <input
                        name="establishedYear"
                        type="number"
                        value={companyInfo.establishedYear}
                        onChange={handleChange}
                        required
                        disabled={isPending}
                    />
                </div>
                <div className="form-row">
                    <label>Base Location</label>
                    <input
                        name="location"
                        value={companyInfo.location}
                        onChange={handleChange}
                        required
                        disabled={isPending}
                    />
                </div>

                {!isPending && (
                    <div className="form-actions">
                        <button type="submit" className="btn-save">Save as Draft</button>
                        <button type="button" className="btn-secondary" onClick={() => handleSubmit(true)}>Submit for Approval</button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default CompanyManagement;
