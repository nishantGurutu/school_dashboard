import React, { useState, useEffect, useCallback } from 'react';
import { UserCheck, Plus, Search, Mail, Phone, BookOpen, Edit, Trash2, ShieldCheck, Users } from 'lucide-react';
import { TeacherForm } from './TeacherForm';
import { teacherService } from '../../services/teacherService';
import { staffService } from '../../services/staffService';
import { useApiAction } from '../../hooks/useApiAction';
import { Spinner } from '../ui/Spinner';

export const TeachersModule = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { busyKey, runAction } = useApiAction();

  const toTableRow = (t) => {
    let rawType = t.type;
    if (!rawType) {
      const desig = (t.designation || '').toLowerCase();
      const dept = (t.department || '').toLowerCase();
      if (desig.includes('princip') || dept.includes('princip')) rawType = 'Principal';
      else if (desig.includes('staff') || dept.includes('staff')) rawType = 'Staff';
      else rawType = 'Teacher';
    }
    return {
      ...t,
      name: t.fullName || t.name || (t.firstName ? `${t.firstName} ${t.lastName || ''}`.trim() : `${rawType} Member`),
      id: t.id,
      type: rawType,
      department: t.department || (rawType === 'Principal' || rawType === 'Staff' ? 'Administration' : 'General Faculty'),
      designation: t.designation || rawType,
      subject: t.subject || (rawType === 'Teacher' ? 'All Subjects' : 'Administration'),
      qualification: t.qualification || (rawType === 'Principal' ? 'Master Degree' : 'Graduate'),
      phone: t.phone || 'N/A',
      email: t.email || 'N/A',
      status: t.status || 'Active',
      avatar: t.avatar || t.teacherPhoto || (rawType === 'Principal'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80')
    };
  };

  const [teachers, setTeachers] = useState([]);

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      let result;
      if (searchTerm.trim()) {
        result = await teacherService.search(searchTerm.trim());
      } else {
        result = await teacherService.list({ page: 0, size: 200 });
      }
      const items = Array.isArray(result)
        ? result
        : result && Array.isArray(result.content)
        ? result.content
        : [];

      setTeachers(items.map(toTableRow));
    } catch (e) {
      setError(e.message || 'Failed to load faculty & staff directory');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleEditClick = (teacher) => {
    setEditingTeacher(teacher);
  };

  const handleSaveTeacher = async (formData) => {
    setError('');
    const selectedType = formData.type || 'Teacher';
    const rawName = formData.fullName || formData.name || formData.teacherName || `${selectedType} Member`;
    const nameParts = rawName.trim().split(' ');
    const firstName = nameParts[0] || selectedType;
    const lastName = nameParts.slice(1).join(' ') || (selectedType === 'Principal' ? 'Office' : (selectedType === 'Staff' ? 'Staff' : 'Faculty'));

    const defaultDesignation = selectedType === 'Principal' ? 'Principal' : (selectedType === 'Staff' ? 'Staff' : 'Teacher');
    const defaultDept = selectedType === 'Principal' ? 'Administration' : (selectedType === 'Staff' ? 'Administration' : (formData.subject || 'Academic'));

    const payload = {
      type: selectedType,
      employeeId: formData.employeeId || formData.teacherId || `${selectedType.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      firstName: firstName,
      lastName: lastName,
      department: formData.department || defaultDept,
      subject: formData.subject || (selectedType === 'Principal' ? 'Administration' : (selectedType === 'Staff' ? 'General' : 'General')),
      qualification: formData.qualification || (selectedType === 'Principal' ? 'Post Graduate / Master' : 'Graduate'),
      designation: formData.designation || defaultDesignation,
      phone: formData.phone || '+91 9876543210',
      email: formData.loginEmail || formData.email || `${selectedType.toLowerCase()}_${Date.now()}@schooldesk.com`,
      password: formData.loginPassword || formData.password || 'password',
      address: formData.address || 'School Campus',
      joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
      experienceYears: formData.experienceYears ? parseInt(formData.experienceYears, 10) : 5,
      bloodGroup: formData.bloodGroup || 'O+',
      avatar: formData.avatar || formData.teacherPhoto || (selectedType === 'Principal'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
      status: 'ACTIVE'
    };

    if (editingTeacher) {
      try {
        const updated = await teacherService.update(editingTeacher.id, payload);
        setTeachers((prev) => prev.map((t) => (t.id === editingTeacher.id ? toTableRow(updated) : t)));
        setEditingTeacher(null);
        await fetchTeachers();
      } catch (e) {
        setError(e.message || 'Failed to update member');
      }
    } else {
      try {
        // Create in backend via teacherService (supports Teacher, Principal, Staff with role & staff sync)
        const created = await teacherService.create(payload);

        // Also ensure direct StaffService registration for Principal / Staff
        if (selectedType === 'Principal' || selectedType === 'Staff') {
          try {
            await staffService.create({
              name: `${firstName} ${lastName}`.trim(),
              role: selectedType === 'Principal' ? 'PRINCIPAL' : 'STAFF',
              staffType: selectedType,
              designation: payload.designation,
              phone: payload.phone,
              email: payload.email,
              password: payload.password,
              status: 'Active',
              salary: 0,
              joinDate: payload.joiningDate
            });
          } catch (staffErr) {
            console.log('Staff service sync note:', staffErr?.message);
          }
        }

        setTeachers((prev) => [toTableRow(created), ...prev]);
        setShowAddForm(false);
        await fetchTeachers();
      } catch (e) {
        setError(e.message || `Failed to create ${selectedType}`);
      }
    }
  };

  const handleDeleteTeacher = async (id) => {
    setError('');
    try {
      await teacherService.remove(id);
      setTeachers((prev) => prev.filter((t) => t.id !== id && String(t.id) !== String(id)));
    } catch (e) {
      setError(e.message || 'Failed to delete teacher');
    }
  };

  if (showAddForm || editingTeacher) {
    return (
      <TeacherForm
        isEditMode={Boolean(editingTeacher)}
        initialData={editingTeacher}
        onBack={() => {
          setShowAddForm(false);
          setEditingTeacher(null);
        }}
        onSaveTeacher={handleSaveTeacher}
      />
    );
  }

  const getTypeBadge = (type) => {
    const normalized = (type || 'Teacher').toLowerCase();
    if (normalized.includes('princip')) {
      return {
        label: 'Principal',
        bg: 'rgba(139, 92, 246, 0.12)',
        color: '#7c3aed',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        Icon: ShieldCheck
      };
    }
    if (normalized.includes('staff')) {
      return {
        label: 'Staff',
        bg: 'rgba(16, 185, 129, 0.12)',
        color: '#059669',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        Icon: Users
      };
    }
    return {
      label: 'Teacher',
      bg: 'rgba(59, 130, 246, 0.12)',
      color: '#2563eb',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      Icon: UserCheck
    };
  };

  const filteredTeachers = teachers.filter((t) => {
    if (typeFilter !== 'ALL') {
      const curType = (t.type || 'Teacher').toUpperCase();
      if (typeFilter === 'TEACHER' && !curType.includes('TEACH')) return false;
      if (typeFilter === 'PRINCIPAL' && !curType.includes('PRINCIP')) return false;
      if (typeFilter === 'STAFF' && !curType.includes('STAFF')) return false;
    }
    const q = searchTerm.toLowerCase();
    return (
      (t.name || '').toLowerCase().includes(q) ||
      (t.subject || '').toLowerCase().includes(q) ||
      (t.department || '').toLowerCase().includes(q) ||
      (t.type || '').toLowerCase().includes(q) ||
      (t.designation || '').toLowerCase().includes(q) ||
      String(t.id || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div className="card animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Teachers, Principals & Staff Directory</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage school teaching faculty, principals, and administrative staff members</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
          style={{ padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Add New Member (Teacher / Principal / Staff)
        </button>
      </div>

      {/* Search & Role Filter Bar */}
      <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name, role, subject, department, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 40px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Quick Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All', count: teachers.length },
              { id: 'TEACHER', label: 'Teachers', count: teachers.filter(t => (t.type || 'Teacher').toLowerCase().includes('teach')).length },
              { id: 'PRINCIPAL', label: 'Principals', count: teachers.filter(t => (t.type || '').toLowerCase().includes('princip')).length },
              { id: 'STAFF', label: 'Staff', count: teachers.filter(t => (t.type || '').toLowerCase().includes('staff')).length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: typeFilter === tab.id ? 'var(--primary-color)' : 'var(--border-color)',
                  backgroundColor: typeFilter === tab.id ? 'var(--primary-color)' : 'transparent',
                  color: typeFilter === tab.id ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    backgroundColor: typeFilter === tab.id ? 'rgba(255,255,255,0.25)' : 'var(--bg-app)',
                    color: typeFilter === tab.id ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
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

      {isLoading && !teachers.length && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <Spinner size={24} color="var(--accent-primary)" />
          <div style={{ marginTop: '12px' }}>Loading members from backend...</div>
        </div>
      )}

      {!isLoading && teachers.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          No records found. Click "Add New Member" to create your first profile!
        </div>
      )}

      {teachers.length > 0 && (
        <div className="grid-responsive">
          {filteredTeachers.map((t) => {
            const badge = getTypeBadge(t.type);
            const BadgeIcon = badge.Icon;
            return (
              <div key={t.id} className="col-span-4 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img src={t.avatar} alt={t.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{t.name}</h3>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: badge.border
                          }}
                        >
                          <BadgeIcon size={12} />
                          {badge.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <span className="badge badge-info">{t.department}</span>
                        {t.designation && t.designation !== t.type && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>• {t.designation}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className="btn-icon"
                      onClick={() => handleEditClick(t)}
                      style={{ width: '32px', height: '32px' }}
                      title={`Edit ${t.type || 'Member'}`}
                    >
                      <Edit size={16} color="var(--accent-primary)" />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => runAction(`delete-${t.id}`, () => handleDeleteTeacher(t.id))}
                      disabled={busyKey === `delete-${t.id}`}
                      style={{ width: '32px', height: '32px', color: '#ef4444' }}
                      title={`Delete ${t.type || 'Member'}`}
                    >
                      {busyKey === `delete-${t.id}` ? <Spinner size={16} color="#ef4444" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div><strong>{t.type === 'Teacher' ? 'Subject' : 'Role / Domain'}:</strong> {t.subject}</div>
                  <div><strong>Qualification:</strong> {t.qualification}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {t.email}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {t.phone}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                  <span className={`badge ${t.status === 'Active' || t.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>{t.status}</span>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEditClick(t)}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Edit {t.type || 'Profile'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
