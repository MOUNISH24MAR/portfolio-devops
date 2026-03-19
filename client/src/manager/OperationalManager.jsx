import { API_BASE_URL } from "../config";
import { useState, useEffect } from "react";
import "./mang_css/ManagerCommon.css";

const OperationalManager = ({ domain, title, fields }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchData();
        // Initialize form data with empty strings for all fields
        const initialForm = {};
        fields.forEach(f => initialForm[f.name] = f.defaultValue || "");
        initialForm.status = 'Draft';
        setFormData(initialForm);
    }, [domain]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/operational/${domain}/all`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/operational/${domain}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsAdding(false);
                fetchData();
                // Reset form
                const resetForm = {};
                fields.forEach(f => resetForm[f.name] = f.defaultValue || "");
                setFormData(resetForm);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusChange = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await fetch(`${API_BASE_URL}/api/operational/${domain}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ submit: true }),
            });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    }

    if (loading) return <div className="manager-page-content">Loading...</div>;

    return (
        <div className="manager-page-content">
            <header className="header-flex page-title-block">
                <div>
                    <h2>{title}</h2>
                    <p>Operational data input and intermediate insights</p>
                </div>
                <button className="btn-save" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? "Cancel" : `+ New ${title.split(' ')[0]} Record`}
                </button>
            </header>

            {isAdding && (
                <div className="mgmt-form-card">
                    <h3>Add New Record</h3>
                    <form className="mgmt-form" onSubmit={handleSubmit}>
                        <div className="grid-2-col">
                            {fields.map(field => (
                                <div className="form-row" key={field.name}>
                                    <label>{field.label}</label>
                                    {field.type === 'select' ? (
                                        <select name={field.name} value={formData[field.name]} onChange={handleChange}>
                                            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : (
                                        <input
                                            name={field.name}
                                            type={field.type || 'text'}
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-save">Save as Draft</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="mgmt-table-container">
                <table className="mgmt-table">
                    <thead>
                        <tr>
                            {fields.map(f => <th key={f.name}>{f.label}</th>)}
                            <th>Verification</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item._id}>
                                {fields.map(f => <td key={f.name}>{item[f.name]}</td>)}
                                <td>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        color: item.submissionStatus === 'Approved' ? '#2b8a3e' : item.submissionStatus === 'PendingApproval' ? '#f08c00' : '#1f1f1d'
                                    }}>
                                        {item.submissionStatus}
                                    </span>
                                    {item.submissionStatus === 'Rejected' && (
                                        <div style={{ fontSize: '0.6rem', color: '#e03131', marginTop: '4px' }}>
                                            {item.verificationMetadata?.rejectionReason}
                                        </div>
                                    )}
                                </td>
                                <td>
                                    {(item.submissionStatus === 'Draft' || item.submissionStatus === 'Rejected') && (
                                        <button
                                            className="btn-save"
                                            style={{ padding: '4px 12px', fontSize: '0.75rem', minWidth: 'auto', height: 'auto' }}
                                            onClick={() => handleStatusChange(item._id)}
                                        >
                                            Submit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={fields.length + 2} style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                                    No records found. Click "New Record" to start data entry.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div >
        </div >
    );
};

export default OperationalManager;
