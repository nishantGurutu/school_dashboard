import React, { useState } from 'react';
import { UserCheck, Plus, Search, Mail, Phone, BookOpen, Edit, Trash2 } from 'lucide-react';
import { TeacherForm } from './TeacherForm';

export const TeachersModule = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [teachers, setTeachers] = useState([
    {
      id: 'TCH-101',
      name: 'Dr. Robert Langdon',
      department: 'Mathematics & Science',
      subject: 'Advanced Calculus & Physics',
      qualification: 'Ph.D. in Applied Mathematics',
      phone: '+1 555-0211',
      email: 'r.langdon@auroraschool.edu',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 'TCH-102',
      name: 'Prof. Clara Oswald',
      department: 'English Literature',
      subject: 'World Literature & Creative Writing',
      qualification: 'M.A. English Literature',
      phone: '+1 555-0288',
      email: 'c.oswald@auroraschool.edu',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 'TCH-103',
      name: 'Dr. Henry Walton',
      department: 'Computer Science',
      subject: 'Data Structures & Web Dev',
      qualification: 'Ph.D. Computer Engineering',
      phone: '+1 555-0312',
      email: 'h.walton@auroraschool.edu',
      status: 'On Leave',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    }
  ]);

  const handleEditClick = (teacher) => {
    setEditingTeacher(teacher);
  };

  const handleSaveTeacher = (formData) => {
    if (editingTeacher) {
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === editingTeacher.id
            ? {
                ...t,
                name: formData.fullName || t.name,
                subject: formData.subject || t.subject,
                qualification: formData.qualification || t.qualification,
                phone: formData.phone || t.phone,
                email: formData.email || t.email
              }
            : t
        )
      );
      setEditingTeacher(null);
    } else {
      const newTeacherObj = {
        id: formData.teacherId || `TCH-10${teachers.length + 1}`,
        name: formData.fullName || 'New Teacher',
        department: 'Science & Humanities',
        subject: formData.subject || 'English',
        qualification: formData.qualification || 'Master Degree',
        phone: formData.phone || '+1 555-0000',
        email: formData.email || 'teacher@auroraschool.edu',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      };

      setTeachers([newTeacherObj, ...teachers]);
      setShowAddForm(false);
    }
  };

  const handleDeleteTeacher = (id) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
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
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* Teachers Cards Grid */}
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
                  onClick={() => handleDeleteTeacher(t.id)}
                  style={{ width: '32px', height: '32px', color: '#ef4444' }}
                  title="Delete Teacher"
                >
                  <Trash2 size={16} />
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
              <span className={`badge ${t.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{t.status}</span>
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
    </div>
  );
};
