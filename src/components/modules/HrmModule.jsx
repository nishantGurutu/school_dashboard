import React, { useState, useEffect, useCallback } from 'react';
import { UserCheck, Users, Briefcase, Plus, Search, Trash2, Eye, EyeOff, X, Phone, Mail, ShieldCheck } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { staffService } from '../../services/staffService';
import { Spinner } from '../ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { DesignationModule } from './DesignationModule';

export const HrmModule = () => {
  const { activeTab, setActiveTab } = useTheme();
  const toast = useToast();
  const [headcount, setHeadcount] = useState({ facultyStaff: 0, administrativeStaff: 0, supportStaff: 0 });
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modalError, setModalError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    role: 'PRINCIPAL',
    staffType: 'Administration',
    designation: 'School Principal',
    phone: '',
    email: '',
    salary: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    password: ''
  });

  const fetchHrm = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [hrmData, staffData] = await Promise.all([
        dashboardService.hrm().catch(() => ({ facultyStaff: 0, administrativeStaff: 0, supportStaff: 0 })),
        staffService.list().catch(() => [])
      ]);

      setHeadcount({
        facultyStaff: Number(hrmData.facultyStaff) || 0,
        administrativeStaff: Number(hrmData.administrativeStaff) || 0,
        supportStaff: Number(hrmData.supportStaff) || 0
      });

      const list = Array.isArray(staffData) ? staffData : (staffData?.data || staffData?.content || []);
      setStaffList(list);
    } catch (e) {
      setError(e.message || 'Failed to load Staff & HRM data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHrm();
  }, [fetchHrm]);

  const handleNumericKeyDown = (e) => {
    if (
      !/[0-9]/.test(e.key) &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      e.preventDefault();
    }
  };

  const handlePhoneChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 15);
    setFormData((prev) => ({ ...prev, phone: numericValue }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (selectedRole) => {
    let defaultType = 'Administration';
    let defaultDesig = 'Staff Member';

    if (selectedRole === 'PRINCIPAL') {
      defaultType = 'Administration';
      defaultDesig = 'School Principal';
    } else if (selectedRole === 'ACCOUNTANT') {
      defaultType = 'Accounts';
      defaultDesig = 'Senior Accountant';
    } else if (selectedRole === 'LIBRARIAN') {
      defaultType = 'Library';
      defaultDesig = 'Chief Librarian';
    } else if (selectedRole === 'SUPER_ADMIN') {
      defaultType = 'Administration';
      defaultDesig = 'System Administrator';
    } else if (selectedRole === 'STAFF') {
      defaultType = 'Administration';
      defaultDesig = 'Office Administrator';
    }

    setFormData((prev) => ({
      ...prev,
      role: selectedRole,
      staffType: defaultType,
      designation: defaultDesig
    }));
  };

  const handleOpenModal = () => {
    setFormData({
      name: '',
      role: 'PRINCIPAL',
      staffType: 'Administration',
      designation: 'School Principal',
      phone: '',
      email: '',
      salary: '',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      password: ''
    });
    setModalError('');
    setShowAddModal(true);
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError('Full name is required');
      return;
    }
    if (!formData.email.trim()) {
      setModalError('Login Email / ID is required');
      return;
    }
    if (!formData.password.trim()) {
      setModalError('Password is required for user login');
      return;
    }

    setIsSubmitting(true);
    setModalError('');
    try {
      const payload = {
        name: formData.name.trim(),
        role: formData.role,
        staffType: formData.staffType,
        designation: formData.designation.trim() || formData.role,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        salary: formData.salary ? parseFloat(formData.salary) : 0,
        joinDate: formData.joinDate,
        status: formData.status,
        password: formData.password.trim()
      };

      const created = await staffService.create(payload);
      setStaffList((prev) => [created, ...prev]);
      setShowAddModal(false);
      toast.success(
        `Staff account for "${formData.name}" created as ${formData.role}! Credentials active.`,
        'Staff & HRM'
      );
      await fetchHrm();
    } catch (err) {
      toast.error(err.message || 'Failed to create staff member', 'Staff & HRM');
      setModalError(err.message || 'Failed to create staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    setError('');
    try {
      await staffService.remove(id);
      setStaffList((prev) => prev.filter((s) => s.id !== id && String(s.id) !== String(id)));
      toast.info('Staff member removed successfully', 'Staff & HRM');
      await fetchHrm();
    } catch (err) {
      toast.error(err.message || 'Failed to delete staff member', 'Staff & HRM');
      setError(err.message || 'Failed to delete staff member');
    }
  };

  const getResolvedRole = (staff) => {
    const rawRole = (staff.role || '').toUpperCase();
    const rawDesig = (staff.designation || '').toUpperCase();
    const rawType = (staff.staffType || '').toUpperCase();

    if (rawRole.includes('PRINCIPAL') || rawDesig.includes('PRINCIPAL') || rawType.includes('PRINCIPAL')) {
      return 'PRINCIPAL';
    }
    if (rawRole.includes('ACCOUNT') || rawDesig.includes('ACCOUNT') || rawType.includes('ACCOUNT')) {
      return 'ACCOUNTANT';
    }
    if (rawRole.includes('LIBRAR') || rawDesig.includes('LIBRAR') || rawType.includes('LIBRAR')) {
      return 'LIBRARIAN';
    }
    if (rawRole.includes('SUPER') || rawRole === 'ADMIN') {
      return 'SUPER_ADMIN';
    }
    return 'STAFF';
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'PRINCIPAL':
        return { label: 'Principal (Head)', bg: '#f3e8ff', text: '#7e22ce', border: '#d8b4fe' };
      case 'ACCOUNTANT':
        return { label: 'Accountant', bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
      case 'LIBRARIAN':
        return { label: 'Librarian', bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' };
      default:
        return { label: 'Office Staff', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = (
      (s.name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.designation || '').toLowerCase().includes(q) ||
      (s.staffType || '').toLowerCase().includes(q) ||
      (s.role || '').toLowerCase().includes(q) ||
      (s.phone || '').includes(q)
    );

    if (!matchesSearch) return false;

    if (roleFilter === 'ALL') return true;
    const resolvedRole = getResolvedRole(s);
    return resolvedRole === roleFilter;
  });

  const modalInputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-app)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none'
  };

  const isDesignationView = activeTab === 'hrm-designation' || activeTab === 'designation';

  if (isDesignationView) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Sub-Nav Tabs for HRM */}
        <div style={{
          display: 'flex',
          gap: '4px',
          backgroundColor: 'var(--bg-app)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          width: 'fit-content'
        }}>
          <button
            onClick={() => setActiveTab('hrm-staff')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Users size={16} /> Staff Directory ({staffList.length})
          </button>

          <button
            onClick={() => setActiveTab('hrm-designation')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: '#0d9488',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Briefcase size={16} /> Designation
          </button>
        </div>

        <DesignationModule />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Sub-Nav Tabs for HRM */}
      <div style={{
        display: 'flex',
        gap: '4px',
        backgroundColor: 'var(--bg-app)',
        padding: '4px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)',
        width: 'fit-content'
      }}>
        <button
          onClick={() => setActiveTab('hrm-staff')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: '#0d9488',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Users size={16} /> Staff Directory ({staffList.length})
        </button>

        <button
          onClick={() => setActiveTab('hrm-designation')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Briefcase size={16} /> Designation
        </button>
      </div>

      {/* Header Bar */}
      <div className="card animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Staff & HRM Directory</h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', backgroundColor: 'rgba(13, 148, 136, 0.1)', color: '#0d9488' }}>
              Principal, Accountant, Librarian & Staff Roles
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Create and manage school staff accounts, assign RBAC access roles, and monitor employee credentials
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleOpenModal}
          style={{ padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Add Staff / Principal
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

      {/* Headcount Stat Cards */}
      <div className="grid-responsive">
        <div className="col-span-4 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Administration & Principal</h3>
            <ShieldCheck size={20} color="var(--primary-color)" />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 800 }}>
            {staffList.filter(s => getResolvedRole(s) === 'PRINCIPAL' || getResolvedRole(s) === 'SUPER_ADMIN').length || 1}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>School Head & Administration</span>
        </div>

        <div className="col-span-4 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Finance & Accounts</h3>
            <Briefcase size={20} color="#059669" />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 800 }}>
            {staffList.filter(s => getResolvedRole(s) === 'ACCOUNTANT').length || 1}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Accountants & Cashiers</span>
        </div>

        <div className="col-span-4 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Library & Operations</h3>
            <Users size={20} color="#d97706" />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 800 }}>
            {staffList.filter(s => getResolvedRole(s) === 'LIBRARIAN' || getResolvedRole(s) === 'STAFF').length || staffList.length}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Librarians & Support Staff</span>
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Filter Chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Staff' },
              { id: 'PRINCIPAL', label: 'Principals' },
              { id: 'ACCOUNTANT', label: 'Accountants' },
              { id: 'LIBRARIAN', label: 'Librarians' },
              { id: 'STAFF', label: 'Administrative Staff' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: roleFilter === tab.id ? 'var(--primary-color)' : 'var(--border-color)',
                  backgroundColor: roleFilter === tab.id ? 'var(--primary-color)' : 'transparent',
                  color: roleFilter === tab.id ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name, email, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem'
              }}
            />
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <Spinner size={24} /> Loading Staff Directory...
          </div>
        ) : filteredStaff.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No staff members found matching this filter. Click "Add Staff / Principal" above to create one.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 14px' }}>Name</th>
                  <th style={{ padding: '12px 14px' }}>System Role</th>
                  <th style={{ padding: '12px 14px' }}>Designation</th>
                  <th style={{ padding: '12px 14px' }}>Department</th>
                  <th style={{ padding: '12px 14px' }}>Contact (Login ID)</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => {
                  const resolvedRole = getResolvedRole(staff);
                  const badge = getRoleBadge(resolvedRole);

                  return (
                    <tr key={staff.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700 }}>{staff.name}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            backgroundColor: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{staff.designation || 'Staff'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            backgroundColor: 'var(--bg-card-hover)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          {staff.staffType || 'Administration'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={12} color="var(--text-muted)" /> {staff.email || 'N/A'}
                          </span>
                          {staff.phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              <Phone size={12} /> {staff.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: staff.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: staff.status === 'ACTIVE' ? '#22c55e' : '#ef4444'
                          }}
                        >
                          {staff.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteStaff(staff.id)}
                          title="Delete staff member"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '6px'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff / Principal Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            className="card animate-scale-up"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Add School Staff / Principal</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Assign role permissions and create credentials for Principal, Accountant, Librarian, or Staff
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-danger-bg)',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Highlighted Role Selector */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(37, 99, 235, 0.06)',
                  border: '1px solid rgba(37, 99, 235, 0.2)'
                }}
              >
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px', color: 'var(--primary-color)' }}>
                  System Access Role (Permissions) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  style={{
                    ...modalInputStyle,
                    borderColor: 'var(--primary-color)',
                    fontWeight: 700,
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  <option value="PRINCIPAL">👑 Principal (Head of School - Academic & Admin Access)</option>
                  <option value="ACCOUNTANT">💰 Accountant (Finance & Fees Collection Access)</option>
                  <option value="LIBRARIAN">📚 Librarian (Library & Books Inventory Access)</option>
                  <option value="STAFF">🏢 Administrative Staff (General Office & Student Support)</option>
                  <option value="SUPER_ADMIN">⚡ Super Admin (Full Unrestricted System Access)</option>
                </select>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                  Selecting this role will configure user dashboard modules and mobile app access according to RBAC rules.
                </span>
              </div>

              <div className="grid-responsive">
                <div className="col-span-6">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Arvind Sharma"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    style={modalInputStyle}
                    required
                  />
                </div>

                <div className="col-span-6">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Designation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. School Principal, Senior Accountant"
                    value={formData.designation}
                    onChange={(e) => handleChange('designation', e.target.value)}
                    style={modalInputStyle}
                  />
                </div>

                <div className="col-span-6">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Department / Staff Type
                  </label>
                  <select
                    value={formData.staffType}
                    onChange={(e) => handleChange('staffType', e.target.value)}
                    style={modalInputStyle}
                  >
                    <option value="Administration">Administration</option>
                    <option value="Accounts">Accounts & Finance</option>
                    <option value="Library">Library</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Support & Maintenance">Support & Maintenance</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Security">Security</option>
                  </select>
                </div>

                <div className="col-span-6">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={15}
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    onKeyDown={handleNumericKeyDown}
                    style={modalInputStyle}
                  />
                </div>

                <div className="col-span-6">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Salary (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 85000"
                    value={formData.salary}
                    onChange={(e) => handleChange('salary', e.target.value)}
                    style={modalInputStyle}
                  />
                </div>

                <div className="col-span-6">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => handleChange('joinDate', e.target.value)}
                    style={modalInputStyle}
                  />
                </div>
              </div>

              {/* Login Details Section */}
              <div
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  backgroundColor: 'rgba(13, 148, 136, 0.04)'
                }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>
                  Login Credentials (Web & Mobile Access)
                </h4>
                <div className="grid-responsive">
                  <div className="col-span-6">
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Login Email / ID <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. principal@school.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      style={modalInputStyle}
                      required
                    />
                  </div>

                  <div className="col-span-6">
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Login Password <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter secure password"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        style={{ ...modalInputStyle, paddingRight: '40px' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)'
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {isSubmitting && <Spinner size={16} color="#ffffff" />}
                  {isSubmitting ? 'Creating Account...' : 'Create Staff / Principal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
