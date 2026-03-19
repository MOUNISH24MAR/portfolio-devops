import { API_BASE_URL } from "../config";
import { useState, useEffect, useRef } from "react";
import "./mang_css/ManagerCommon.css";
import { Package, Plus, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const ProductManagement = () => {
    const fileInputRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', category: 'Knitted Garments', image: '' });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("Image size exceeds 2MB limit.");
                e.target.value = null;
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e, submit = false) => {
        if (e) e.preventDefault();

        if (!formData.image) {
            alert("Please upload a product image.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ ...formData, submit }),
            });
            if (res.ok) {
                setIsAdding(false);
                setFormData({ name: '', description: '', category: 'Knitted Garments', image: '' });
                if (fileInputRef.current) fileInputRef.current.value = "";
                fetchProducts();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="manager-page-content">Synchronizing Product Node...</div>;

    return (
        <div className="manager-page-content">
            <header className="header-flex page-title-block">
                <div>
                    <h2>Product Catalogue</h2>
                    <p>Manage export-ready garment architectures and collections</p>
                </div>
                <button className="btn-save" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? "Cancel" : <><Plus size={16} /> Add Product</>}
                </button>
            </header>

            {isAdding && (
                <div className="mgmt-form-card anime-fade-in">
                    <h3>Register New Product</h3>
                    <form className="mgmt-form" onSubmit={(e) => handleSubmit(e, false)}>
                        <div className="grid-2-col">
                            <div className="form-row">
                                <label>Product Name</label>
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Premium Cotton Hoodie"
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <label>Category</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option value="Knitted Garments">Knitted Garments</option>
                                    <option value="Woven Wear">Woven Wear</option>
                                    <option value="Sportswear">Sportswear</option>
                                    <option value="Kids Collection">Kids Collection</option>
                                    <option value="Nightwear">Nightwear</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <label>Product Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the material, GSM, and design features..."
                                rows="3"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <label>Product Image (Max 2MB)</label>
                            <div className="file-upload-wrapper">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required={!formData.image}
                                />
                                {formData.image && (
                                    <div className="image-preview-mini" style={{ marginTop: '10px' }}>
                                        <img src={formData.image} alt="Preview" style={{ height: '120px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-actions" style={{ marginTop: '20px' }}>
                            <button type="submit" className="btn-save">Save as Draft</button>
                            <button type="button" className="btn-secondary" onClick={() => handleSubmit(null, true)}>Submit for Verification</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="media-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {products.map(item => (
                    <div key={item._id} className="media-item-card product-card" style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                        <div className="product-image-container" style={{ height: '200px', background: '#f8f9fa' }}>
                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{item.name}</h4>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{item.category}</span>
                                </div>
                                <span className={`status-badge ${item.submissionStatus.toLowerCase()}`} style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 'bold',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    backgroundColor: item.submissionStatus === 'Approved' ? '#ebfbee' : item.submissionStatus === 'PendingApproval' ? '#fff9db' : '#f1f3f5',
                                    color: item.submissionStatus === 'Approved' ? '#2b8ce9' : item.submissionStatus === 'PendingApproval' ? '#f08c00' : '#495057'
                                }}>
                                    {item.submissionStatus === 'Approved' ? <CheckCircle2 size={12} /> : item.submissionStatus === 'PendingApproval' ? <Clock size={12} /> : <AlertCircle size={12} />}
                                    {item.submissionStatus}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '12px', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            
            {products.length === 0 && !isAdding && (
                <div className="empty-state" style={{ textAlign: 'center', padding: '100px 0', opacity: 0.5 }}>
                    <Package size={48} strokeWidth={1} style={{ marginBottom: '16px' }} />
                    <p>No products registered in the catalogue yet.</p>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;
