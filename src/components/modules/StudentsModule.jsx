import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  User,
  CheckCircle,
  FileText,
  Trash2,
  Edit
} from 'lucide-react';
import { AddStudentForm } from './AddStudentForm';

export const StudentsModule = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');

  const [studentsData, setStudentsData] = useState([
    {
      id: 'STU-001',
      name: 'Alexander Wright',
      rollNo: '1001',
      class: 'Grade 10-A',
      gender: 'Male',
      dob: '12 May 2010',
      guardian: 'Robert Wright',
      phone: '+1 555-0192',
      email: 'a.wright@gmail.com',
      attendance: '98.5%',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 'STU-002',
      name: 'Sophia Martinez',
      rollNo: '1002',
      class: 'Grade 8-B',
      gender: 'Female',
      dob: '24 Aug 2012',
      guardian: 'Maria Martinez',
      phone: '+1 555-0184',
      email: 's.martinez@gmail.com',
      attendance: '96.2%',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 'STU-003',
      name: 'Liam Hemsworth',
      rollNo: '1003',
      class: 'Grade 12-C',
      gender: 'Male',
      dob: '15 Jan 2008',
      guardian: 'David Hemsworth',
      phone: '+1 555-0143',
      email: 'l.hemsworth@gmail.com',
      attendance: '92.0%',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 'STU-004',
      name: 'Emma Watson',
      rollNo: '1004',
      class: 'Grade 6-A',
      gender: 'Female',
      dob: '03 Nov 2014',
      guardian: 'John Watson',
      phone: '+1 555-0112',
      email: 'e.watson@gmail.com',
      attendance: '99.1%',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 'STU-005',
      name: 'Ethan Carter',
      rollNo: '1005',
      class: 'Grade 11-B',
      gender: 'Male',
      dob: '18 Jul 2009',
      guardian: 'Sarah Carter',
      phone: '+1 555-0177',
      email: 'e.carter@gmail.com',
      attendance: '94.8%',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    }
  ]);

  const handleEditClick = (student) => {
    setEditingStudent(student);
  };

  const handleSaveStudent = (formData) => {
    if (editingStudent) {
      // Update existing student
      setStudentsData((prev) =>
        prev.map((s) =>
          s.id === editingStudent.id
            ? {
                ...s,
                name: formData.fullName || s.name,
                rollNo: formData.rollNumber || s.rollNo,
                class: `${formData.studentClass} - ${formData.section}`,
                phone: formData.phone || s.phone,
                email: formData.email || s.email,
                guardian: formData.guardianName || formData.fatherName || s.guardian
              }
            : s
        )
      );
      setEditingStudent(null);
    } else {
      // Create new student
      const newStudentObj = {
        id: `STU-00${studentsData.length + 1}`,
        name: formData.fullName || 'New Student',
        rollNo: formData.rollNumber || `100${studentsData.length + 1}`,
        class: `${formData.studentClass} - ${formData.section}`,
        gender: formData.gender || 'Male',
        dob: formData.dob || '01 Jan 2012',
        guardian: formData.guardianName || formData.fatherName || 'Parent',
        phone: formData.phone || '+1 555-0000',
        email: formData.email || 'student@school.edu',
        attendance: '100.0%',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
      };

      setStudentsData([newStudentObj, ...studentsData]);
      setShowAddForm(false);
    }
  };

  const handleDeleteStudent = (id) => {
    setStudentsData((prev) => prev.filter((s) => s.id !== id));
  };

  if (showAddForm || editingStudent) {
    return (
      <AddStudentForm
        isEditMode={Boolean(editingStudent)}
        initialData={editingStudent}
        onBack={() => {
          setShowAddForm(false);
          setEditingStudent(null);
        }}
        onSaveStudent={handleSaveStudent}
      />
    );
  }

  const filteredStudents = studentsData.filter(
    (stu) =>
      (selectedClass === 'All' || stu.class.includes(selectedClass)) &&
      (stu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stu.rollNo.includes(searchTerm) ||
        stu.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div
        className="card animate-fade-in"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Student Directory & Management</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Manage student profiles, class enrollments, roll numbers, and attendance records
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
          style={{ padding: '10px 18px', fontSize: '0.875rem' }}
        >
          <Plus size={18} /> Add New Student
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card animate-fade-in" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by student name, roll no, or ID..."
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

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-app)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            outline: 'none',
            fontWeight: 600
          }}
        >
          <option value="All">All Classes & Grades</option>
          <option value="Primary">Primary</option>
          <option value="Grade 6">Grade 6</option>
          <option value="Grade 8">Grade 8</option>
          <option value="Grade 10">Grade 10</option>
          <option value="Grade 11">Grade 11</option>
          <option value="Grade 12">Grade 12</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Student</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Roll No / ID</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Class & Grade</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Guardian & Contact</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Attendance %</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={s.avatar} alt={s.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.gender} | DOB: {s.dob}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{s.rollNo}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.id}</div>
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: 600 }}>{s.class}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 600 }}>{s.guardian}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} /> {s.phone}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                      {s.attendance}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className="badge badge-success">{s.status}</span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        className="btn-icon"
                        onClick={() => handleEditClick(s)}
                        style={{ width: '32px', height: '32px' }}
                        title="Edit Student"
                      >
                        <Edit size={16} color="var(--accent-primary)" />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDeleteStudent(s.id)}
                        style={{ width: '32px', height: '32px', color: '#ef4444' }}
                        title="Delete Student"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
