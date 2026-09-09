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
  Filter,
  Printer,
  DollarSign,
  CheckCircle
} from 'lucide-react';

export const FeesCollectionModule = () => {
  const { activeTab, setActiveTab } = useTheme();

  const getSubTabFromActiveTab = () => {
    if (activeTab === 'fees-type') return 'type';
    if (activeTab === 'fees-group') return 'group';
    if (activeTab === 'fees-discount') return 'discount';
    return 'collect';
  };

  const [currentSubTab, setCurrentSubTab] = useState(getSubTabFromActiveTab());
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingReceiptItem, setViewingReceiptItem] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    setCurrentSubTab(getSubTabFromActiveTab());
    setActiveDropdownId(null);
  }, [activeTab]);

  // 1. Fees Collect State & Data (Screenshots 1, 2, 3)
  const [collectList, setCollectList] = useState([
    { id: 1, sl: '01', admissionNo: 'AD52365', name: 'Kathryn Murphy', rollNo: '12', className: 'Class 1 (A)', amount: '$700.50', paid: '$700.50', due: '$0', date: '12 May 2025', status: 'Paid', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
    { id: 2, sl: '02', admissionNo: 'AD52366', name: 'Jerome Bell', rollNo: '08', className: 'Class 2 (B)', amount: '$850.00', paid: '$450.00', due: '$400.00', date: '10 May 2025', status: 'Partial', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
    { id: 3, sl: '03', admissionNo: 'AD52367', name: 'Theresa Webb', rollNo: '19', className: 'Class 3 (A)', amount: '$920.75', paid: '$0', due: '$920.75', date: '08 May 2025', status: 'Unpaid', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
    { id: 4, sl: '04', admissionNo: 'AD52368', name: 'Cody Fisher', rollNo: '10', className: 'Class 4 (C)', amount: '$750.00', paid: '$750.00', due: '$0', date: '05 May 2025', status: 'Paid', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
    { id: 5, sl: '05', admissionNo: 'AD52369', name: 'Annette Black', rollNo: '16', className: 'Class 5 (B)', amount: '$630.20', paid: '$500.00', due: '$130.20', date: '03 May 2025', status: 'Partial', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' }
  ]);

  // 2. Fees Type State & Data (Screenshots 4 & 5)
  const [feesTypes, setFeesTypes] = useState([
    { id: 1, sl: '01', name: 'May month fees', status: 'Active' },
    { id: 2, sl: '02', name: 'Admission fees', status: 'Inactive' },
    { id: 3, sl: '03', name: 'Exam fees', status: 'Active' },
    { id: 4, sl: '04', name: 'April month fees', status: 'Inactive' },
    { id: 5, sl: '05', name: 'March month fees', status: 'Active' },
    { id: 6, sl: '06', name: 'February month fees', status: 'Inactive' },
    { id: 7, sl: '07', name: 'January month fees', status: 'Active' },
    { id: 8, sl: '08', name: 'Admission fees', status: 'Inactive' }
  ]);

  // 3. Fees Group State & Data (Screenshots 1 & 2)
  const [feesGroups, setFeesGroups] = useState([
    { id: 1, sl: '01', name: 'Class 1 (A) Fees', feesType: 'May month fees, Admission fees, Exam fees', status: 'Active' },
    { id: 2, sl: '02', name: 'Class 2 (A) Fees', feesType: 'May month fees, Admission fees, Exam fees', status: 'Inactive' },
    { id: 3, sl: '03', name: 'Class 3 (A) Fees', feesType: 'May month fees, Admission fees, Exam fees', status: 'Active' },
    { id: 4, sl: '04', name: 'Class 4 (A) Fees', feesType: 'May month fees, Admission fees, Exam fees', status: 'Inactive' },
    { id: 5, sl: '05', name: 'Class 5 (A) Fees', feesType: 'May month fees, Admission fees, Exam fees', status: 'Active' },
    { id: 6, sl: '06', name: 'Class 6 (A) Fees', feesType: 'May month fees, Admission fees, Exam fees', status: 'Inactive' },
    { id: 7, sl: '07', name: 'Class 7 (A) Fees', feesType: 'May month fees, Admission fees, Exam fees', status: 'Active' },
    { id: 8, sl: '08', name: 'Class 8 (A) Fees', feesType: 'May month fees, Admission fees, Exam fees', status: 'Inactive' }
  ]);

  // 4. Fees Discount State & Data (Screenshots 3 & 4)
  const [feesDiscounts, setFeesDiscounts] = useState([
    { id: 1, sl: '01', name: 'Class 1 (A) Fees', feesType: 'May month fees, Admission fees, Exam fees', discountType: 'Percentage', discountValue: '10%', status: 'Active' },
    { id: 2, sl: '02', name: 'Class 2 (A) Fees', feesType: 'May month fees, Admission fees, Exam fees', discountType: 'Percentage', discountValue: '15%', status: 'Inactive' },
    { id: 3, sl: '03', name: 'Class 3 (A) Fees', feesType: 'May month fees, Admission fees, Exam fees', discountType: 'Fixed Amount', discountValue: '$50', status: 'Active' },
    { id: 4, sl: '04', name: 'Class 4 (A) Fees', feesType: 'May month fees, Admission fees, Exam fees', discountType: 'Percentage', discountValue: '10%', status: 'Inactive' },
    { id: 5, sl: '05', name: 'Class 5 (A) Fees', feesType: 'May month fees, Admission fees, Exam fees', status: 'Active' },
    { id: 6, sl: '06', name: 'Class 6 (A) Fees', feesType: 'May month fees, Admission fees, Exam fees', status: 'Inactive' },
    { id: 7, sl: '07', name: 'Class 7 (A) Fees', feesType: 'May month fees, Admission fees, Exam fees', status: 'Active' },
    { id: 8, sl: '08', name: 'Class 8 (A) Fees', feesType: 'May month fees, Admission fees, Exam fees', status: 'Inactive' }
  ]);

  // Modal Form State
  const [modalFormData, setModalFormData] = useState({
    className: 'Select a class',
    section: 'Select a Section',
    rollNo: '',
    date: '15 Jan 2025',
    amount: '1500',
    discount: 'Select a Discount',
    paymentType: 'Cash',
    note: '',
    name: '',
    code: '',
    feesType: 'May month fees, Admission fees, Exam fees',
    discountType: 'Percentage',
    discountValue: '',
    status: 'Select Status'
  });

  const handleSubTabChange = (tabKey) => {
    setCurrentSubTab(tabKey);
    setActiveDropdownId(null);
    if (tabKey === 'collect') setActiveTab('fees-collect');
    if (tabKey === 'type') setActiveTab('fees-type');
    if (tabKey === 'group') setActiveTab('fees-group');
    if (tabKey === 'discount') setActiveTab('fees-discount');
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setModalFormData({
      className: 'Select a class',
      section: 'Select a Section',
      rollNo: '',
      date: '15 May 2025',
      amount: '1500',
      discount: 'Select a Discount',
      paymentType: 'Cash',
      note: '',
      name: '',
      code: '',
      feesType: 'May month fees, Admission fees, Exam fees',
      discountType: 'Percentage',
      discountValue: '',
      status: 'Select Status'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setActiveDropdownId(null);
    setModalFormData({
      className: item.className || 'Class 1 (A)',
      section: 'Section A',
      rollNo: item.rollNo || '12',
      date: item.date || '15 May 2025',
      amount: item.amount ? item.amount.replace('$', '') : '700',
      discount: 'Select a Discount',
      paymentType: 'Cash',
      note: '',
      name: item.name || '',
      code: item.code || '',
      feesType: item.feesType || 'May month fees, Admission fees, Exam fees',
      discountType: item.discountType || 'Percentage',
      discountValue: item.discountValue || '',
      status: item.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenReceiptModal = (item) => {
    setViewingReceiptItem(item);
    setActiveDropdownId(null);
    setIsReceiptModalOpen(true);
  };

  const handleDeleteItem = (id) => {
    setActiveDropdownId(null);
    if (currentSubTab === 'collect') {
      setCollectList((prev) => prev.filter((item) => item.id !== id));
    } else if (currentSubTab === 'type') {
      setFeesTypes((prev) => prev.filter((item) => item.id !== id));
    } else if (currentSubTab === 'group') {
      setFeesGroups((prev) => prev.filter((item) => item.id !== id));
    } else if (currentSubTab === 'discount') {
      setFeesDiscounts((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleSaveModal = (e) => {
    e.preventDefault();

    if (editingItem) {
      if (currentSubTab === 'collect') {
        setCollectList((prev) =>
          prev.map((c) =>
            c.id === editingItem.id
              ? {
                  ...c,
                  className: modalFormData.className,
                  rollNo: modalFormData.rollNo || c.rollNo,
                  amount: `$${modalFormData.amount}`,
                  paid: `$${modalFormData.amount}`,
                  due: '$0',
                  date: modalFormData.date,
                  status: 'Paid'
                }
              : c
          )
        );
      } else if (currentSubTab === 'type') {
        setFeesTypes((prev) =>
          prev.map((ft) => (ft.id === editingItem.id ? { ...ft, name: modalFormData.name, status: modalFormData.status === 'Select Status' ? ft.status : modalFormData.status } : ft))
        );
      } else if (currentSubTab === 'group') {
        setFeesGroups((prev) =>
          prev.map((fg) => (fg.id === editingItem.id ? { ...fg, name: modalFormData.name, feesType: modalFormData.feesType, status: modalFormData.status === 'Select Status' ? fg.status : modalFormData.status } : fg))
        );
      } else if (currentSubTab === 'discount') {
        setFeesDiscounts((prev) =>
          prev.map((fd) => (fd.id === editingItem.id ? { ...fd, name: modalFormData.name, feesType: modalFormData.feesType, discountType: modalFormData.discountType, discountValue: modalFormData.discountValue || fd.discountValue, status: modalFormData.status === 'Select Status' ? fd.status : modalFormData.status } : fd))
        );
      }
    } else {
      if (currentSubTab === 'collect') {
        const newCollect = {
          id: Date.now(),
          sl: `${collectList.length + 1 < 10 ? '0' : ''}${collectList.length + 1}`,
          admissionNo: `AD5237${collectList.length + 1}`,
          name: 'Jon Deve',
          rollNo: modalFormData.rollNo || '10',
          className: modalFormData.className !== 'Select a class' ? modalFormData.className : 'Class 5 (A)',
          amount: `$${modalFormData.amount || '1500'}`,
          paid: `$${modalFormData.amount || '1500'}`,
          due: '$0',
          date: modalFormData.date || '15 Jan 2025',
          status: 'Paid',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
        };
        setCollectList([newCollect, ...collectList]);
      } else if (currentSubTab === 'type') {
        const newType = {
          id: Date.now(),
          sl: `${feesTypes.length + 1 < 10 ? '0' : ''}${feesTypes.length + 1}`,
          name: modalFormData.name || 'New Fees Type',
          status: modalFormData.status === 'Select Status' ? 'Active' : modalFormData.status
        };
        setFeesTypes([newType, ...feesTypes]);
      } else if (currentSubTab === 'group') {
        const newGrp = {
          id: Date.now(),
          sl: `${feesGroups.length + 1 < 10 ? '0' : ''}${feesGroups.length + 1}`,
          name: modalFormData.name || 'Class 9 (A) Fees',
          feesType: modalFormData.feesType || 'May month fees, Admission fees, Exam fees',
          status: modalFormData.status === 'Select Status' ? 'Active' : modalFormData.status
        };
        setFeesGroups([newGrp, ...feesGroups]);
      } else if (currentSubTab === 'discount') {
        const newDisc = {
          id: Date.now(),
          sl: `${feesDiscounts.length + 1 < 10 ? '0' : ''}${feesDiscounts.length + 1}`,
          name: modalFormData.name || 'Class 9 (A) Fees',
          feesType: modalFormData.feesType || 'May month fees, Admission fees, Exam fees',
          discountType: modalFormData.discountType || 'Percentage',
          discountValue: modalFormData.discountValue || '10%',
          status: modalFormData.status === 'Select Status' ? 'Active' : modalFormData.status
        };
        setFeesDiscounts([newDisc, ...feesDiscounts]);
      }
    }

    setIsModalOpen(false);
    setEditingItem(null);
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

  // Header Details Config
  const getHeaderInfo = () => {
    switch (currentSubTab) {
      case 'type':
        return {
          title: 'Fees Type',
          breadcrumb: 'Dashboard / Fees Type',
          addBtnLabel: '+ Add Fees Type',
          searchPlaceholder: 'Search...'
        };
      case 'group':
        return {
          title: 'Fees Group',
          breadcrumb: 'Dashboard / Fees Group',
          addBtnLabel: '+ Add Fees Group',
          searchPlaceholder: 'Search...'
        };
      case 'discount':
        return {
          title: 'Fees Discount',
          breadcrumb: 'Dashboard / Fees Discount',
          addBtnLabel: '+ Add Fees Discount',
          searchPlaceholder: 'Search...'
        };
      case 'collect':
      default:
        return {
          title: 'Fees Collect',
          breadcrumb: 'Dashboard / Fees Collect',
          addBtnLabel: 'Collect Fees',
          searchPlaceholder: 'Search...'
        };
    }
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
              onClick={() => handleSubTabChange('collect')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'collect' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'collect' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'collect' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Fees Collect
            </button>

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
              Fees Type
            </button>

            <button
              onClick={() => handleSubTabChange('group')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'group' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'group' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'group' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Fees Group
            </button>

            <button
              onClick={() => handleSubTabChange('discount')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'discount' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'discount' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'discount' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Fees Discount
            </button>
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
            <Plus size={18} /> {headerInfo.addBtnLabel}
          </button>
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
                placeholder={headerInfo.searchPlaceholder}
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

            {currentSubTab === 'collect' && (
              <button
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Filter size={14} /> Filter <ChevronDown size={14} />
              </button>
            )}
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
                    checked={
                      currentSubTab === 'collect'
                        ? selectedRows.length === collectList.length
                        : currentSubTab === 'type'
                        ? selectedRows.length === feesTypes.length
                        : currentSubTab === 'group'
                        ? selectedRows.length === feesGroups.length
                        : selectedRows.length === feesDiscounts.length
                    }
                    onChange={() =>
                      toggleSelectAll(
                        currentSubTab === 'collect'
                          ? collectList
                          : currentSubTab === 'type'
                          ? feesTypes
                          : currentSubTab === 'group'
                          ? feesGroups
                          : feesDiscounts
                      )
                    }
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    S.L <span>▲</span>
                  </div>
                </th>

                {currentSubTab === 'collect' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Admission No</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Roll No</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Class</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Amount</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Paid</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Due</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  </>
                )}

                {currentSubTab === 'type' && (
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Name</th>
                )}

                {currentSubTab === 'group' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Group Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Fees Type</th>
                  </>
                )}

                {currentSubTab === 'discount' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Group Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Fees Type</th>
                  </>
                )}

                {(currentSubTab !== 'collect') && <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>}
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* 1. Render Fees Collect (Screenshot 1) */}
              {currentSubTab === 'collect' &&
                collectList
                  .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()))
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
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0d9488' }}>{row.admissionNo}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={row.avatar} alt={row.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                          <span style={{ fontWeight: 700 }}>{row.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.rollNo}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.className}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{row.amount}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#10b981' }}>{row.paid}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ef4444' }}>{row.due}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.date}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={row.status} />
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                        <ActionDropdownCell
                          isOpen={activeDropdownId === row.id}
                          onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          onViewReceipt={() => handleOpenReceiptModal(row)}
                          onEdit={() => handleOpenEditModal(row)}
                          onDelete={() => handleDeleteItem(row.id)}
                        />
                      </td>
                    </tr>
                  ))}

              {/* 2. Render Fees Type */}
              {currentSubTab === 'type' &&
                feesTypes
                  .filter((ft) => ft.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{row.name}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={row.status} />
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                        <ActionDropdownCell
                          isOpen={activeDropdownId === row.id}
                          onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          onEdit={() => handleOpenEditModal(row)}
                          onDelete={() => handleDeleteItem(row.id)}
                        />
                      </td>
                    </tr>
                  ))}

              {/* 3. Render Fees Group (Screenshot 1) */}
              {currentSubTab === 'group' &&
                feesGroups
                  .filter((fg) => fg.name.toLowerCase().includes(searchTerm.toLowerCase()) || fg.feesType.toLowerCase().includes(searchTerm.toLowerCase()))
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
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.feesType}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={row.status} />
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                        <ActionDropdownCell
                          isOpen={activeDropdownId === row.id}
                          onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          onEdit={() => handleOpenEditModal(row)}
                          onDelete={() => handleDeleteItem(row.id)}
                        />
                      </td>
                    </tr>
                  ))}

              {/* 4. Render Fees Discount (Screenshot 3) */}
              {currentSubTab === 'discount' &&
                feesDiscounts
                  .filter((fd) => fd.name.toLowerCase().includes(searchTerm.toLowerCase()) || fd.feesType.toLowerCase().includes(searchTerm.toLowerCase()))
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
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.feesType}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={row.status} />
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                        <ActionDropdownCell
                          isOpen={activeDropdownId === row.id}
                          onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          onEdit={() => handleOpenEditModal(row)}
                          onDelete={() => handleDeleteItem(row.id)}
                        />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Slide-over Drawer Modal */}
      {isModalOpen && (
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
          onClick={() => setIsModalOpen(false)}
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingItem ? (currentSubTab === 'discount' ? 'Edit Discount' : currentSubTab === 'group' ? 'Edit Fees Group' : `Edit ${currentSubTab === 'collect' ? 'Collect Fees' : 'Fees Type'}`) : (currentSubTab === 'discount' ? 'Add New Discount' : currentSubTab === 'group' ? 'Add New Fees Group' : `Add New ${currentSubTab === 'collect' ? 'Collect Fees' : 'Fees Type'}`)}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveModal} id="fees-modal-form" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}>
              {/* Collect Fees Drawer Form */}
              {currentSubTab === 'collect' && (
                <>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Class
                      </label>
                      <select
                        value={modalFormData.className}
                        onChange={(e) => setModalFormData({ ...modalFormData, className: e.target.value })}
                        style={inputStyle}
                      >
                        <option value="Select a class">Select a class</option>
                        <option value="Class 1 (A)">Class 1 (A)</option>
                        <option value="Class 2 (B)">Class 2 (B)</option>
                        <option value="Class 3 (A)">Class 3 (A)</option>
                        <option value="Class 4 (C)">Class 4 (C)</option>
                        <option value="Class 5 (B)">Class 5 (B)</option>
                      </select>
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Section
                      </label>
                      <select
                        value={modalFormData.section}
                        onChange={(e) => setModalFormData({ ...modalFormData, section: e.target.value })}
                        style={inputStyle}
                      >
                        <option value="Select a Section">Select a Section</option>
                        <option value="Section A">Section A</option>
                        <option value="Section B">Section B</option>
                        <option value="Section C">Section C</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Roll No
                      </label>
                      <input
                        type="text"
                        placeholder="Enter roll no."
                        value={modalFormData.rollNo}
                        onChange={(e) => setModalFormData({ ...modalFormData, rollNo: e.target.value })}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Date
                      </label>
                      <input
                        type="text"
                        placeholder="dd/mm/yyyy"
                        value={modalFormData.date}
                        onChange={(e) => setModalFormData({ ...modalFormData, date: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Amount</label>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444' }}>Due: 2000</span>
                      </div>
                      <input
                        type="text"
                        placeholder="$1500"
                        value={modalFormData.amount}
                        onChange={(e) => setModalFormData({ ...modalFormData, amount: e.target.value })}
                        style={inputStyle}
                        required
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Discount
                      </label>
                      <select
                        value={modalFormData.discount}
                        onChange={(e) => setModalFormData({ ...modalFormData, discount: e.target.value })}
                        style={inputStyle}
                      >
                        <option value="Select a Discount">Select a Discount</option>
                        <option value="Sibling 10%">Sibling 10%</option>
                        <option value="Merit 25%">Merit 25%</option>
                        <option value="Staff 50%">Staff 50%</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Payment Type
                    </label>
                    <select
                      value={modalFormData.paymentType}
                      onChange={(e) => setModalFormData({ ...modalFormData, paymentType: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Stripe/Card">Stripe/Card</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Note
                    </label>
                    <textarea
                      placeholder="Enter note..."
                      rows={3}
                      value={modalFormData.note}
                      onChange={(e) => setModalFormData({ ...modalFormData, note: e.target.value })}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                </>
              )}

              {/* Add/Edit Fees Type Form */}
              {currentSubTab === 'type' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Fees Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Fees Type name"
                      value={modalFormData.name}
                      onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Status
                    </label>
                    <select
                      value={modalFormData.status}
                      onChange={(e) => setModalFormData({ ...modalFormData, status: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="Select Status">Select Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </>
              )}

              {/* Add/Edit Fees Group (Screenshot 2) */}
              {currentSubTab === 'group' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Group Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Group Name"
                      value={modalFormData.name}
                      onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Fees Type
                    </label>
                    <select
                      value={modalFormData.feesType}
                      onChange={(e) => setModalFormData({ ...modalFormData, feesType: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="Select fees type">Select fees type</option>
                      <option value="May month fees, Admission fees, Exam fees">May month fees, Admission fees, Exam fees</option>
                      <option value="Tuition & Transport Fees">Tuition & Transport Fees</option>
                      <option value="Library & Sports Fees">Library & Sports Fees</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Status
                    </label>
                    <select
                      value={modalFormData.status}
                      onChange={(e) => setModalFormData({ ...modalFormData, status: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="Select Status">Select Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </>
              )}

              {/* Add/Edit Fees Discount (Screenshot 4) */}
              {currentSubTab === 'discount' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Group Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Group Name"
                      value={modalFormData.name}
                      onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Discount Type
                      </label>
                      <select
                        value={modalFormData.discountType}
                        onChange={(e) => setModalFormData({ ...modalFormData, discountType: e.target.value })}
                        style={inputStyle}
                      >
                        <option value="Percentage">Percentage</option>
                        <option value="Fixed Amount">Fixed Amount</option>
                      </select>
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Discount Value
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 10%"
                        value={modalFormData.discountValue}
                        onChange={(e) => setModalFormData({ ...modalFormData, discountValue: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Status
                    </label>
                    <select
                      value={modalFormData.status}
                      onChange={(e) => setModalFormData({ ...modalFormData, status: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="Select Status">Select Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </>
              )}
            </form>

            {/* Modal Footer Buttons */}
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
                onClick={() => setIsModalOpen(false)}
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
                form="fees-modal-form"
                className="btn btn-primary"
                style={{
                  padding: '10px 36px',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official School Fee Receipt Dialog Modal (Screenshot 3) */}
      {isReceiptModalOpen && viewingReceiptItem && (
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
          onClick={() => setIsReceiptModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card animate-fade-in"
            style={{
              width: '540px',
              maxWidth: '95vw',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              color: '#1e293b',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              position: 'relative'
            }}
          >
            {/* School Header (Screenshot 3) */}
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '2px', color: '#0f172a' }}>
              School Name
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '20px' }}>
              Smithbroad, Unit 4, Holler Tower, San Diego
            </p>

            {/* Student Meta Data Grid */}
            <div
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px 16px',
                textAlign: 'left',
                fontSize: '0.82rem',
                backgroundColor: '#f8fafc',
                padding: '14px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #e2e8f0'
              }}
            >
              <div><strong>Student Name</strong> : {viewingReceiptItem.name || 'Jon Deve'}</div>
              <div><strong>Date:</strong> {viewingReceiptItem.date || '15 Jan 2025'}</div>
              <div><strong>Class</strong> : {viewingReceiptItem.className || '5 (A)'}</div>
              <div><strong>Collected By:</strong> Admin</div>
              <div><strong>Roll No.</strong> : {viewingReceiptItem.rollNo || '10'}</div>
              <div><strong>Payment By:</strong> Bank</div>
            </div>

            {/* Receipt Amount Table (Screenshot 3) */}
            <div style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  backgroundColor: '#f1f5f9',
                  padding: '10px 16px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  borderBottom: '1px solid #e2e8f0',
                  textAlign: 'left'
                }}
              >
                <div>Amount</div>
                <div>Paid</div>
                <div>Balance</div>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  padding: '12px 16px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textAlign: 'left'
                }}
              >
                <div>{viewingReceiptItem.amount || '$2500'}</div>
                <div style={{ color: '#10b981' }}>{viewingReceiptItem.paid || '$1500'}</div>
                <div style={{ color: '#ef4444' }}>{viewingReceiptItem.due || '$500'}</div>
              </div>
            </div>

            {/* Thanks Note */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '4px' }}>Thanks</div>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                This receipt is computer generated hence on signature is required
              </p>
            </div>

            {/* Footer Branding & Print Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Made by <strong>Wowtheme7.</strong>
              </span>

              <button
                className="btn btn-primary"
                onClick={() => window.print()}
                style={{ padding: '8px 18px', backgroundColor: '#0d9488', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={14} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Action Dropdown Cell Component with View Receipt, Edit, and Delete options
const ActionDropdownCell = ({ isOpen, onToggle, onViewReceipt, onEdit, onDelete }) => {
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
          {onViewReceipt && (
            <button
              onClick={onViewReceipt}
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
              <Eye size={14} color="#0d9488" /> View Receipt
            </button>
          )}
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
              borderTop: onViewReceipt ? '1px solid var(--border-light)' : 'none'
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

// Status Badge Component matching screenshot pills
const StatusBadge = ({ status }) => {
  const isPaid = status === 'Paid' || status === 'Active';
  const isPartial = status === 'Partial';
  const isUnpaid = status === 'Unpaid' || status === 'Inactive';

  let bgColor = '#dcfce7';
  let textColor = '#15803d';

  if (isPartial) {
    bgColor = '#ffedd5';
    textColor = '#c2410c';
  } else if (isUnpaid) {
    bgColor = '#fee2e2';
    textColor = '#991b1b';
  }

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
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

// Input Style Utility
const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-app)',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
  transition: 'border-color 0.2s ease'
};
