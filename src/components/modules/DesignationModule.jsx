import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Download,
  Trash2,
  Edit,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Tag,
  Users,
  ShieldCheck,
  Building2,
  Layers
} from 'lucide-react';
import { designationService } from '../../services/designationService';
import { useApiAction } from '../../hooks/useApiAction';
import { Spinner } from '../ui/Spinner';

export const DesignationModule = ({ hideHeader = false, openAddTrigger = 0, onDataChange }) => {
  const [designations, setDesignations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Table & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  // Details Modal State (Details API Integration)
  const [viewingDesignation, setViewingDesignation] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const { busyKey, runAction } = useApiAction();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Teaching',
    description: '',
    status: 'Active'
  });

  // Flash message timer
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch all designations from backend API
  const fetchDesignations = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await designationService.list();
      const list = Array.isArray(data) ? data : [];
      setDesignations(list.map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })));
    } catch (e) {
      setError(e.message || 'Failed to load designations from server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDesignations();
  }, [fetchDesignations]);

  // Open add modal on external trigger
  useEffect(() => {
    if (openAddTrigger > 0) {
      handleOpenAddModal();
    }
  }, [openAddTrigger]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setError('');
    setFormData({
      name: '',
      code: '',
      category: 'Teaching',
      description: '',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setActiveDropdownId(null);
    setError('');
    setFormData({
      name: item.name || '',
      code: item.code || '',
      category: item.category || 'Teaching',
      description: item.description || '',
      status: item.status || 'Active'
    });
    setIsModalOpen(true);
  };

  // Open Details Modal (Calls Details API: GET /api/designations/{id})
  const handleOpenDetailsModal = async (item) => {
    setActiveDropdownId(null);
    setViewingDesignation(item);
    setIsDetailsLoading(true);
    try {
      const detailed = await designationService.get(item.id);
      if (detailed) {
        setViewingDesignation(detailed);
      }
    } catch (e) {
      console.warn('Fallback to cached designation details:', e);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  // Delete Single Item (Calls Delete API: DELETE /api/designations/{id})
  const handleDeleteItem = async (id) => {
    setActiveDropdownId(null);
    try {
      await designationService.remove(id);
      setDesignations((prev) => prev.filter((d) => d.id !== id).map((d, i) => ({ ...d, sl: String(i + 1).padStart(2, '0') })));
      setSuccessMessage('Designation deleted successfully!');
      if (onDataChange) onDataChange();
    } catch (e) {
      setError(e.message || 'Failed to delete designation');
    }
  };

  // Bulk Delete Selected
  const handleBulkDelete = async () => {
    if (!selectedRows.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} selected designation(s)?`)) return;

    try {
      setIsLoading(true);
      for (const id of selectedRows) {
        await designationService.remove(id);
      }
      setSelectedRows([]);
      setSuccessMessage(`${selectedRows.length} designation(s) deleted successfully!`);
      await fetchDesignations();
    } catch (e) {
      setError(e.message || 'Failed to delete selected designations');
    } finally {
      setIsLoading(false);
    }
  };

  // Save Modal (Calls Add or Update API)
  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    setError('');

    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      category: formData.category,
      description: formData.description.trim(),
      status: formData.status
    };

    try {
      if (editingItem) {
        // Update API
        const updated = await designationService.update(editingItem.id, payload);
        setDesignations((prev) => prev.map((d) => (d.id === editingItem.id ? { ...d, ...updated } : d)));
        setSuccessMessage('Designation updated successfully!');
      } else {
        // Add API
        const created = await designationService.create(payload);
        setDesignations((prev) => [{ ...created, sl: '01' }, ...prev.map((d, i) => ({ ...d, sl: String(i + 2).padStart(2, '0') }))]);
        setSuccessMessage('Designation created successfully!');
      }
      if (onDataChange) onDataChange();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (e) {
      setError(e.message || 'Failed to save designation. Please check your inputs.');
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['S.L', 'Designation Name', 'Code', 'Category', 'Description', 'Status'];
    const rows = filteredItems.map((d, idx) => [
      idx + 1,
      d.name,
      d.code || 'N/A',
      d.category || 'N/A',
      d.description || '',
      d.status || 'Active'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((c) => `"${String(c || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'school_designations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Items
  const filteredItems = designations.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (item.name || '').toLowerCase().includes(q) ||
      (item.code || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q);

    const matchesCategory = categoryFilter === 'ALL' || (item.category || '').toLowerCase() === categoryFilter.toLowerCase();
    const matchesStatus = statusFilter === 'ALL' || (item.status || '').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / rowsPerPage));
  const paginatedItems = filteredItems.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedItems.length && paginatedItems.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedItems.map((d) => d.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]));
  };

  // Summary Metrics
  const activeCount = designations.filter((d) => (d.status || '').toLowerCase() === 'active').length;
  const teachingCount = designations.filter((d) => (d.category || '').toLowerCase().includes('teach')).length;
  const adminCount = designations.filter((d) => (d.category || '').toLowerCase().includes('admin')).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      {/* Top Header Card */}
      {!hideHeader && (
        <div
          className="card animate-fade-in"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            padding: '18px 24px'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Briefcase size={24} color="#0d9488" /> Staff & Faculty Designations
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0 }}>
              Dashboard / Staff & HRM / Designation Management
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              id="add-designation-btn"
              className="btn btn-primary"
              onClick={handleOpenAddModal}
              style={{
                padding: '9px 18px',
                backgroundColor: '#0d9488',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)'
              }}
            >
              <Plus size={18} /> + Add Designation
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Designations</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{designations.length}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Status</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>{activeCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Academic & Teaching</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{teachingCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Administrative Staff</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{adminCount}</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            color: '#15803d',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle size={18} /> {successMessage}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-bg, #fee2e2)',
            border: '1px solid #fca5a5',
            color: '#dc2626',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Main Table Card */}
      <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
        {/* Controls Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {hideHeader && (
              <button
                className="btn btn-primary"
                onClick={handleOpenAddModal}
                style={{
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Plus size={15} /> Add Designation
              </button>
            )}

            <button
              className="btn btn-secondary"
              onClick={handleExportCSV}
              style={{
                padding: '8px 14px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Download size={14} /> Export CSV
            </button>

            {selectedRows.length > 0 && (
              <button
                onClick={handleBulkDelete}
                style={{
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <Trash2 size={14} /> Delete Selected ({selectedRows.length})
              </button>
            )}

            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by name, code, role..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
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

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Categories</option>
              <option value="Teaching">Teaching & Faculty</option>
              <option value="Administration">Administration</option>
              <option value="Support">Support & Technical</option>
              <option value="Finance">Finance & Accounts</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>Showing {filteredItems.length} records</span>
            <span>Rows:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 16px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={paginatedItems.length > 0 && selectedRows.length === paginatedItems.length}
                    onChange={toggleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 600, width: '70px' }}>S.L</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Designation Title</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Code</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Description</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, width: '120px' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center', width: '90px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    <Spinner size={24} color="#0d9488" />
                    <div style={{ marginTop: '8px' }}>Loading designations from server...</div>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No designations found. Click <strong>+ Add Designation</strong> to create one!
                  </td>
                </tr>
              ) : (
                paginatedItems.map((row, idx) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      backgroundColor: selectedRows.includes(row.id) ? 'var(--bg-app)' : 'transparent',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => toggleSelectRow(row.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      {String((currentPage - 1) * rowsPerPage + idx + 1).padStart(2, '0')}
                    </td>

                    {/* Designation Title & click to details */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: '#ccfbf1',
                            color: '#0d9488',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem'
                          }}
                        >
                          <Briefcase size={18} />
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                            onClick={() => handleOpenDetailsModal(row)}
                            title="Click to view details"
                          >
                            {row.name}
                            <span style={{ fontSize: '0.75rem', color: '#0d9488' }}>🔍</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            ID: #{row.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Code */}
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-app)',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          letterSpacing: '0.5px',
                          color: '#0d9488'
                        }}
                      >
                        {row.code || '—'}
                      </span>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '14px 16px' }}>
                      <CategoryBadge category={row.category} />
                    </td>

                    {/* Description */}
                    <td
                      style={{
                        padding: '14px 16px',
                        color: 'var(--text-secondary)',
                        maxWidth: '280px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={row.description}
                    >
                      {row.description || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={row.status} />
                    </td>

                    {/* Action menu */}
                    <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                      <ActionDropdownCell
                        row={row}
                        busyKey={busyKey}
                        isOpen={activeDropdownId === row.id}
                        onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                        onViewDetails={() => handleOpenDetailsModal(row)}
                        onEdit={() => handleOpenEditModal(row)}
                        onDelete={() => runAction(`delete-${row.id}`, () => handleDeleteItem(row.id))}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  border: currentPage === i + 1 ? 'none' : '1px solid var(--border-color)',
                  backgroundColor: currentPage === i + 1 ? '#0d9488' : 'var(--bg-app)',
                  color: currentPage === i + 1 ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: currentPage === i + 1 ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Slide-over Drawer for Add/Edit Designation */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '480px',
              maxWidth: '92vw',
              height: '100vh',
              backgroundColor: 'var(--bg-card)',
              boxShadow: '-8px 0 28px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 1001,
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {editingItem ? 'Edit Designation' : 'Add New Designation'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  Define position title, identification code and staff category
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form
              onSubmit={handleSaveModal}
              id="designation-form"
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}
            >
              {error && (
                <div style={{ padding: '10px 14px', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '0.825rem', fontWeight: 600 }}>
                  {error}
                </div>
              )}

              {/* Designation Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Designation Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Teacher, Principal, Lab Assistant"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle}
                  required
                />

                {/* Quick Presets */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Presets:</span>
                  {[
                    { name: 'Principal', code: 'PRIN', cat: 'Administration' },
                    { name: 'Vice Principal', code: 'VP', cat: 'Administration' },
                    { name: 'Head of Department (HOD)', code: 'HOD', cat: 'Teaching' },
                    { name: 'Senior Teacher (PGT)', code: 'PGT', cat: 'Teaching' },
                    { name: 'Trained Teacher (TGT)', code: 'TGT', cat: 'Teaching' },
                    { name: 'Primary Teacher (PRT)', code: 'PRT', cat: 'Teaching' },
                    { name: 'Librarian', code: 'LIB', cat: 'Support' },
                    { name: 'Senior Accountant', code: 'ACC', cat: 'Finance' },
                    { name: 'Lab Assistant', code: 'LAB', cat: 'Support' }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, name: preset.name, code: preset.code, category: preset.cat })}
                      style={{
                        background: 'none',
                        border: '1px dashed var(--border-color)',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '0.72rem',
                        color: '#0d9488',
                        cursor: 'pointer'
                      }}
                    >
                      + {preset.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Designation Code <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. PRIN, PGT, TGT, HOD, ACC"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  style={inputStyle}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Short code identifier for HRM and payroll
                </span>
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Staff Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={inputStyle}
                >
                  <option value="Teaching">Teaching & Faculty</option>
                  <option value="Administration">Administration & Leadership</option>
                  <option value="Support">Support & Technical Staff</option>
                  <option value="Finance">Finance & Accounts</option>
                  <option value="Operations">Operations & Facilities</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Role Description & Scope
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Responsible for senior secondary curriculum delivery and student academic assessment."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Status */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={inputStyle}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </form>

            {/* Modal Footer */}
            <div
              style={{
                padding: '20px 24px',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px'
              }}
            >
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-secondary"
                style={{ padding: '10px 24px', fontWeight: 600, fontSize: '0.875rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="designation-form"
                className="btn btn-primary"
                disabled={isSaving}
                style={{
                  padding: '10px 28px',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isSaving ? <><Spinner size={16} color="#ffffff" /> Saving...</> : (editingItem ? 'Update' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal (Details API Integration) */}
      {viewingDesignation && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setViewingDesignation(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '560px',
              maxWidth: '95vw',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg, 14px)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'scaleUp 0.25s ease'
            }}
          >
            {/* Modal Header Banner */}
            <div
              style={{
                padding: '20px 24px',
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Briefcase size={26} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    {viewingDesignation.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.5px'
                      }}
                    >
                      CODE: {viewingDesignation.code || 'N/A'}
                    </span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                      Category: {viewingDesignation.category || 'Teaching'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingDesignation(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {isDetailsLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0d9488', fontSize: '0.85rem' }}>
                  <Spinner size={14} color="#0d9488" /> Syncing fresh designation details from API...
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Designation Code
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {viewingDesignation.code || 'N/A'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Category
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <CategoryBadge category={viewingDesignation.category} />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    System ID
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                    #{viewingDesignation.id}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Status
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <StatusBadge status={viewingDesignation.status} />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Created Date
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                    {viewingDesignation.createdAt ? new Date(viewingDesignation.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Last Updated
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                    {viewingDesignation.updatedAt ? new Date(viewingDesignation.updatedAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Role Description & Scope
                </div>
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    color: 'var(--text-primary)'
                  }}
                >
                  {viewingDesignation.description || 'No detailed description specified for this designation.'}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                backgroundColor: 'var(--bg-app)'
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setViewingDesignation(null)}
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const target = viewingDesignation;
                  setViewingDesignation(null);
                  handleOpenEditModal(target);
                }}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Edit size={14} /> Edit Designation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Category Badge
const CategoryBadge = ({ category }) => {
  const cat = (category || 'Teaching').toLowerCase();
  let bg = '#e0f2fe';
  let color = '#0284c7';

  if (cat.includes('teach')) {
    bg = '#fef3c7';
    color = '#b45309';
  } else if (cat.includes('admin')) {
    bg = '#f3e8ff';
    color = '#7e22ce';
  } else if (cat.includes('finance')) {
    bg = '#dcfce7';
    color = '#15803d';
  } else if (cat.includes('support')) {
    bg = '#e2e8f0';
    color = '#475569';
  }

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 700,
        backgroundColor: bg,
        color: color
      }}
    >
      {category || 'Teaching'}
    </span>
  );
};

// Status Badge
const StatusBadge = ({ status }) => {
  const isActive = (status || '').toLowerCase() === 'active';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 12px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 700,
        backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
        color: isActive ? '#15803d' : '#b91c1c'
      }}
    >
      {status || 'Active'}
    </span>
  );
};

// Action Dropdown Cell
const ActionDropdownCell = ({ isOpen, onToggle, onEdit, onDelete, onViewDetails, row, busyKey }) => {
  const isDeleting = busyKey === `delete-${row.id}`;
  const cellRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (cellRef.current && !cellRef.current.contains(e.target)) {
        onToggle();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div ref={cellRef} style={{ display: 'inline-flex', position: 'relative' }}>
      <button
        type="button"
        className="btn-icon"
        onClick={onToggle}
        style={{
          width: '32px',
          height: '32px',
          border: 'none',
          backgroundColor: isOpen ? 'var(--bg-app)' : 'transparent',
          cursor: 'pointer',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
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
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
            border: '1px solid var(--border-color)',
            zIndex: 100,
            minWidth: '130px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {onViewDetails && (
            <button
              type="button"
              onClick={onViewDetails}
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
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-app)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Eye size={14} color="#0284c7" /> Details
            </button>
          )}

          <button
            type="button"
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
              borderTop: onViewDetails ? '1px solid var(--border-light)' : 'none',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-app)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Edit size={14} color="#0d9488" /> Edit
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#ef4444',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              textAlign: 'left',
              borderTop: '1px solid var(--border-light)',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {isDeleting ? <Spinner size={14} color="#ef4444" /> : <Trash2 size={14} />} Delete
          </button>
        </div>
      )}
    </div>
  );
};

// Input style
const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-app)',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box'
};

export default DesignationModule;
