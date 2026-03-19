import { API_BASE_URL } from "../config";
import { useState, useEffect } from "react";
import "./mang_css/ManagerCommon.css";

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: '', fullName: '', email: '', phone: '',
        department: 'Production', role: '', joiningDate: '', status: 'Active'
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

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
            const res = await fetch(`${API_BASE_URL}/api/employees`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setIsAdding(false);
                fetchEmployees();
                setFormData({
                    employeeId: '', fullName: '', email: '', phone: '',
                    department: 'Production', role: '', joiningDate: '', status: 'Active'
                });
            } else {
                const err = await res.json();
                alert(err.msg || "Failed to add employee");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="manager-page-content">
            <header className="header-flex page-title-block">
                <div>
                    <h2>Employee Directory</h2>
                    <p>Manage individual employee records and assignments</p>
                </div>
                <button className="btn-save" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? "Cancel" : "+ Add Employee"}
                </button>
            </header>

            {isAdding && (
                <div className="mgmt-form-card">
                    <h3>Add New Employee</h3>
                    <form className="mgmt-form" onSubmit={handleSubmit}>
                        <div className="grid-2-col">
                            <div className="form-row">
                                <label>Employee ID</label>
                                <input name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="EMP-001" required />
                            </div>
                            <div className="form-row">
                                <label>Full Name</label>
                                <input name="fullName" value={formData.fullName} onChange={handleChange} required />
                            </div>
                            <div className="form-row">
                                <label>Email</label>
                                <input name="email" type="email" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="form-row">
                                <label>Phone</label>
                                <input name="phone" value={formData.phone} onChange={handleChange} required />
                            </div>
                            <div className="form-row">
                                <label>Department</label>
                                <select name="department" value={formData.department} onChange={handleChange}>
                                    <option>Production</option>
                                    <option>Design</option>
                                    <option>Logistics</option>
                                    <option>Quality Control</option>
                                    <option>Administration</option>
                                </select>
                            </div>
                            <div className="form-row">
                                <label>Role / Designation</label>
                                <input name="role" value={formData.role} onChange={handleChange} required />
                            </div>
                            <div className="form-row">
                                <label>Joining Date</label>
                                <input name="joiningDate" type="date" value={formData.joiningDate} onChange={handleChange} required />
                            </div>
                            <div className="form-row">
                                <label>Status</label>
                                <select name="status" value={formData.status} onChange={handleChange}>
                                    <option>Active</option>
                                    <option>On Leave</option>
                                    <option>Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-save">Save Record</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="mgmt-table-container">
                <table className="mgmt-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Role & Dept</th>
                            <th>Joining Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp._id}>
                                <td>{emp.employeeId}</td>
                                <td><strong>{emp.fullName}</strong><br /><small>{emp.email}</small></td>
                                <td>{emp.role}<br /><small>{emp.department}</small></td>
                                <td>{new Date(emp.joiningDate).toLocaleDateString()}</td>
                                <td>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: emp.submissionStatus === 'Approved' ? '#2b8a3e' : emp.submissionStatus === 'PendingApproval' ? '#f08c00' : '#1f1f1d' }}>
                                        {emp.submissionStatus}
                                    </span>
                                </td>
                                <td>
                                    {(emp.submissionStatus === 'Draft' || emp.submissionStatus === 'Rejected') && (
                                        <button
                                            className="btn-save"
                                            style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                                            onClick={async () => {
                                                const token = localStorage.getItem("token");
                                                await fetch(`${API_BASE_URL}/api/employees/${emp._id}`, {
                                                    method: "PUT",
                                                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                                                    body: JSON.stringify({ submit: true })
                                                });
                                                fetchEmployees();
                                            }}
                                        >
                                            Submit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {employees.length === 0 && (
                            <tr><td colSpan="6" style={{ textAlign: 'center', opacity: 0.5 }}>No employee records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeManagement;
