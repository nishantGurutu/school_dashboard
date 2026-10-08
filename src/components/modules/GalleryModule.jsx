import React, { useState, useEffect, useCallback } from 'react';
import {
  Image,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  FolderPlus,
  X
} from 'lucide-react';
import { Spinner } from '../ui/Spinner';
import { galleryService } from '../../services/galleryService';

export const GalleryModule = () => {
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    photoCount: 1,
    status: 'Active',
    displayOrder: 1
  });

  const fetchAlbums = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await galleryService.list();
      setAlbums(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      setError(err?.message || 'Failed to load gallery albums');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const handleOpenAdd = () => {
    setEditingAlbum(null);
    setFormData({
      title: '',
      description: '',
      coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      photoCount: 5,
      status: 'Active',
      displayOrder: albums.length + 1
    });
    setShowModal(true);
  };

  const handleOpenEdit = (album) => {
    setEditingAlbum(album);
    setFormData({
      title: album.title || '',
      description: album.description || '',
      coverImage: album.coverImage || '',
      photoCount: album.photoCount || 1,
      status: album.status || 'Active',
      displayOrder: album.displayOrder || 1
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery album?')) return;
    try {
      await galleryService.delete(id);
      setAlbums((prev) => prev.filter((a) => a.id !== id));
      setSuccessMessage('Album deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err?.message || 'Failed to delete album');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      if (editingAlbum) {
        const updated = await galleryService.update(editingAlbum.id, formData);
        setAlbums((prev) => prev.map((a) => (a.id === editingAlbum.id ? { ...a, ...updated } : a)));
        setSuccessMessage('Album updated successfully!');
      } else {
        const created = await galleryService.create(formData);
        setAlbums((prev) => [...prev, created]);
        setSuccessMessage('New album created successfully!');
      }
      setShowModal(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err?.message || 'Failed to save album');
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
      {/* Top Header */}
      <div className="card animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Mobile App / Content / <strong style={{ color: 'var(--text-primary)' }}>School Photo Gallery</strong>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>School Photo Gallery Albums</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Manage photo albums and event memories shown on Student & Parent Mobile App Home Screens
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={fetchAlbums} style={{ padding: '9px 14px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={handleOpenAdd} style={{ padding: '9px 16px' }}>
            <FolderPlus size={18} /> Add New Album
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

      {/* Albums Grid */}
      {isLoading && albums.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <Spinner size={24} color="var(--accent-primary)" />
          <div style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>Loading gallery albums...</div>
        </div>
      ) : albums.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          No gallery albums found. Click <strong>Add New Album</strong> to publish your first album!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {albums.map((album) => (
            <div
              key={album.id}
              className="card"
              style={{
                padding: '0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: '16px'
              }}
            >
              {/* Cover Photo Preview */}
              <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: '#e2e8f0' }}>
                <img
                  src={album.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'}
                  alt={album.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  {album.photoCount || 1} Photos
                </span>
                <span
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    backgroundColor: album.status === 'Active' ? '#22c55e' : '#64748b',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: 800
                  }}
                >
                  {album.status || 'Active'}
                </span>
              </div>

              {/* Album Body */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
                    {album.title}
                  </h4>
                  {album.description && (
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary, #64748b)', lineHeight: 1.4 }}>
                      {album.description}
                    </p>
                  )}
                </div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-light, #f1f5f9)' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleOpenEdit(album)}
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(album.id)}
                    style={{ padding: '6px 10px', fontSize: '12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Album Modal */}
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
              maxWidth: '520px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingAlbum ? 'Edit Gallery Album' : 'Create New Gallery Album'}
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
                  Album Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Festival, Annual Function, Sports Day"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Description / Event Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the photo collection..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Photo Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.photoCount}
                    onChange={(e) => setFormData({ ...formData, photoCount: Number(e.target.value) || 1 })}
                    style={inputStyle}
                  />
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
                  Cover Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
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
                  {isSaving ? 'Saving...' : editingAlbum ? 'Update Album' : 'Create Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryModule;
