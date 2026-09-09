import React, { useState, useEffect } from 'react';
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

  // 1. Leave Types Data (Screenshot 1)
  const [leaveTypes, setLeaveTypes] = useState([
    { id: 1, sl: '01', name: 'Medical Leave', status: 'Active' },
    { id: 2, sl: '02', name: 'Special Leave', status: 'Inactive' },
    { id: 3, sl: '03', name: 'Medical Leave', status: 'Active' },
    { id: 4, sl: '04', name: 'Casual Leave', status: 'Inactive' },
    { id: 5, sl: '05', name: 'Casual Leave', status: 'Active' },
    { id: 6, sl: '06', name: 'Special Leave', status: 'Inactive' },
    { id: 7, sl: '07', name: 'Special Leave', status: 'Active' },
    { id: 8, sl: '08', name: 'Special Leave', status: 'Inactive' }
  ]);

  // 2. Leave Request Data (Screenshots 3 & 4)
  const [leaveRequests, setLeaveRequests] = useState([
    { id: 1, sl: '01', applyDate: '07 May 2025', name: 'Jerome Bell', userType: 'Teacher', leaveType: 'Medical Leave', icon: '🏥', date: '07 May 2025 - 08 May 2025', duration: '1', status: 'Approved', reason: 'Doctor or hospital visits', note: '' },
    { id: 2, sl: '02', applyDate: '10 May 2025', name: 'Jane Cooper', userType: 'Student', leaveType: 'Casual Leave', icon: '⚙', date: '10 May 2025 - 12 May 2025', duration: '2', status: 'Pending', reason: 'Personal family matter', note: '' },
    { id: 3, sl: '03', applyDate: '12 May 2025', name: 'Devon Lane', userType: 'Teacher', leaveType: 'Half Day Leave', icon: '⏰', date: '12 May 2025', duration: '0.5', status: 'Rejected', reason: 'Personal work in afternoon', note: '' },
    { id: 4, sl: '04', applyDate: '13 May 2025', name: 'Cody Fisher', userType: 'Admin', leaveType: 'Vacation Leave', icon: '✈', date: '13 May 2025 - 20 May 2025', duration: '7', status: 'Approved', reason: 'Annual summer vacation', note: '' },
    { id: 5, sl: '05', applyDate: '14 May 2025', name: 'Theresa Webb', userType: 'Teacher', leaveType: 'Study Leave', icon: '📖', date: '14 May 2025 - 16 May 2025', duration: '2', status: 'Pending', reason: 'Higher education exam preparation', note: '' },
    { id: 6, sl: '06', applyDate: '15 May 2025', name: 'Darrell Steward', userType: 'Student', leaveType: 'Paid Leave', icon: '💵', date: '15 May 2025 - 17 May 2025', duration: '2', status: 'Approved', reason: 'Family trip', note: '' },
    { id: 7, sl: '07', applyDate: '17 May 2025', name: 'Leslie Alexander', userType: 'Teacher', leaveType: 'Emergency Leave', icon: '🚨', date: '17 May 2025 - 18 May 2025', duration: '1', status: 'Rejected', reason: 'Urgent home repair', note: '' },
    { id: 8, sl: '08', applyDate: '18 May 2025', name: 'Guy Hawkins', userType: 'Admin', leaveType: 'Maternity Leave', icon: '👶', date: '18 May 2025 - 28 May 2025', duration: '10', status: 'Approved', reason: 'Maternity leave period', note: '' }
  ]);

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

  const handleDeleteLeaveType = (id) => {
    setActiveDropdownId(null);
    setLeaveTypes((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveTypeModal = (e) => {
    e.preventDefault();
    if (editingTypeItem) {
      setLeaveTypes((prev) =>
        prev.map((t) =>
          t.id === editingTypeItem.id
            ? { ...t, name: typeFormData.name, status: typeFormData.status === 'Select Status' ? t.status : typeFormData.status }
            : t
        )
      );
    } else {
      const newType = {
        id: Date.now(),
        sl: `${leaveTypes.length + 1 < 10 ? '0' : ''}${leaveTypes.length + 1}`,
        name: typeFormData.name || 'New Leave Type',
        status: typeFormData.status === 'Select Status' ? 'Active' : typeFormData.status
      };
      setLeaveTypes([newType, ...leaveTypes]);
    }
    setIsTypeModalOpen(false);
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

  const handleDeleteLeaveRequest = (id) => {
    setActiveDropdownId(null);
    setLeaveRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSaveRequestUpdate = (e) => {
    e.preventDefault();
    if (selectedRequest) {
      setLeaveRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, status: requestUpdateForm.status, note: requestUpdateForm.note }
            : r
        )
      );
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
                          onDelete={() => handleDeleteLeaveType(row.id)}
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
                          onDelete={() => handleDeleteLeaveRequest(row.id)}
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

            <form onSubmit={handleSaveTypeModal} id="leave-type-form" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}>
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
            <form onSubmit={handleSaveRequestUpdate} id="view-leave-request-form" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}>
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
    </div>
  );
};

// Leave Type Action Dropdown (Edit, Delete)
const ActionDropdownCell = ({ isOpen, onToggle, onEdit, onDelete }) => {
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

// Leave Request Action Dropdown (View Request, Delete)
const LeaveRequestActionDropdownCell = ({ isOpen, onToggle, onViewRequest, onDelete }) => {
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
