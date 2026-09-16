import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Plus, Calendar, Tag } from 'lucide-react';
import { noticeService } from '../../services/noticeService';

export const NoticeBoardModule = () => {
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>School Notice Board & Announcements</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Publish school circulars, exam notifications, holiday announcements, and event updates</p>
        </div>
        <button className="btn btn-primary" style={{ padding: '10px 18px' }}>
          <Plus size={18} /> Publish New Notice
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-bg)',
            color: '#ef4444',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          {error}
        </div>
      )}

      {isLoading && !notices.length && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading notices...
        </div>
      )}

      <div className="grid-responsive">
        {notices.map((n, i) => (
          <div key={i} className="col-span-6 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-info">{n.category}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.date}</span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{n.title}</h3>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <strong>Target Audience:</strong> {n.target}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
