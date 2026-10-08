import React, { useState, useEffect, useCallback } from 'react';
import {
  Image,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';
import { Spinner } from '../ui/Spinner';
import { bannerService } from '../../services/bannerService';

export const BannersModule = () => {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badge: 'eSchool Notice',
    buttonText: 'Learn More',
    websiteUrl: '',
    imageUrl: '',
    bgColorHex: '#EAB308',
    status: 'Active',
    displayOrder: 1
  });

  const fetchBanners = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await bannerService.list();
      setBanners(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      setError(err?.message || 'Failed to load promotional banners');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      badge: 'eSchool Notice',
      buttonText: 'Learn More',
      websiteUrl: '',
      imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
      bgColorHex: '#EAB308',
      status: 'Active',
      displayOrder: banners.length + 1
    });
    setShowModal(true);
  };

  const handleOpenEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      badge: banner.badge || '',
      buttonText: banner.buttonText || 'Learn More',
      websiteUrl: banner.websiteUrl || '',
      imageUrl: banner.imageUrl || '',
      bgColorHex: banner.bgColorHex || '#EAB308',
      status: banner.status || 'Active',
      displayOrder: banner.displayOrder || 1
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promotional banner?')) return;
    try {
      await bannerService.delete(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      setSuccessMessage('Banner deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err?.message || 'Failed to delete banner');
    }
  };

  const handleToggleStatus = async (banner) => {
    const newStatus = banner.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const updated = await bannerService.update(banner.id, { ...banner, status: newStatus });
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, status: newStatus } : b)));
      setSuccessMessage(`Banner marked as ${newStatus}!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err?.message || 'Failed to update banner status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      if (editingBanner) {
        const updated = await bannerService.update(editingBanner.id, formData);
        setBanners((prev) => prev.map((b) => (b.id === editingBanner.id ? { ...b, ...updated } : b)));
        setSuccessMessage('Banner updated successfully!');
      } else {
        const created = await bannerService.create(formData);
        setBanners((prev) => [...prev, created]);
        setSuccessMessage('New banner created successfully!');
      }
      setShowModal(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err?.message || 'Failed to save banner');
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md, 8px)',
    border: '1px solid var(--border-color, #e2e8f0)',
    backgroundColor: 'var(--bg-app, #f8fafc)',
    color: 'var(--text-primary, #0f172a)',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner Header */}
      <div className="card animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Mobile App / Content / <strong style={{ color: 'var(--text-primary)' }}>Promotional Banners</strong>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>App Promotional Banners</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Manage dynamic sliders shown on Student and Parent Mobile App Home Screens
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={fetchBanners} style={{ padding: '9px 14px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={handleOpenAdd} style={{ padding: '9px 16px' }}>
            <Plus size={18} /> Add New Banner
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <CheckCircle size={18} /> {successMessage}
        </div>
      )}
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Banners Grid / Cards */}
      {isLoading && banners.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <Spinner size={24} color="var(--accent-primary)" />
          <div style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>Loading promotional banners...</div>
        </div>
      ) : banners.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          No promotional banners configured. Click <strong>Add New Banner</strong> to publish your first banner!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {banners.map((b) => (
            <div
              key={b.id}
              className="card"
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--border-color, #e2e8f0)',
                overflow: 'hidden',
                padding: '16px'
              }}
            >
              {/* Preview Card matching mobile banner look */}
              <div
                style={{
                  borderRadius: '16px',
                  backgroundColor: b.bgColorHex || '#EAB308',
                  padding: '16px',
                  color: '#1e293b',
                  minHeight: '130px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
              >
                <div style={{ maxWidth: '65%' }}>
                  {b.badge && (
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '10px',
                        fontWeight: 800,
                        backgroundColor: 'rgba(255,255,255,0.85)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        marginBottom: '6px'
                      }}
                    >
                      {b.badge}
                    </span>
                  )}
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 900, whiteSpace: 'pre-line', lineHeight: 1.2 }}>
                    {b.title}
                  </h4>
                  {b.subtitle && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', opacity: 0.9, fontWeight: 600 }}>
                      {b.subtitle}
                    </p>
                  )}
                  <div style={{ marginTop: '8px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '10px',
                        fontWeight: 800,
                        backgroundColor: '#1e293b',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '6px'
                      }}
                    >
                      {b.buttonText || 'Learn More'}
                    </span>
                  </div>
                </div>

                {b.imageUrl && (
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      border: '2px solid rgba(255,255,255,0.6)'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>

              {/* Banner Details & Action Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-light, #f1f5f9)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    onClick={() => handleToggleStatus(b)}
                    style={{
                      cursor: 'pointer',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: b.status === 'Active' ? '#dcfce7' : '#f1f5f9',
                      color: b.status === 'Active' ? '#16a34a' : '#64748b'
                    }}
                  >
                    ● {b.status || 'Active'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Order #{b.displayOrder || 1}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleOpenEdit(b)}
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(b.id)}
                    style={{ padding: '6px 10px', fontSize: '12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Banner Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="card animate-scale-up"
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingBanner ? 'Edit Promotional Banner' : 'Create New Promotional Banner'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Banner Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2025/2026 SCHOOL ADMISSION"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Subtitle / Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Online Registration • Enroll Now"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. eSchool Admission"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Button Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Learn More"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Card Background Color
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={formData.bgColorHex}
                      onChange={(e) => setFormData({ ...formData, bgColorHex: e.target.value })}
                      style={{ width: '42px', height: '40px', padding: '0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={formData.bgColorHex}
                      onChange={(e) => setFormData({ ...formData, bgColorHex: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Active">Active (Visible in App)</option>
                    <option value="Inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Image URL / Asset Link
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Target Website URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="www.yourschoolwebsite.com"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannersModule;
