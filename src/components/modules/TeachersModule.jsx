import React, { useState, useEffect, useCallback } from 'react';
import { UserCheck, Plus, Search, Mail, Phone, BookOpen, Edit, Trash2 } from 'lucide-react';
import { TeacherForm } from './TeacherForm';
import { teacherService } from '../../services/teacherService';
import { useApiAction } from '../../hooks/useApiAction';
import { Spinner } from '../ui/Spinner';

export const TeachersModule = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { busyKey, runAction } = useApiAction();

  const toTableRow = (t) => ({
    ...t,
    name: t.fullName || t.name || 'Faculty Member',
    id: t.id,
    department: t.department || 'General Faculty',
    subject: t.subject || 'All Subjects',
    qualification: t.qualification || 'Master Degree',
    phone: t.phone || 'N/A',
    email: t.email || 'N/A',
    status: t.status || 'Active',
    avatar: t.avatar || t.teacherPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  });

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
      setError(e.message || 'Failed to load teachers');
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
    const payload = {
      fullName: formData.teacherName || formData.name,
      employeeId: formData.teacherId || `TCH-${Date.now()}`,
      department: formData.department || 'Science',
      subject: formData.subject || 'Physics',
      qualification: formData.qualification || 'M.Sc.',
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      gender: (formData.gender || 'MALE').toUpperCase(),
      dob: formData.dob,
      joiningDate: formData.joiningDate,
      experience: formData.experience,
      designation: formData.designation,
      salary: formData.salary ? parseFloat(formData.salary) : 50000,
      contractType: formData.contractType || 'Permanent',
      workShift: formData.workShift || 'Morning',
      workLocation: formData.workLocation || 'Main Campus',
      status: formData.status || 'ACTIVE'
    };

    if (editingTeacher) {
      try {
        const updated = await teacherService.update(editingTeacher.id, payload);
        setTeachers((prev) => prev.map((t) => (t.id === editingTeacher.id ? toTableRow(updated) : t)));
        setEditingTeacher(null);
        await fetchTeachers();
      } catch (e) {
        setError(e.message || 'Failed to update teacher');
      }
    } else {
      try {
        const created = await teacherService.create(payload);
        setTeachers((prev) => [toTableRow(created), ...prev]);
        setShowAddForm(false);
        await fetchTeachers();
      } catch (e) {
        setError(e.message || 'Failed to create teacher');
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

  const filteredTeachers = teachers.filter(
    (t) =>
      (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(t.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div className="card animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Teachers & Faculty Directory</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage school teaching faculty, subject allocations, and departments</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
          style={{ padding: '10px 18px' }}
        >
          <Plus size={18} /> Add New Teacher
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="card animate-fade-in" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by teacher name, ID, or subject..."
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
          <div style={{ marginTop: '12px' }}>Loading faculty members from backend...</div>
        </div>
      )}

      {!isLoading && teachers.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          No teacher records found. Click "Add New Teacher" to create your first faculty profile!
        </div>
      )}

      {teachers.length > 0 && (
        <div className="grid-responsive">
          {filteredTeachers.map((t) => (
            <div key={t.id} className="col-span-4 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img src={t.avatar} alt={t.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t.name}</h3>
                    <span className="badge badge-info">{t.department}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    className="btn-icon"
                    onClick={() => handleEditClick(t)}
                    style={{ width: '32px', height: '32px' }}
                    title="Edit Teacher"
                  >
                    <Edit size={16} color="var(--accent-primary)" />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => runAction(`delete-${t.id}`, () => handleDeleteTeacher(t.id))}
                    disabled={busyKey === `delete-${t.id}`}
                    style={{ width: '32px', height: '32px', color: '#ef4444' }}
                    title="Delete Teacher"
                  >
                    {busyKey === `delete-${t.id}` ? <Spinner size={16} color="#ef4444" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Subject:</strong> {t.subject}</div>
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
                  Edit Teacher
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
