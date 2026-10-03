import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Plus, Calendar, Tag, Trash2, Eye, X, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { noticeService } from '../../services/noticeService';
import { Spinner } from '../ui/Spinner';
import { useToast } from '../../context/ToastContext';

export const NoticeBoardModule = () => {
  const toast = useToast();
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    target: 'ALL',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchNotices = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await noticeService.list();
      setNotices(Array.isArray(result) ? result : []);
    } catch (e) {
      setError(e.message || 'Failed to load notices');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleOpenCreateModal = () => {
    setFormData({
      title: '',
      content: '',
      category: 'General',
      target: 'ALL',
      date: new Date().toISOString().split('T')[0]
    });
    setError('');
    setSuccessMsg('');
    setIsCreateModalOpen(true);
  };

  const handlePublishNotice = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide a notice title.');
      return;
    }
    if (!formData.content.trim()) {
      setError('Please enter notice announcement details.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await noticeService.create({
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        target: formData.target,
        date: formData.date
      });
      toast.success('Notice published and synced to mobile app!', 'Notice Board');
      setSuccessMsg('Notice published successfully! Synced across Mobile App and Web.');
      setIsCreateModalOpen(false);
      fetchNotices();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      toast.error(err.message || 'Failed to publish notice', 'Notice Board');
      setError(err.message || 'Failed to publish notice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await noticeService.remove(id);
      toast.info('Notice removed from board', 'Notice Board');
      setSuccessMsg('Notice removed successfully.');
      fetchNotices();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      toast.error(err.message || 'Failed to delete notice', 'Notice Board');
      setError(err.message || 'Failed to delete notice');
    }
  };

  const getCategoryColor = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c === 'urgent') return { bg: '#fee2e2', text: '#ef4444', border: '#fca5a5' };
    if (c === 'academic') return { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' };
    if (c === 'event') return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
    if (c === 'holiday') return { bg: '#dcfce7', text: '#15803d', border: '#86efac' };
    return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner Header */}
      <div className="card animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Bell size={20} />
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>School Notice Board & Announcements</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Publish circulars, exam dates, holiday alerts, and event notifications. Synced live with Student, Parent & Teacher Mobile Apps.
          </p>
        </div>

        <button 
          onClick={handleOpenCreateModal}
          className="btn btn-primary" 
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
        >
          <Plus size={18} /> Publish New Notice
        </button>
      </div>

      {/* Notifications / Alerts */}
      {successMsg && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#ecfdf5',
          border: '1px solid #6ee7b7',
          color: '#065f46',
          fontSize: '0.88rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={18} color="#10b981" />
          {successMsg}
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-danger-bg)',
          border: '1px solid #fca5a5',
          color: '#ef4444',
          fontSize: '0.88rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {isLoading && !notices.length && (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-secondary)' }}>
          <Spinner size={32} />
          <p style={{ marginTop: '12px', fontWeight: 600 }}>Loading latest announcements...</p>
        </div>
      )}

      {!isLoading && notices.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <Bell size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <h3>No notices published yet</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Click 'Publish New Notice' to broadcast an announcement to your school community.</p>
        </div>
      )}

      {/* Notice Cards Grid */}
      <div className="grid-responsive">
        {notices.map((n, i) => {
          const catStyle = getCategoryColor(n.category);
          return (
            <div 
              key={n.id || i} 
              className="col-span-6 card animate-fade-in" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '14px',
                borderLeft: `4px solid ${catStyle.text}`,
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: catStyle.bg,
                    color: catStyle.text,
                    border: `1px solid ${catStyle.border}`
                  }}>
                    {n.category || 'General'}
                  </span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    backgroundColor: 'var(--bg-app)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Users size={12} /> {n.target || 'ALL'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {n.date}
                  </span>
                  <button 
                    onClick={() => handleDeleteNotice(n.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: '4px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Delete Notice"
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {n.title}
                </h3>
                <p style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {n.content || 'No details provided.'}
                </p>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setSelectedNotice(n);
                    setIsDetailModalOpen(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0d9488',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Eye size={14} /> Read Full Notice
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Publish Notice Modal */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{
            width: '100%',
            maxWidth: '560px',
            borderRadius: '16px',
            padding: '28px',
            backgroundColor: 'var(--bg-surface)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Publish New Announcement</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Instantly notifies mobile app users based on target role</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePublishNotice} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Notice Title *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Parent Teacher Meeting (PTM) Schedule"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  >
                    <option value="General">General Notice</option>
                    <option value="Urgent">Urgent / Important</option>
                    <option value="Academic">Academic / Exam</option>
                    <option value="Event">Sports & Events</option>
                    <option value="Holiday">Holiday Notification</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Target Audience</label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  >
                    <option value="ALL">Everyone (All School)</option>
                    <option value="STUDENT">Students Only</option>
                    <option value="PARENT">Parents Only</option>
                    <option value="TEACHER">Teachers & Staff Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Publish Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Announcement Details *</label>
                <textarea
                  rows={4}
                  placeholder="Enter full notice announcement details..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn"
                  style={{ padding: '10px 18px', border: '1px solid var(--border-color)', background: 'none' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ padding: '10px 22px', fontWeight: 700 }}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notice Detail View Modal */}
      {isDetailModalOpen && selectedNotice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{
            width: '100%',
            maxWidth: '600px',
            borderRadius: '16px',
            padding: '28px',
            backgroundColor: 'var(--bg-surface)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="badge badge-info">{selectedNotice.category || 'General'}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target: <strong>{selectedNotice.target || 'ALL'}</strong></span>
              </div>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '10px' }}>{selectedNotice.title}</h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} /> Published on: {selectedNotice.date}
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: 'var(--bg-app)',
              borderRadius: '10px',
              lineHeight: 1.6,
              fontSize: '0.92rem',
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              border: '1px solid var(--border-light)'
            }}>
              {selectedNotice.content || selectedNotice.title}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="btn btn-primary"
                style={{ padding: '8px 20px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

