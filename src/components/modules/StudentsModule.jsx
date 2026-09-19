import React, { useState, useEffect, useCallback } from 'react';
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
import { studentService } from '../../services/studentService';
import { useApiAction } from '../../hooks/useApiAction';
import { Spinner } from '../ui/Spinner';

export const StudentsModule = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { busyKey, runAction } = useApiAction();

  const [studentsData, setStudentsData] = useState([]);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      let result;
      if (searchTerm.trim()) {
        result = await studentService.search(searchTerm.trim());
      } else if (selectedClass !== 'All') {
        result = await studentService.byClass(selectedClass);
      } else {
        result = await studentService.list({ page: 0, size: 200 });
      }

      const items = Array.isArray(result)
        ? result
        : result && Array.isArray(result.content)
        ? result.content
        : [];

      setStudentsData(items);
    } catch (e) {
      setError(e.message || 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedClass]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleEditClick = (student) => {
    setEditingStudent(student);
  };

  const handleSaveStudent = async (formData) => {
    setError('');
    if (editingStudent) {
      try {
        const updated = await studentService.update(editingStudent.id, formData);
        setStudentsData((prev) =>
          prev.map((s) => (s.id === editingStudent.id ? { ...s, ...updated } : s))
        );
        setEditingStudent(null);
        await fetchStudents();
      } catch (e) {
        setError(e.message || 'Failed to update student');
      }
    } else {
      try {
        const created = await studentService.create({
          ...formData,
          admissionNo: formData.admissionNo || `ADM-${Date.now()}`
        });
        setStudentsData((prev) => [created, ...prev]);
        setShowAddForm(false);
        await fetchStudents();
      } catch (e) {
        setError(e.message || 'Failed to create student');
      }
    }
  };

  const handleDeleteStudent = async (id) => {
    setError('');
    try {
      await studentService.remove(id);
      setStudentsData((prev) => prev.filter((s) => s.id !== id && String(s.id) !== String(id)));
    } catch (e) {
      setError(e.message || 'Failed to delete student');
    }
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
      (selectedClass === 'All' || (stu.className || stu.class || '').includes(selectedClass)) &&
      ((stu.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (stu.rollNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(stu.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (stu.admissionNo || '').toLowerCase().includes(searchTerm.toLowerCase()))
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
            placeholder="Search by student name, roll no, or admission no..."
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

      {isLoading && !studentsData.length && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <Spinner size={24} color="var(--accent-primary)" />
          <div style={{ marginTop: '12px' }}>Loading students from backend...</div>
        </div>
      )}

      {!isLoading && studentsData.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          No students found. Click "Add New Student" to create your first student record!
        </div>
      )}

      {/* Students Table */}
      {studentsData.length > 0 && (
        <div className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Student</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Roll No / Admission No</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Class & Section</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Guardian & Contact</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Attendance</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent-light, #e0f2fe)',
                            color: 'var(--accent-primary, #0284c7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            overflow: 'hidden'
                          }}
                        >
                          {s.avatar || s.studentPhoto ? (
                            <img src={s.avatar || s.studentPhoto} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            (s.name || 'S').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.name || s.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {s.gender || 'N/A'} {s.dob ? `| DOB: ${s.dob}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{s.rollNo || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.admissionNo || `ID: ${s.id}`}</div>
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 600 }}>
                      {s.class || s.className ? `${s.class || s.className} ${s.section ? `(${s.section})` : ''}` : 'Unassigned'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 600 }}>{s.guardian || s.guardianName || s.fatherName || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={12} /> {s.phone || s.guardianPhone || 'N/A'}
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className="badge badge-success" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        {s.attendance || (s.attendancePercentage ? `${s.attendancePercentage}%` : '95.0%')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className="badge badge-success">{s.status || 'Active'}</span>
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
                          onClick={() => runAction(`delete-${s.id}`, () => handleDeleteStudent(s.id))}
                          disabled={busyKey === `delete-${s.id}`}
                          style={{ width: '32px', height: '32px', color: '#ef4444' }}
                          title="Delete Student"
                        >
                          {busyKey === `delete-${s.id}` ? <Spinner size={16} color="#ef4444" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
