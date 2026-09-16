import React, { useState, useEffect, useCallback } from 'react';
import { UserCheck, Users, Briefcase, Plus } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';

export const HrmModule = () => {
  const [headcount, setHeadcount] = useState({ facultyStaff: 0, administrativeStaff: 0, supportStaff: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchHrm = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await dashboardService.hrm();
      setHeadcount({
        facultyStaff: Number(data.facultyStaff) || 0,
        administrativeStaff: Number(data.administrativeStaff) || 0,
        supportStaff: Number(data.supportStaff) || 0
      });
    } catch (e) {
      setError(e.message || 'Failed to load HRM summary');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHrm();
  }, [fetchHrm]);

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

      {isLoading && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading HRM summary...
        </div>
      )}

      <div className="grid-responsive">
        <div className="col-span-4 card animate-fade-in">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Faculty Staff</h3>
          <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{headcount.facultyStaff}</span>
        </div>
        <div className="col-span-4 card animate-fade-in">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Administrative Staff</h3>
          <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{headcount.administrativeStaff}</span>
        </div>
        <div className="col-span-4 card animate-fade-in">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Support & Maintenance</h3>
          <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{headcount.supportStaff}</span>
        </div>
      </div>
    </div>
  );
};
