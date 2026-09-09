import React, { useState } from 'react';
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

export const CertificateModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Default Certificates List (Screenshot 1)
  const [certificates, setCertificates] = useState([
    {
      id: 1,
      sl: '01',
      name: 'Marvin McKinney',
      rollNo: '12',
      className: 'Class 1 (A)',
      certificateName: 'Transfer Certificate',
      bgImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=120&q=80',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      date: '15 May 2025',
      footerLeft: 'Principal Signature',
      footerRight: 'Class Teacher Signature'
    },
    {
      id: 2,
      sl: '02',
      name: 'Kathryn Murphy',
      rollNo: '18',
      className: 'Class 2 (B)',
      certificateName: 'Character Certificate',
      bgImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=120&q=80',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      date: '16 May 2025',
      footerLeft: 'Principal Signature',
      footerRight: 'Headmaster Signature'
    },
    {
      id: 3,
      sl: '03',
      name: 'Devon Lane',
      rollNo: '21',
      className: 'Class 3 (A)',
      certificateName: 'Sports Achievement Certificate',
      bgImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=120&q=80',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      date: '18 May 2025',
      footerLeft: 'Sports Director',
      footerRight: 'Principal Signature'
    },
    {
      id: 4,
      sl: '04',
      name: 'Cody Fisher',
      rollNo: '9',
      className: 'Class 4 (C)',
      certificateName: 'Merit Certificate',
      bgImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=120&q=80',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
      date: '20 May 2025',
      footerLeft: 'Academic Dean',
      footerRight: 'Principal Signature'
    },
    {
      id: 5,
      sl: '05',
      name: 'Theresa Webb',
      rollNo: '15',
      className: 'Class 5 (B)',
      certificateName: 'Attendance Certificate',
      bgImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=120&q=80',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
      date: '22 May 2025',
      footerLeft: 'Class Teacher',
      footerRight: 'Principal Signature'
    },
    {
      id: 6,
      sl: '06',
      name: 'Darrell Steward',
      rollNo: '5',
      className: 'Class 6 (A)',
      certificateName: 'Scholarship Certificate',
      bgImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=120&q=80',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      date: '25 May 2025',
      footerLeft: 'Board Committee',
      footerRight: 'Principal Signature'
    }
  ]);

  // Drawer Modal State (Add / Edit)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    certificateName: '',
    className: 'Select Class',
    section: 'Select Section',
    studentName: 'Select Student',
    date: '15/05/2025',
    footerLeftText: '',
    footerRightText: ''
  });

  // Preview Modal State (View Certificate - Screenshot 3)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingCertificate, setViewingCertificate] = useState(null);

  // Open Add Drawer Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      certificateName: '',
      className: 'Select Class',
      section: 'Select Section',
      studentName: 'Select Student',
      date: '15/05/2025',
      footerLeftText: '',
      footerRightText: ''
    });
    setIsDrawerOpen(true);
  };

  // Open Edit Drawer Modal
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setActiveDropdownId(null);
    setFormData({
      certificateName: item.certificateName,
      className: item.className || 'Class 1 (A)',
      section: 'Section A',
      studentName: item.name,
      date: item.date || '15/05/2025',
      footerLeftText: item.footerLeft || '',
      footerRightText: item.footerRight || ''
    });
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
  const handleDeleteCertificate = (id) => {
    setActiveDropdownId(null);
    setCertificates((prev) => prev.filter((c) => c.id !== id));
  };

  // Save Drawer Form
  const handleSaveForm = (e) => {
    e.preventDefault();
    if (editingItem) {
      setCertificates((prev) =>
        prev.map((c) =>
          c.id === editingItem.id
            ? {
                ...c,
                certificateName: formData.certificateName || c.certificateName,
                className: formData.className !== 'Select Class' ? formData.className : c.className,
                name: formData.studentName !== 'Select Student' ? formData.studentName : c.name,
                date: formData.date || c.date,
                footerLeft: formData.footerLeftText || c.footerLeft,
                footerRight: formData.footerRightText || c.footerRight
              }
            : c
        )
      );
    } else {
      const newCert = {
        id: Date.now(),
        sl: `${certificates.length + 1 < 10 ? '0' : ''}${certificates.length + 1}`,
        name: formData.studentName !== 'Select Student' ? formData.studentName : 'New Student',
        rollNo: '10',
        className: formData.className !== 'Select Class' ? formData.className : 'Class 1 (A)',
        certificateName: formData.certificateName || 'Excellence Certificate',
        bgImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=120&q=80',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
        date: formData.date || '15 May 2025',
        footerLeft: formData.footerLeftText || 'Principal Signature',
        footerRight: formData.footerRightText || 'Class Teacher'
      };
      setCertificates([newCert, ...certificates]);
    }
    setIsDrawerOpen(false);
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
                        onDelete={() => handleDeleteCertificate(row.id)}
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
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Select Class">Select Class</option>
                    <option value="Class 1 (A)">Class 1 (A)</option>
                    <option value="Class 2 (B)">Class 2 (B)</option>
                    <option value="Class 3 (A)">Class 3 (A)</option>
                    <option value="Class 4 (C)">Class 4 (C)</option>
                    <option value="Class 5 (B)">Class 5 (B)</option>
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
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Select Section">Select Section</option>
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                    <option value="Section C">Section C</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Student
                  </label>
                  <select
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Select Student">Select Student</option>
                    <option value="Marvin McKinney">Marvin McKinney</option>
                    <option value="Kathryn Murphy">Kathryn Murphy</option>
                    <option value="Devon Lane">Devon Lane</option>
                    <option value="Cody Fisher">Cody Fisher</option>
                    <option value="Theresa Webb">Theresa Webb</option>
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
                    Student Photo *
                  </label>
                  <div
                    style={{
                      border: '1.5px dashed var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      textAlign: 'center',
                      backgroundColor: 'var(--bg-app)',
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Darg & drop a file here or click
                  </div>
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
                style={{
                  padding: '10px 36px',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                Save
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
const CertificateActionDropdownCell = ({ isOpen, onToggle, onView, onPrint, onEdit, onDelete }) => {
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
            <Trash2 size={14} /> Delete
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
