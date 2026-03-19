import { API_BASE_URL } from "../config";
import { useState, useEffect } from "react";
import "./admin_css/AdminMaster.css";
import "./admin_css/AdminProducts.css";
import { 
  Package, 
  Trash2, 
  ExternalLink, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  BarChart3, 
  Cpu, 
  Eye, 
  Inbox,
  LayoutGrid
} from "lucide-react";

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [filter, setFilter] = useState("all");
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        fetchProducts();
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const checkMobile = () => setIsMobile(window.innerWidth < 1024);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/products/all`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove "${name}" from the portfolio? This will immediately reflect on the public website.`)) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setProducts(products.filter(p => p._id !== id));
                if (selectedProduct?._id === id) setSelectedProduct(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const stats = {
        total: products.length,
        live: products.filter(p => p.submissionStatus === 'Approved').length,
        pending: products.filter(p => p.submissionStatus === 'PendingApproval').length,
        growth: products.length > 0 ? ((products.filter(p => p.submissionStatus === 'Approved').length / products.length) * 100).toFixed(1) : 0
    };

    const filteredProducts = products.filter(p => {
        const matchesFilter = filter === 'all' || p.submissionStatus === filter;
        const matchesSearch = 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.category.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) return <div className="admin-loading">Accessing Global Product Inventory...</div>;

    return (
        <div className="admin-content-wrapper">
            {/* HEADER */}
            <header className="dashboard-control-bar" style={{ 
                flexDirection: isMobile ? 'column' : 'row', 
                alignItems: isMobile ? 'flex-start' : 'flex-end',
                gap: '24px'
            }}>
                <div className="control-info">
                    <h1 style={{ fontSize: isMobile ? '2rem' : '3.5rem' }}>Product Governance</h1>
                    <p>Global collection status: <span style={{ color: 'var(--admin-success)' }}>Operational</span></p>
                </div>
                <div className="control-actions" style={{ flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto' }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        background: 'var(--admin-card-bg)', 
                        padding: '10px 16px', 
                        border: '1px solid var(--admin-border)',
                        width: '100%'
                    }}>
                        <Search size={16} color="var(--admin-text-secondary)" />
                        <input
                            type="text"
                            placeholder="Search catalogue..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'none', border: 'none', padding: '4px 8px', color: 'var(--admin-text-primary)', outline: 'none', fontSize: '0.9rem', width: '100%' }}
                        />
                    </div>
                    <a href="/products" target="_blank" className="sync-btn" style={{ textDecoration: 'none', textAlign: 'center', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
                        Live Portfolio
                    </a>
                </div>
            </header>

            {/* KPI GRID */}
            <div className="admin-kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-header"><Package size={18} /></div>
                    <div className="kpi-value">{stats.total}</div>
                    <div className="kpi-label">Total Collection</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header"><CheckCircle size={18} color="var(--admin-success)" /></div>
                    <div className="kpi-value">{stats.live}</div>
                    <div className="kpi-label">Live Assets</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header"><Clock size={18} color="var(--admin-warning)" /></div>
                    <div className="kpi-value">{stats.pending}</div>
                    <div className="kpi-label">Awaiting Review</div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="charts-grid" style={{ gridTemplateColumns: selectedProduct && !isMobile ? '1.5fr 1fr' : '1fr' }}>
                <div className="chart-card">
                    <div className="card-actions">
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <h3>Catalogue Inventory</h3>
                            <div className="filter-group-mini">
                                <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
                                <button className={filter === 'Approved' ? 'active' : ''} onClick={() => setFilter('Approved')}>Approved</button>
                                <button className={filter === 'PendingApproval' ? 'active' : ''} onClick={() => setFilter('PendingApproval')}>Pending</button>
                            </div>
                        </div>
                    </div>

                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Asset</th>
                                    <th>Identity</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Protocol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => (
                                    <tr 
                                        key={product._id} 
                                        className={selectedProduct?._id === product._id ? 'selected-row' : ''} 
                                        onClick={() => setSelectedProduct(product)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <img src={product.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                <div style={{ fontWeight: 600 }}>{product.name}</div>
                                            </div>
                                        </td>
                                        <td><div style={{ fontSize: '0.7rem', opacity: 0.6, fontFamily: 'monospace' }}>{product._id.toString().slice(-8).toUpperCase()}</div></td>
                                        <td><span className="badge">{product.category}</span></td>
                                        <td>
                                            <span className={`status-badge status-${product.submissionStatus.toLowerCase()}`}>
                                                {product.submissionStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="view-btn" onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}>
                                                Analyze
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan="5" align="center" style={{ padding: '60px', opacity: 0.5 }}>
                                            <Inbox size={48} style={{ marginBottom: '16px' }} />
                                            <p>No product vectors detected.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* DETAIL PANEL */}
                {selectedProduct && (
                    <div className="chart-card anime-fade-in detail-panel-overlay" style={{ borderLeft: '2px solid var(--admin-accent)' }}>
                        <div className="card-actions">
                            <h3>Product Audit: {selectedProduct.name}</h3>
                            <button className="analyze-btn" onClick={() => setSelectedProduct(null)}>Close</button>
                        </div>

                        <div className="inquiry-detail-view">
                            <div style={{ marginBottom: '24px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
                                <img src={selectedProduct.image} alt="" style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                            </div>

                            <div className="detail-header">
                                <div className="detail-meta">
                                    <div className="meta-item">
                                        <LayoutGrid size={14} />
                                        <span>{selectedProduct.category}</span>
                                    </div>
                                    <div className="meta-item">
                                        <Clock size={14} />
                                        <span>Registered: {new Date(selectedProduct.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-subject">
                                <h4>Architectural Summary</h4>
                            </div>

                            <div className="detail-message">
                                <p>{selectedProduct.description}</p>
                            </div>

                            <div className="detail-actions" style={{ marginTop: '32px' }}>
                                <button className="admin-btn danger" onClick={() => handleDelete(selectedProduct._id, selectedProduct.name)}>
                                    <Trash2 size={16} /> Purge Architectural Record
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>


        </div>
    );
};

export default AdminProducts;
