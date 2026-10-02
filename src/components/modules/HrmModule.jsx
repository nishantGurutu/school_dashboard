import React, { useState, useEffect, useCallback } from 'react';
import { UserCheck, Users, Briefcase, Plus, Search, Trash2, Eye, EyeOff, X, Phone, Mail } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { staffService } from '../../services/staffService';
import { Spinner } from '../ui/Spinner';

export const HrmModule = () => {
  const [headcount, setHeadcount] = useState({ facultyStaff: 0, administrativeStaff: 0, supportStaff: 0 });
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modalError, setModalError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    staffType: 'Administrative',
    designation: '',
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
      setError(e.message || 'Failed to load HRM data');
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

  const handleOpenModal = () => {
    setFormData({
      name: '',
      staffType: 'Administrative',
      designation: '',
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
      setModalError('Staff name is required');
      return;
    }
    if (!formData.email.trim()) {
      setModalError('Email (Login ID) is required');
      return;
    }
    if (!formData.password.trim()) {
      setModalError('Password is required for staff login');
      return;
    }

    setIsSubmitting(true);
    setModalError('');
    try {
      const payload = {
        name: formData.name.trim(),
        staffType: formData.staffType,
        designation: formData.designation.trim() || 'Staff Member',
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
      await fetchHrm();
    } catch (err) {
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
      await fetchHrm();
    } catch (err) {
      setError(err.message || 'Failed to delete staff member');
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.designation || '').toLowerCase().includes(q) ||
      (s.staffType || '').toLowerCase().includes(q) ||
      (s.phone || '').includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div className="card animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Human Resource Management (HRM)</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage faculty payroll, staff accounts, credentials, and recruitment</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleOpenModal}
          style={{ padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
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

      {/* Headcount Stat Cards */}
      <div className="grid-responsive">
        <div className="col-span-4 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Faculty Staff</h3>
            <Users size={20} color="var(--primary-color)" />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 800 }}>{headcount.facultyStaff}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Teachers & Academic Staff</span>
        </div>

        <div className="col-span-4 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Administrative Staff</h3>
            <Briefcase size={20} color="#0d9488" />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 800 }}>{headcount.administrativeStaff}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Management, Accounts & Office</span>
        </div>

        <div className="col-span-4 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Support & Maintenance</h3>
            <UserCheck size={20} color="#f59e0b" />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 800 }}>{headcount.supportStaff}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Security, Drivers, Technical Staff</span>
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Staff Directory</h3>
          <div style={{ position: 'relative', width: '300px' }}>
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
            No staff members found. Click "Add Staff Member" above to create one.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 14px' }}>Name</th>
                  <th style={{ padding: '12px 14px' }}>Designation</th>
                  <th style={{ padding: '12px 14px' }}>Department / Type</th>
                  <th style={{ padding: '12px 14px' }}>Contact (Login ID)</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{staff.name}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{staff.designation || 'Staff'}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--bg-card-hover)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {staff.staffType || 'Administrative'}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Add New Staff Member</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Creates staff profile and login account credentials</p>
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
              <div className="grid-responsive">
                <div className="col-span-6">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    style={modalInputStyle}
                    required
                  />
                </div>

                <div className="col-span-6">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Staff Type / Department <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formData.staffType}
                    onChange={(e) => handleChange('staffType', e.target.value)}
                    style={modalInputStyle}
                  >
                    <option value="Administrative">Administrative</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Support & Maintenance">Support & Maintenance</option>
                    <option value="Accounts">Accounts</option>
                    <option value="Library">Library</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Security">Security</option>
                  </select>
                </div>

                <div className="col-span-6">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Designation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Accountant, Librarian, Bus Driver"
                    value={formData.designation}
                    onChange={(e) => handleChange('designation', e.target.value)}
                    style={modalInputStyle}
                  />
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
                    placeholder="Enter phone number (numbers only)"
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
                    placeholder="Monthly salary"
                    value={formData.salary}
                    onChange={(e) => handleChange('salary', e.target.value)}
                    style={modalInputStyle}
                  />
                </div>

                <div className="col-span-6">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Join Date
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
                  Login Details (Credentials)
                </h4>
                <div className="grid-responsive">
                  <div className="col-span-6">
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Login Email / ID <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. staff.member@school.com"
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
                        placeholder="Enter login password"
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
                          right: '12px',
                          top: '10px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '10px 20px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 24px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#0d9488'
                  }}
                >
                  {isSubmitting ? (<><Spinner size={16} color="#ffffff" /> Saving...</>) : 'Save Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const modalInputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-app)',
  color: 'var(--text-primary)',
  fontSize: '0.85rem',
  outline: 'none',
  fontFamily: 'var(--font-sans)'
};
