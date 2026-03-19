import { API_BASE_URL } from "../config";
import { useState, useEffect, useRef } from "react";
import "./mang_css/ManagerCommon.css";

const MediaManagement = () => {
    const fileInputRef = useRef(null);
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ title: '', url: '', type: 'image', category: 'Collection' });

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/media/all`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMediaItems(data);
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
            if (file.size > 2 * 1024 * 1024) { // 2MB Limit
                alert("File size exceeds 2MB limit. Please choose a smaller image.");
                e.target.value = null;
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, url: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFile = () => {
        setFormData({ ...formData, url: '' });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e, submit = false) => {
        if (e) e.preventDefault();

        // Basic URL validation for videos
        if (formData.type === 'video' && !formData.url.startsWith('http')) {
            alert("Please enter a valid video URL starting with http:// or https://");
            return;
        }

        if (formData.type === 'image' && (!formData.url || !formData.url.startsWith('data:image'))) {
            alert("Please upload a valid image file.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/media`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ ...formData, submit }),
            });
            if (res.ok) {
                setIsAdding(false);
                setFormData({ title: '', url: '', type: 'image', category: 'Collection' });
                handleRemoveFile();
                fetchMedia();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="manager-page-content">Loading Media...</div>;

    const getYoutubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    return (
        <div className="manager-page-content">
            <header className="header-flex page-title-block">
                <div>
                    <h2>Media & Assets</h2>
                    <p>Central vault for all portfolio imagery and video content</p>
                </div>
                <button className="btn-save" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? "Cancel" : "Add Asset"}
                </button>
            </header>

            {isAdding && (
                <div className="mgmt-form-card">
                    <h3>Add New Media Asset</h3>
                    <form className="mgmt-form" onSubmit={(e) => handleSubmit(e, false)}>
                        <div className="grid-2-col" style={{ alignItems: 'flex-start' }}>
                            <div className="form-row">
                                <label>Title</label>
                                <input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter asset title"
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <label>Type</label>
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value, url: '' })}>
                                    <option value="image">Image (Upload)</option>
                                    <option value="video">Video (URL)</option>
                                </select>
                            </div>

                            {formData.type === 'image' ? (
                                <div className="form-row">
                                    <label>Upload Image (Max 2MB)</label>
                                    <div className="file-upload-wrapper" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            required={!formData.url}
                                            style={{ width: '100%' }}
                                        />
                                        {formData.url && formData.url.startsWith('data:image') && (
                                            <div className="image-preview-mini" style={{ position: 'relative', width: 'fit-content' }}>
                                                <img src={formData.url} alt="Preview" style={{ display: 'block', height: '100px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }} />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveFile}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-8px',
                                                        right: '-8px',
                                                        background: '#e03131',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '20px',
                                                        height: '20px',
                                                        fontSize: '12px',
                                                        lineHeight: '1',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                    }}
                                                    title="Remove Image"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="form-row">
                                    <label>Video URL</label>
                                    <input
                                        type="url"
                                        value={formData.url}
                                        onChange={e => setFormData({ ...formData, url: e.target.value })}
                                        placeholder="YouTube, Vimeo, or Hosted URL"
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-row">
                                <label>Category</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option value="Collection">Collection</option>
                                    <option value="Facility">Facility</option>
                                    <option value="Personnel">Personnel</option>
                                    <option value="Event">Event</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-save">Save as Draft</button>
                            <button type="button" className="btn-secondary" onClick={() => handleSubmit(null, true)}>Submit for Approval</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="media-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '24px' }}>
                {mediaItems.map(item => (
                    <div key={item._id} className="media-item-card" style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-subtle)', overflow: 'hidden', borderRadius: '12px' }}>
                        <div style={{ aspectRatio: '16/9', backgroundColor: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#fff', overflow: 'hidden' }}>
                            {item.type === 'image' ? (
                                <img src={item.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ textAlign: 'center', width: '100%', height: '100%' }}>
                                    {getYoutubeId(item.url) ? (
                                        <img
                                            src={`https://img.youtube.com/vi/${getYoutubeId(item.url)}/mqdefault.jpg`}
                                            alt="YT Thumb"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                                            <span>📽️ Video Reference</span>
                                            <small style={{ opacity: 0.7, wordBreak: 'break-all' }}>{item.url}</small>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                                <strong style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', wordBreak: 'break-word' }}>{item.title}</strong>
                                <span style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: 'rgba(0,0,0,0.05)',
                                    color: item.submissionStatus === 'Approved' ? '#2b8a3e' : item.submissionStatus === 'PendingApproval' ? '#f08c00' : '#1f1f1d'
                                }}>
                                    {item.submissionStatus}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {item.category} • {new Date(item.createdAt).toLocaleDateString()}
                                </div>
                                {(item.submissionStatus === 'Draft' || item.submissionStatus === 'Rejected') && (
                                    <button
                                        className="btn-save"
                                        style={{ padding: '4px 12px', fontSize: '0.75rem', minWidth: 'auto', height: 'auto' }}
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            const token = localStorage.getItem("token");
                                            await fetch(`${API_BASE_URL}/api/media/${item._id}`, {
                                                method: "PUT",
                                                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                                                body: JSON.stringify({ submit: true })
                                            });
                                            fetchMedia();
                                        }}
                                    >
                                        Submit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {mediaItems.length === 0 && !isAdding && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px', opacity: 0.5 }}>
                        No media assets found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaManagement;
