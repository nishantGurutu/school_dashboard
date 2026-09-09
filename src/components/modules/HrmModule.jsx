import React from 'react';
import { UserCheck, Users, Briefcase, Plus } from 'lucide-react';

export const HrmModule = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Human Resource Management (HRM)</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage faculty payroll, staff attendance, performance appraisals, and recruitment</p>
        </div>
        <button className="btn btn-primary" style={{ padding: '10px 18px' }}>
          <Plus size={18} /> Add Staff Member
        </button>
      </div>

      <div className="grid-responsive">
        <div className="col-span-4 card animate-fade-in">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Faculty Staff</h3>
          <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>120</span>
        </div>
        <div className="col-span-4 card animate-fade-in">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Administrative Staff</h3>
          <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>45</span>
        </div>
        <div className="col-span-4 card animate-fade-in">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Support & Maintenance</h3>
          <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>20</span>
        </div>
      </div>
    </div>
  );
};
