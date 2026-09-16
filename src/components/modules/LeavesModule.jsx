import React, { useState, useEffect, useCallback } from 'react';
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
  ChevronDown,
  Clock,
  CheckCircle,
  FileText
} from 'lucide-react';
import { leaveService } from '../../services/leaveService';
import { useApiAction } from '../../hooks/useApiAction';
import { Spinner } from '../ui/Spinner';

export const LeavesModule = () => {
  const { activeTab, setActiveTab } = useTheme();

  const getSubTabFromActiveTab = () => {
    if (activeTab === 'leaves-request') return 'request';
    return 'type';
  };

  const [currentSubTab, setCurrentSubTab] = useState(getSubTabFromActiveTab());
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const { busyKey, runAction } = useApiAction();

  // Modals state
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingTypeItem, setEditingTypeItem] = useState(null);
  const [typeFormData, setTypeFormData] = useState({
    name: '',
    status: 'Select Status'
  });

  const [isViewRequestModalOpen, setIsViewRequestModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestUpdateForm, setRequestUpdateForm] = useState({
    status: 'Approved',
    note: ''
  });

  useEffect(() => {
    setCurrentSubTab(getSubTabFromActiveTab());
    setActiveDropdownId(null);
  }, [activeTab]);

  // Leave data loaded from backend per active tab
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLeaves = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      if (currentSubTab === 'request') {
        const result = await leaveService.requests.list();
        const items = (Array.isArray(result) ? result : []).map((r, i) => ({
          ...r,
          sl: String(i + 1).padStart(2, '0'),
          icon: r.icon || '📄',
          note: r.note || ''
        }));
        setLeaveRequests(items);
      } else {
        const result = await leaveService.types.list();
        const items = (Array.isArray(result) ? result : []).map((t, i) => ({
          ...t,
          sl: String(i + 1).padStart(2, '0')
        }));
        setLeaveTypes(items);
      }
    } catch (e) {
      setError(e.message || 'Failed to load leave data');
    } finally {
      setIsLoading(false);
    }
  }, [currentSubTab]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleSubTabChange = (tabKey) => {
    setCurrentSubTab(tabKey);
    setActiveDropdownId(null);
    if (tabKey === 'type') setActiveTab('leaves-type');
    if (tabKey === 'request') setActiveTab('leaves-request');
  };

  // Leave Types Modal Handlers
  const handleOpenAddTypeModal = () => {
    setEditingTypeItem(null);
    setTypeFormData({ name: '', status: 'Select Status' });
    setIsTypeModalOpen(true);
  };

  const handleOpenEditTypeModal = (item) => {
    setEditingTypeItem(item);
    setActiveDropdownId(null);
    setTypeFormData({ name: item.name, status: item.status });
    setIsTypeModalOpen(true);
  };

  const handleDeleteLeaveType = async (id) => {
    setActiveDropdownId(null);
    try {
      await leaveService.types.remove(id);
      setLeaveTypes((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(e.message || 'Failed to delete leave type');
    }
  };

  const handleSaveTypeModal = async (e) => {
    e.preventDefault();
    try {
      if (editingTypeItem) {
        const updated = await leaveService.types.update(editingTypeItem.id, {
          ...editingTypeItem,
          name: typeFormData.name || editingTypeItem.name,
          status: typeFormData.status === 'Select Status' ? editingTypeItem.status : typeFormData.status
        });
        setLeaveTypes((prev) => prev.map((t) => (t.id === editingTypeItem.id ? { ...t, ...updated } : t)));
        setEditingTypeItem(null);
      } else {
        const created = await leaveService.types.create({
          name: typeFormData.name || 'New Leave Type',
          status: typeFormData.status === 'Select Status' ? 'Active' : typeFormData.status
        });
        setLeaveTypes((prev) => [
          {
            ...created,
            sl: String(prev.length + 1).padStart(2, '0')
          },
          ...prev
        ]);
      }
      setIsTypeModalOpen(false);
    } catch (e) {
      setError(e.message || 'Failed to save leave type');
    }
  };

  // Leave Request View Modal Handlers
  const handleOpenViewRequestModal = (item) => {
    setSelectedRequest(item);
    setActiveDropdownId(null);
    setRequestUpdateForm({
      status: item.status || 'Pending',
      note: item.note || ''
    });
    setIsViewRequestModalOpen(true);
  };

  const handleDeleteLeaveRequest = async (id) => {
    setActiveDropdownId(null);
    try {
      await leaveService.requests.remove(id);
      setLeaveRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e.message || 'Failed to delete leave request');
    }
  };

  const handleSaveRequestUpdate = async (e) => {
    e.preventDefault();
    if (selectedRequest) {
      try {
        const updated = await leaveService.requests.update(selectedRequest.id, {
          ...selectedRequest,
          ...requestUpdateForm
        });
        setLeaveRequests((prev) =>
          prev.map((r) =>
            r.id === selectedRequest.id
              ? { ...r, ...updated, status: requestUpdateForm.status, note: requestUpdateForm.note }
              : r
          )
        );
      } catch (e) {
        setError(e.message || 'Failed to update leave request');
      }
    }
    setIsViewRequestModalOpen(false);
  };

  const toggleSelectAll = (list) => {
    if (selectedRows.length === list.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(list.map((item) => item.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  const getHeaderInfo = () => {
    if (currentSubTab === 'request') {
      return {
        title: 'Leave Request',
        breadcrumb: 'Dashboard / Leave Request'
      };
    }
    return {
      title: 'Leave Types',
      breadcrumb: 'Dashboard / Leave Types',
      addBtnLabel: '+ Add Leave Types'
    };
  };

  const headerInfo = getHeaderInfo();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      {/* Top Header Card */}
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{headerInfo.title}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{headerInfo.breadcrumb}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Sub-Nav Tabs */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-app)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <button
              onClick={() => handleSubTabChange('type')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'type' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'type' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'type' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Leave Types
            </button>

            <button
              onClick={() => handleSubTabChange('request')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'request' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'request' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'request' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Leave Request
            </button>
          </div>

          {currentSubTab === 'type' && (
            <button
              className="btn btn-primary"
              onClick={handleOpenAddTypeModal}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0d9488',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus size={18} /> {headerInfo.addBtnLabel}
            </button>
          )}
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

      {isLoading && !leaveTypes.length && !leaveRequests.length && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading leave data...
        </div>
      )}

      {/* Main Table Card */}
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
                {currentSubTab === 'type' && (
                  <th style={{ padding: '12px 16px', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedRows.length === leaveTypes.length}
                      onChange={() => toggleSelectAll(leaveTypes)}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                )}

                <th style={{ padding: '12px 16px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    S.L <span>▲</span>
                  </div>
                </th>

                {currentSubTab === 'type' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Leave Type</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  </>
                )}

                {currentSubTab === 'request' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Apply Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>User type</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Leave Type</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Duration</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  </>
                )}

                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* 1. Leave Types Table (Screenshot 1) */}
              {currentSubTab === 'type' &&
                leaveTypes
                  .filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>{row.name}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={row.status} />
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                        <ActionDropdownCell
                          isOpen={activeDropdownId === row.id}
                          onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          onEdit={() => handleOpenEditTypeModal(row)}
                          onDelete={() => runAction(`delete-${row.id}`, () => handleDeleteLeaveType(row.id))}
                          deleteBusy={busyKey === `delete-${row.id}`}
                        />
                      </td>
                    </tr>
                  ))}

              {/* 2. Leave Request Table (Screenshot 3) */}
              {currentSubTab === 'request' &&
                leaveRequests
                  .filter((r) => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.leaveType.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--text-secondary)' }}>{row.sl}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.applyDate}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{row.name}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.userType}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{row.icon || '📄'}</span>
                          <span style={{ fontWeight: 600 }}>{row.leaveType}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.date}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>{row.duration}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <LeaveStatusBadge status={row.status} />
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                        <LeaveRequestActionDropdownCell
                          isOpen={activeDropdownId === row.id}
                          onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          onViewRequest={() => handleOpenViewRequestModal(row)}
                          onDelete={() => runAction(`delete-${row.id}`, () => handleDeleteLeaveRequest(row.id))}
                          deleteBusy={busyKey === `delete-${row.id}`}
                        />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Leave Types Drawer Modal (Screenshot 2) */}
      {isTypeModalOpen && (
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
          onClick={() => setIsTypeModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '500px',
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
                {editingTypeItem ? 'Edit Leave Types' : 'Add New Leave Types'}
              </h3>
              <button
                onClick={() => setIsTypeModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => runAction('save-type', () => handleSaveTypeModal(e))} id="leave-type-form" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Leave Types
                </label>
                <input
                  type="text"
                  placeholder="Enter Fees Type name"
                  value={typeFormData.name}
                  onChange={(e) => setTypeFormData({ ...typeFormData, name: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Status
                </label>
                <select
                  value={typeFormData.status}
                  onChange={(e) => setTypeFormData({ ...typeFormData, status: e.target.value })}
                  style={inputStyle}
                >
                  <option value="Select Status">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </form>

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
                onClick={() => setIsTypeModalOpen(false)}
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
                form="leave-type-form"
                className="btn btn-primary"
                disabled={busyKey === 'save-type'}
                style={{
                  padding: '10px 36px',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                {busyKey === 'save-type' ? <Spinner size={16} color="#ffffff" /> : null} {busyKey === 'save-type' ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Leave Request Drawer Modal (Screenshot 4) */}
      {isViewRequestModalOpen && selectedRequest && (
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
          onClick={() => setIsViewRequestModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '500px',
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>View Leave Request</h3>
              <button
                onClick={() => setIsViewRequestModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body (Screenshot 4) */}
            <form onSubmit={(e) => runAction('save-request', () => handleSaveRequestUpdate(e))} id="view-leave-request-form" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '10px 16px', fontSize: '0.875rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Apply Date</div>
                <div>: {selectedRequest.applyDate}</div>

                <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Name</div>
                <div>: {selectedRequest.name}</div>

                <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>User type</div>
                <div>: {selectedRequest.userType}</div>

                <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Leave Type</div>
                <div>: {selectedRequest.leaveType}</div>

                <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Date</div>
                <div>: {selectedRequest.date}</div>

                <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Duration</div>
                <div>: {selectedRequest.duration}</div>

                <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Reasons</div>
                <div>: {selectedRequest.reason || 'Doctor or hospital visits'}</div>
              </div>

              {/* Update Status Radio Options */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>
                  Update Status
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  {['Pending', 'Approved', 'Rejected'].map((statusOpt) => (
                    <label
                      key={statusOpt}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      <input
                        type="radio"
                        name="leave-status-radio"
                        checked={requestUpdateForm.status === statusOpt}
                        onChange={() => setRequestUpdateForm({ ...requestUpdateForm, status: statusOpt })}
                        style={{ accentColor: '#0d9488', cursor: 'pointer' }}
                      />
                      <span>{statusOpt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Leave Note Textarea */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Leave Note
                </label>
                <textarea
                  placeholder="Enter note..."
                  rows={4}
                  value={requestUpdateForm.note}
                  onChange={(e) => setRequestUpdateForm({ ...requestUpdateForm, note: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </form>

            {/* Drawer Buttons */}
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
                onClick={() => setIsViewRequestModalOpen(false)}
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
                form="view-leave-request-form"
                className="btn btn-primary"
                disabled={busyKey === 'save-request'}
                style={{
                  padding: '10px 36px',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                {busyKey === 'save-request' ? <Spinner size={16} color="#ffffff" /> : null} {busyKey === 'save-request' ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Leave Type Action Dropdown (Edit, Delete)
const ActionDropdownCell = ({ isOpen, onToggle, onEdit, onDelete, deleteBusy }) => {
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
            minWidth: '130px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
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
              textAlign: 'left'
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

// Leave Request Action Dropdown (View Request, Delete)
const LeaveRequestActionDropdownCell = ({ isOpen, onToggle, onViewRequest, onDelete, deleteBusy }) => {
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
            minWidth: '150px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <button
            onClick={onViewRequest}
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
            <Eye size={14} color="#0d9488" /> View Request
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

// Status Badge Component for Leave Types
const StatusBadge = ({ status }) => {
  const isActive = status === 'Active';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 700,
        backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
        color: isActive ? '#15803d' : '#991b1b'
      }}
    >
      {status}
    </span>
  );
};

// Status Badge Component for Leave Request (Approved, Pending, Rejected)
const LeaveStatusBadge = ({ status }) => {
  let bgColor = '#dcfce7';
  let textColor = '#15803d';

  if (status === 'Pending') {
    bgColor = '#ffedd5';
    textColor = '#c2410c';
  } else if (status === 'Rejected') {
    bgColor = '#fee2e2';
    textColor = '#991b1b';
  }

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 14px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 700,
        backgroundColor: bgColor,
        color: textColor
      }}
    >
      {status}
    </span>
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
