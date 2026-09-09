import React from 'react';
import { Bell, Plus, Calendar, Tag } from 'lucide-react';

export const NoticeBoardModule = () => {
  const notices = [
    { title: 'Mid-Term Exam Timetable Announced for Grades 6 to 12', date: '05 Sep 2026', target: 'All Students & Parents', category: 'Exams' },
    { title: 'Annual Sports Day Registrations & Selection Trials', date: '04 Sep 2026', target: 'Students', category: 'Sports' },
    { title: 'Parent-Teacher Meeting (PTM) Scheduled for Term 1', date: '02 Sep 2026', target: 'Parents', category: 'PTM' },
    { title: 'Faculty Staff Meeting on Curriculum Review', date: '28 Aug 2026', target: 'Teachers & Staff', category: 'Staff' }
  ];

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
