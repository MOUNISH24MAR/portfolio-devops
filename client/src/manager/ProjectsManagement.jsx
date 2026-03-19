import { API_BASE_URL } from "../config";
import { useState, useEffect } from "react";
import "./mang_css/ManagerCommon.css";

const ProjectsManagement = () => {
    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        projectId: '', name: '', department: 'Production',
        description: '', startDate: '', endDate: '', status: 'Proposed'
    });

    useEffect(() => {
        fetchProjects();
        fetchEmployees();
    }, []);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/projects`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/employees`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setEmployees(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/projects`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setIsAdding(false);
                fetchProjects();
                setFormData({
                    projectId: '', name: '', department: 'Production',
                    description: '', startDate: '', endDate: '', status: 'Proposed'
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="manager-page-content">
            <header className="header-flex page-title-block">
                <div>
                    <h2>Project Operations</h2>
                    <p>Track project timelines, statuses, and operational workflows</p>
                </div>
                <button className="btn-save" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? "Cancel" : "+ New Project"}
                </button>
            </header>

            {isAdding && (
                <div className="mgmt-form-card">
                    <h3>Initialize Project</h3>
                    <form className="mgmt-form" onSubmit={handleSubmit}>
                        <div className="grid-2-col">
                            <div className="form-row">
                                <label>Project ID</label>
                                <input name="projectId" value={formData.projectId} onChange={handleChange} placeholder="PRJ-2026-01" required />
                            </div>
                            <div className="form-row">
                                <label>Project Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="form-row">
                                <label>Department</label>
                                <select name="department" value={formData.department} onChange={handleChange}>
                                    <option>Production</option>
                                    <option>Design</option>
                                    <option>Sustainability</option>
                                    <option>Quality Assurance</option>
                                </select>
                            </div>
                            <div className="form-row">
                                <label>Status</label>
                                <select name="status" value={formData.status} onChange={handleChange}>
                                    <option>Proposed</option>
                                    <option>In Progress</option>
                                    <option>On Hold</option>
                                    <option>Completed</option>
                                </select>
                            </div>
                            <div className="form-row">
                                <label>Start Date</label>
                                <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
                            </div>
                            <div className="form-row">
                                <label>End Date</label>
                                <input name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
                            </div>
                            <div className="form-row" style={{ gridColumn: '1 / -1' }}>
                                <label>Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} style={{ minHeight: '80px' }} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-save">Create Project</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="mgmt-table-container">
                <table className="mgmt-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Project</th>
                            <th>Timeline</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(prj => (
                            <tr key={prj._id}>
                                <td>{prj.projectId}</td>
                                <td><strong>{prj.name}</strong><br /><small>{prj.department}</small></td>
                                <td>
                                    {new Date(prj.startDate).toLocaleDateString()} -
                                    {prj.endDate ? new Date(prj.endDate).toLocaleDateString() : ' Ongoing'}
                                </td>
                                <td>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: prj.submissionStatus === 'Approved' ? '#2b8a3e' : prj.submissionStatus === 'PendingApproval' ? '#f08c00' : '#1f1f1d' }}>
                                        {prj.submissionStatus}
                                    </span>
                                </td>
                                <td>
                                    {(prj.submissionStatus === 'Draft' || prj.submissionStatus === 'Rejected') && (
                                        <button
                                            className="btn-save"
                                            style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                                            onClick={async () => {
                                                const token = localStorage.getItem("token");
                                                await fetch(`${API_BASE_URL}/api/projects/${prj._id}`, {
                                                    method: "PUT",
                                                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                                                    body: JSON.stringify({ submit: true })
                                                });
                                                fetchProjects();
                                            }}
                                        >
                                            Submit
                                        </button>
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

export default ProjectsManagement;
