import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Plus,
  Search,
  Download,
  MoreVertical,
  X,
  Edit,
  Trash2,
  Eye,
  Printer,
  ChevronDown,
  Award,
  UploadCloud,
  Star
} from 'lucide-react';
import { certificateService } from '../../services/certificateService';
import { classService } from '../../services/classService';
import { studentService } from '../../services/studentService';
import { useApiAction } from '../../hooks/useApiAction';
import { Spinner } from '../ui/Spinner';

export const CertificateModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const { busyKey, runAction } = useApiAction();

  // Certificates loaded from backend
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchCertificates = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await certificateService.list();
      const items = (Array.isArray(result) ? result : []).map((c, i) => ({
        ...c,
        sl: String(i + 1).padStart(2, '0')
      }));
      setCertificates(items);
    } catch (e) {
      setError(e.message || 'Failed to load certificates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  // Classes, Sections, Students loaded from backend APIs
  const [classesList, setClassesList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);

  // Fetch Classes, Sections, and Students from APIs
  const fetchDropdownData = useCallback(async () => {
    setIsLoadingDropdowns(true);
    try {
      const [classRes, secRes, studRes] = await Promise.all([
        classService.classes.list().catch(() => []),
        classService.sections.list().catch(() => []),
        studentService.list({ page: 0, size: 500 }).catch(() => [])
      ]);

      const cls = Array.isArray(classRes) ? classRes : (classRes?.data || []);
      const secs = Array.isArray(secRes) ? secRes : (secRes?.data || []);
      const studs = Array.isArray(studRes) ? studRes : (studRes?.content || studRes?.data || []);

      setClassesList(cls);
      setSectionsList(secs);
      setStudentsList(studs);
    } catch (err) {
      console.warn('Failed to fetch class/section/student API data:', err);
    } finally {
      setIsLoadingDropdowns(false);
    }
  }, []);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  // Drawer Modal State (Add / Edit)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    certificateName: '',
    className: '',
    section: '',
    studentName: '',
    studentId: '',
    rollNo: '',
    avatar: '',
    date: '15/05/2025',
    footerLeftText: '',
    footerRightText: ''
  });

  // Dynamic Unique Classes from Class API (exact same data as Classes list)
  const availableClasses = useMemo(() => {
    const list = [];
    const seen = new Set();
    classesList.forEach((c) => {
      const name = c.name?.trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        list.push({ id: c.id, name });
      }
    });
    return list;
  }, [classesList]);

  // Dynamic Unique Sections from Section API (exact same data as Section list)
  const availableSections = useMemo(() => {
    const list = [];
    const seen = new Set();
    sectionsList.forEach((s) => {
      const name = s.name?.trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        list.push({ id: s.id, name });
      }
    });
    return list;
  }, [sectionsList]);

  // Dynamic Students filtered by selected Class and Section
  const filteredStudents = useMemo(() => {
    return studentsList.filter((s) => {
      if (formData.className && formData.className !== 'Select Class') {
        const studentClass = (s.className || '').trim().toLowerCase();
        const selectedClass = formData.className.trim().toLowerCase();
        if (studentClass !== selectedClass && !studentClass.includes(selectedClass) && !selectedClass.includes(studentClass)) {
          return false;
        }
      }
      if (formData.section && formData.section !== 'Select Section') {
        const studentSec = (s.section || '').trim().toLowerCase();
        const selectedSec = formData.section.trim().toLowerCase();
        if (studentSec && studentSec !== selectedSec && !selectedSec.includes(studentSec) && !studentSec.includes(selectedSec)) {
          return false;
        }
      }
      return true;
    });
  }, [studentsList, formData.className, formData.section]);

  const handleClassChange = (selectedClass) => {
    setFormData((prev) => {
      const isSelectDefault = !selectedClass || selectedClass === 'Select Class';
      const studentStillValid = !prev.studentName || isSelectDefault || studentsList.some(
        (s) => (s.name === prev.studentName || String(s.id) === String(prev.studentId)) &&
               (s.className || '').toLowerCase().includes(selectedClass.toLowerCase())
      );
      return {
        ...prev,
        className: selectedClass,
        studentName: studentStillValid ? prev.studentName : '',
        studentId: studentStillValid ? prev.studentId : ''
      };
    });
  };

  const handleSectionChange = (selectedSection) => {
    setFormData((prev) => ({
      ...prev,
      section: selectedSection
    }));
  };

  const handleStudentChange = (studentIdentifier) => {
    if (!studentIdentifier || studentIdentifier === 'Select Student') {
      setFormData((prev) => ({
        ...prev,
        studentName: '',
        studentId: '',
        rollNo: '',
        avatar: ''
      }));
      return;
    }

    const selected = studentsList.find(
      (s) => String(s.id) === String(studentIdentifier) || s.name === studentIdentifier
    );

    if (selected) {
      setFormData((prev) => ({
        ...prev,
        studentId: selected.id,
        studentName: selected.name,
        rollNo: selected.rollNo || prev.rollNo || '',
        avatar: selected.avatar || selected.studentPhoto || prev.avatar || '',
        className: (!prev.className || prev.className === 'Select Class') ? (selected.className || prev.className) : prev.className,
        section: (!prev.section || prev.section === 'Select Section') ? (selected.section || prev.section) : prev.section
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        studentName: studentIdentifier
      }));
    }
  };

  // Preview Modal State (View Certificate - Screenshot 3)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingCertificate, setViewingCertificate] = useState(null);

  // Open Add Drawer Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    const todayFormatted = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    setFormData({
      certificateName: '',
      className: '',
      section: '',
      studentName: '',
      studentId: '',
      rollNo: '',
      avatar: '',
      date: todayFormatted,
      footerLeftText: 'Arthur Vance (Principal)',
      footerRightText: 'Sarah Jenkins (Class Teacher)'
    });
    setError('');
    setIsDrawerOpen(true);
  };

  // Open Edit Drawer Modal
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setActiveDropdownId(null);
    setFormData({
      certificateName: item.certificateName || '',
      className: item.className || '',
      section: item.section || '',
      studentName: item.name || '',
      studentId: item.studentId || '',
      rollNo: item.rollNo || '',
      avatar: item.avatar || '',
      date: item.date || '15/05/2025',
      footerLeftText: item.footerLeft || '',
      footerRightText: item.footerRight || ''
    });
    setError('');
    setIsDrawerOpen(true);
  };

  // Open View Certificate Preview Modal (Screenshot 3)
  const handleOpenViewModal = (item) => {
    setViewingCertificate(item);
    setActiveDropdownId(null);
    setIsViewModalOpen(true);
  };

  // Trigger Print for Row
  const handlePrintCertificateRow = (item) => {
    setActiveDropdownId(null);
    setViewingCertificate(item);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Delete Certificate Row
  const handleDeleteCertificate = async (id) => {
    setActiveDropdownId(null);
    try {
      await certificateService.remove(id);
      setCertificates((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      setError(e.message || 'Failed to delete certificate');
    }
  };

  // Save Drawer Form
  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!formData.certificateName || !formData.certificateName.trim()) {
      setError('Certificate name is required');
      return;
    }
    if (!formData.studentName || formData.studentName === 'Select Student') {
      setError('Please select a student');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const matchedStudent = studentsList.find(
        (s) => String(s.id) === String(formData.studentId) || s.name === formData.studentName
      );

      const studentName = formData.studentName || matchedStudent?.name || 'Student';
      const studentRollNo = formData.rollNo || matchedStudent?.rollNo || '1';
      const studentClass = formData.className && formData.className !== 'Select Class'
        ? (formData.section && formData.section !== 'Select Section' ? `${formData.className} (${formData.section})` : formData.className)
        : (matchedStudent?.className || 'Class 1');
      const studentAvatar = formData.avatar || matchedStudent?.avatar || matchedStudent?.studentPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';

      if (editingItem) {
        const updated = await certificateService.update(editingItem.id, {
          ...editingItem,
          certificateName: formData.certificateName.trim(),
          className: studentClass,
          name: studentName,
          rollNo: studentRollNo,
          avatar: studentAvatar,
          date: formData.date || editingItem.date,
          footerLeft: formData.footerLeftText || editingItem.footerLeft,
          footerRight: formData.footerRightText || editingItem.footerRight
        });
        setCertificates((prev) => prev.map((c) => (c.id === editingItem.id ? { ...c, ...updated } : c)));
        setEditingItem(null);
      } else {
        const created = await certificateService.create({
          name: studentName,
          rollNo: studentRollNo,
          className: studentClass,
          certificateName: formData.certificateName.trim(),
          bgImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=120&q=80',
          avatar: studentAvatar,
          date: formData.date || new Date().toLocaleDateString('en-GB'),
          footerLeft: formData.footerLeftText || 'Principal Signature',
          footerRight: formData.footerRightText || 'Class Teacher Signature'
        });
        setCertificates((prev) => [
          {
            ...created,
            sl: String(prev.length + 1).padStart(2, '0')
          },
          ...prev
        ]);
      }
      setIsDrawerOpen(false);
    } catch (e) {
      setError(e.message || 'Failed to save certificate');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === certificates.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(certificates.map((item) => item.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      {/* Top Header Card (Screenshot 1) */}
      <div
        className="card animate-fade-in"
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Certificate</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Dashboard / Certificate</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleOpenAddModal}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0d9488',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={18} /> + Add Certificate
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

      {isLoading && !certificates.length && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading certificates...
        </div>
      )}

      {/* Main Table Card (Screenshot 1) */}
      <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
        {/* Controls Toolbar Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} /> Export <ChevronDown size={14} />
            </button>

            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 14px 8px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Data Table View */}
        <div style={{ overflowX: 'visible', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 16px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.length === certificates.length}
                    onChange={toggleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    S.L <span>▲</span>
                  </div>
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Class</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Certificate Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Background Image</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {certificates
                .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.certificateName.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => toggleSelectRow(row.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--text-secondary)' }}>{row.sl}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={row.avatar} alt={row.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Roll No: {row.rollNo}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>{row.className}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{row.certificateName}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '6px',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'center'
                        }}
                      >
                        <Award size={20} color="#0d9488" />
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                      <CertificateActionDropdownCell
                        isOpen={activeDropdownId === row.id}
                        onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                        onView={() => handleOpenViewModal(row)}
                        onPrint={() => handlePrintCertificateRow(row)}
                        onEdit={() => handleOpenEditModal(row)}
                        onDelete={() => runAction(`delete-${row.id}`, () => handleDeleteCertificate(row.id))}
                        deleteBusy={busyKey === `delete-${row.id}`}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Certificate Right Slide-over Drawer Modal (Screenshot 2) */}
      {isDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            justify: 'flex-end',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '560px',
              maxWidth: '90vw',
              height: '100vh',
              backgroundColor: 'var(--bg-card)',
              boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              zIndex: 1001,
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingItem ? 'Edit Certificate' : 'Add New Certificate'}
              </h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body (Screenshot 2) */}
            <form onSubmit={handleSaveForm} id="certificate-form" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Certificate Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter certificate name"
                    value={formData.certificateName}
                    onChange={(e) => setFormData({ ...formData, certificateName: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Class
                  </label>
                  <select
                    value={formData.className}
                    onChange={(e) => handleClassChange(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select Class {isLoadingDropdowns ? '(Loading...)' : ''}</option>
                    {availableClasses.map((cls) => (
                      <option key={cls.id || cls.name} value={cls.name}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Section
                  </label>
                  <select
                    value={formData.section}
                    onChange={(e) => handleSectionChange(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select Section {isLoadingDropdowns ? '(Loading...)' : ''}</option>
                    {availableSections.map((sec) => (
                      <option key={sec.id || sec.name} value={sec.name}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Student <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formData.studentId || formData.studentName}
                    onChange={(e) => handleStudentChange(e.target.value)}
                    style={inputStyle}
                    required
                  >
                    <option value="">
                      {isLoadingDropdowns
                        ? 'Loading students from API...'
                        : filteredStudents.length > 0
                        ? `Select Student (${filteredStudents.length} available)`
                        : studentsList.length > 0
                        ? `Select from ${studentsList.length} total students`
                        : 'Select Student (0 available)'}
                    </option>
                    {(filteredStudents.length > 0 ? filteredStudents : studentsList).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.rollNo ? `(Roll: ${s.rollNo})` : ''} {s.className ? `[${s.className}${s.section ? ` - ${s.section}` : ''}]` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Date
                  </label>
                  <input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Footer Left Text
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Footer Left Text"
                    value={formData.footerLeftText}
                    onChange={(e) => setFormData({ ...formData, footerLeftText: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Footer Right Text
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Footer Right Text"
                    value={formData.footerRightText}
                    onChange={(e) => setFormData({ ...formData, footerRightText: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Student Photo
                  </label>
                  <label
                    style={{
                      border: '1.5px dashed var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      backgroundColor: 'var(--bg-app)',
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      minHeight: '42px'
                    }}
                  >
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Student"
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <UploadCloud size={18} />
                    )}
                    <span>{formData.avatar ? 'Change photo' : 'Upload student photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (uploadEvent) => {
                            setFormData((prev) => ({ ...prev, avatar: uploadEvent.target.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </form>

            {/* Footer Buttons */}
            <div
              style={{
                padding: '20px 24px',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                justify: 'center',
                gap: '16px'
              }}
            >
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="btn btn-secondary"
                style={{
                  padding: '10px 32px',
                  color: '#ef4444',
                  borderColor: '#ef4444',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                form="certificate-form"
                className="btn btn-primary"
                disabled={isSaving}
                style={{
                  padding: '10px 36px',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                {isSaving ? <Spinner size={16} color="#ffffff" /> : null} {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Certificate Preview Modal (Screenshot 3) */}
      {isViewModalOpen && viewingCertificate && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            padding: '20px'
          }}
          onClick={() => setIsViewModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '640px',
              maxWidth: '95vw',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              padding: '40px 36px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
              border: '10px solid #fef3c7',
              outline: '2px solid #f59e0b',
              animation: 'fadeIn 0.25s ease'
            }}
          >
            {/* Close X Button */}
            <button
              onClick={() => setIsViewModalOpen(false)}
              style={{
                position: 'absolute',
                top: '-16px',
                right: '-16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
              }}
            >
              <X size={18} />
            </button>

            {/* Gold Wreath Graphic Icon (Screenshot 3) */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '8px', color: '#f59e0b' }}>
              <Star size={14} fill="#f59e0b" />
              <Star size={18} fill="#f59e0b" />
              <Award size={36} color="#d97706" />
              <Star size={18} fill="#f59e0b" />
              <Star size={14} fill="#f59e0b" />
            </div>

            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
              EduDash Academy
            </div>

            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e3a8a', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
              {viewingCertificate.certificateName ? viewingCertificate.certificateName.toUpperCase() : 'CERTIFICATE OF EXCELLENCE'}
            </h1>

            <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#64748b', marginBottom: '16px' }}>
              is hereby granted to:
            </div>

            {/* Student Name */}
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', fontFamily: 'serif', borderBottom: '2px dashed #cbd5e1', paddingBottom: '6px', marginBottom: '16px', width: '80%' }}>
              {viewingCertificate.name}
            </h2>

            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '24px', lineHeight: 1.5, maxWidth: '480px' }}>
              for outstanding academic performance, exemplary conduct, and active participation in <strong>{viewingCertificate.className}</strong>.
            </p>

            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '32px' }}>
              Date: {viewingCertificate.date || '15 May 2025'}
            </div>

            {/* Certificate Footer Signatures (Screenshot 3) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'cursive', fontSize: '1rem', color: '#1e293b', marginBottom: '2px' }}>Arthur Vance</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', borderTop: '1px solid #94a3b8', paddingTop: '4px' }}>
                  {viewingCertificate.footerLeft || 'Principal Signature'}
                </div>
              </div>

              {/* Medal Emblem in Center */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#fef3c7',
                  border: '2px solid #f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center'
                }}
              >
                <Award size={24} color="#d97706" />
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'cursive', fontSize: '1rem', color: '#1e293b', marginBottom: '2px' }}>Sarah Jenkins</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', borderTop: '1px solid #94a3b8', paddingTop: '4px' }}>
                  {viewingCertificate.footerRight || 'Class Teacher Signature'}
                </div>
              </div>
            </div>

            {/* Print Action Button */}
            <button
              className="btn btn-primary"
              onClick={() => window.print()}
              style={{
                marginTop: '24px',
                padding: '10px 24px',
                backgroundColor: '#0d9488',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Printer size={16} /> Print Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Certificate Action Dropdown Cell with View, Print, Edit, and Delete options (User prompt)
const CertificateActionDropdownCell = ({ isOpen, onToggle, onView, onPrint, onEdit, onDelete, deleteBusy }) => {
  return (
    <div style={{ display: 'inline-flex', position: 'relative' }}>
      <button className="btn-icon" onClick={onToggle} style={{ width: '32px', height: '32px' }}>
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '36px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            border: '1px solid var(--border-color)',
            zIndex: 100,
            minWidth: '140px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <button
            onClick={onView}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              textAlign: 'left'
            }}
          >
            <Eye size={14} color="#0d9488" /> View
          </button>

          <button
            onClick={onPrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              textAlign: 'left',
              borderTop: '1px solid var(--border-light)'
            }}
          >
            <Printer size={14} color="#0284c7" /> Print
          </button>

          <button
            onClick={onEdit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              textAlign: 'left',
              borderTop: '1px solid var(--border-light)'
            }}
          >
            <Edit size={14} color="#2563eb" /> Edit
          </button>

          <button
            onClick={onDelete}
            disabled={deleteBusy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              textAlign: 'left',
              borderTop: '1px solid var(--border-light)'
            }}
          >
            {deleteBusy ? <Spinner size={16} color="#ef4444" /> : <Trash2 size={14} />} {deleteBusy ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-app)',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  fontFamily: 'var(--font-sans)'
};
