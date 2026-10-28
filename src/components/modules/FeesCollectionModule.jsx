import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { classService } from '../../services/classService';
import { activeOptions, classOptions, applicableDiscounts, collectionPayload, discountPayload, discountValueLabel } from '../../services/feeCollectionForm';
import { PaymentTypePicker } from './PaymentTypePicker';
import { feeService } from '../../services/feeService';
import { useApiAction } from '../../hooks/useApiAction';
import { Spinner } from '../ui/Spinner';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { busyKey, runAction } = useApiAction();
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    setCurrentSubTab(getSubTabFromActiveTab());
    setActiveDropdownId(null);
  }, [activeTab]);

  // 1. Fees Collect State & Data (Screenshots 1, 2, 3)
  const [collectList, setCollectList] = useState([]);

  // 2. Fees Type State & Data (Screenshots 4 & 5)
  const [feesTypes, setFeesTypes] = useState([]);

  // 3. Fees Group State & Data (Screenshots 1 & 2)
  const [feesGroups, setFeesGroups] = useState([]);

  // 4. Fees Discount State & Data (Screenshots 3 & 4)
  const [feesDiscounts, setFeesDiscounts] = useState([]);

  const fetchFeesData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [collRes, typeRes, groupRes, discRes] = await Promise.all([
        feeService.collections.list(),
        feeService.types.list(),
        feeService.groups.list(),
        feeService.discounts.list()
      ]);
      const collItems = Array.isArray(collRes) ? collRes : [];
      const typeItems = Array.isArray(typeRes) ? typeRes : [];
      const groupItems = Array.isArray(groupRes) ? groupRes : [];
      const discItems = Array.isArray(discRes) ? discRes : [];
      setCollectList(collItems.map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })));
      setFeesTypes(typeItems.map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })));
      setFeesGroups(groupItems.map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })));
      setFeesDiscounts(discItems.map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })));
    } catch (e) {
      setError(e.message || 'Failed to load fees data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeesData();
  }, [fetchFeesData]);

  // Modal Form State
  const [modalFormData, setModalFormData] = useState({
    className: '',
    section: '',
    rollNo: '',
    date: new Date().toLocaleDateString('en-CA'),
    amount: '',
    discountId: '',
    feeTypeId: '',
    paymentType: '',
    note: '',
    name: '',
    code: '',
    feesType: currentSubTab === 'discount' ? 'All' : '',
    discountType: 'Percentage',
    discountValue: '',
    status: 'Select Status'
  });

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState('');
  const [sectionsError, setSectionsError] = useState('');
  const selectedFeeType = feesTypes.find(type => String(type.id) === String(modalFormData.feeTypeId))?.name || '';
  const discountOptions = applicableDiscounts(feesDiscounts, selectedFeeType);

  useEffect(() => {
    if (!isModalOpen || currentSubTab !== 'collect') return;
    let active = true;
    setOptionsLoading(true); setOptionsError(''); setClasses([]); setPaymentTypes([]);
    Promise.all([classService.classes.list(), feeService.paymentTypes(), feeService.types.list(), feeService.discounts.list()])
      .then(([classRows, payments, types, discounts]) => {
        if (!active) return;
        if (![classRows, payments, types, discounts].every(Array.isArray)) throw new Error('Invalid fee form options response.');
        setClasses(classOptions(classRows)); setPaymentTypes(payments.filter(p => p.active));
        setFeesTypes(types); setFeesDiscounts(discounts);
      }).catch(err => { if (active) setOptionsError(err.message || 'Could not load fee options.'); })
      .finally(() => { if (active) setOptionsLoading(false); });
    return () => { active = false; };
  }, [isModalOpen, currentSubTab]);

  useEffect(() => {
    setSections([]); setSectionsError('');
    if (!isModalOpen || currentSubTab !== 'collect' || !modalFormData.className) { setSectionsLoading(false); return; }
    let active = true;
    setSectionsLoading(true);
    classService.sections.list({ className: modalFormData.className }).then(rows => {
      if (!active) return;
      if (!Array.isArray(rows)) throw new Error('Invalid sections response.');
      setSections(activeOptions(rows));
    }).catch(err => { if (active) setSectionsError(err.message || 'Could not load sections.'); })
      .finally(() => { if (active) setSectionsLoading(false); });
    return () => { active = false; };
  }, [isModalOpen, currentSubTab, modalFormData.className]);

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
    setError('');
    setModalFormData({
      className: '',
      section: '',
      rollNo: '',
      date: new Date().toLocaleDateString('en-CA'),
      amount: '',
      discountId: '',
      feeTypeId: '',
      paymentType: '',
      note: '',
      name: '',
      code: '',
      feesType: currentSubTab === 'discount' ? 'All' : '',
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
      className: item.className || '',
      section: item.section || '',
      rollNo: item.rollNo || '',
      date: item.date || '',
      amount: item.amount != null ? String(item.amount).replace('$', '') : '',
      discountId: item.discountId || '',
      feeTypeId: item.feeTypeId || '',
      paymentType: item.paymentType || '',
      note: item.note || '',
      name: item.name || '',
      code: item.code || '',
      feesType: item.feesType || (currentSubTab === 'discount' ? 'All' : ''),
      discountType: item.discountType || 'Percentage',
      discountValue: String(item.discountValue ?? '').replace(/%$/, '').trim(),
      status: item.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenReceiptModal = (item) => {
    setViewingReceiptItem(item);
    setActiveDropdownId(null);
    setIsReceiptModalOpen(true);
  };

  const handleDeleteItem = async (id) => {
    setActiveDropdownId(null);
    try {
      if (currentSubTab === 'collect') {
        await feeService.collections.remove(id);
        setCollectList((prev) => prev.filter((item) => item.id !== id));
      } else if (currentSubTab === 'type') {
        await feeService.types.remove(id);
        setFeesTypes((prev) => prev.filter((item) => item.id !== id));
      } else if (currentSubTab === 'group') {
        await feeService.groups.remove(id);
        setFeesGroups((prev) => prev.filter((item) => item.id !== id));
      } else if (currentSubTab === 'discount') {
        await feeService.discounts.remove(id);
        setFeesDiscounts((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (e) {
      setError(e.message || 'Failed to delete item');
    }
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (currentSubTab === 'collect' && (optionsLoading || sectionsLoading || optionsError || sectionsError)) {
      setError(optionsError || sectionsError || 'Wait for fee form options to load.'); return;
    }

    if (savingRef.current) {
      return;
    }
    savingRef.current = true;
    setIsSaving(true);

    try {
      if (editingItem) {
        const id = editingItem.id;
        if (currentSubTab === 'collect') {
          const updated = await feeService.collections.update(id, collectionPayload(modalFormData, editingItem));
          setCollectList((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
        } else if (currentSubTab === 'type') {
          const updated = await feeService.types.update(id, {
            name: modalFormData.name,
            status: modalFormData.status === 'Select Status' ? editingItem.status : modalFormData.status
          });
          setFeesTypes((prev) => prev.map((ft) => (ft.id === id ? { ...ft, ...updated } : ft)));
        } else if (currentSubTab === 'group') {
          const updated = await feeService.groups.update(id, {
            name: modalFormData.name,
            feesType: modalFormData.feesType,
            status: modalFormData.status === 'Select Status' ? editingItem.status : modalFormData.status
          });
          setFeesGroups((prev) => prev.map((fg) => (fg.id === id ? { ...fg, ...updated } : fg)));
        } else if (currentSubTab === 'discount') {
          const updated = await feeService.discounts.update(id, discountPayload(modalFormData));
          setFeesDiscounts((prev) => prev.map((fd) => (fd.id === id ? { ...fd, ...updated } : fd)));
        }
      } else {
        if (currentSubTab === 'collect') {
          const created = await feeService.collections.create(collectionPayload(modalFormData));
          setCollectList((prev) => [{ ...created, sl: String(prev.length + 1).padStart(2, '0') }, ...prev]);
        } else if (currentSubTab === 'type') {
          const created = await feeService.types.create({
            name: modalFormData.name || 'New Fees Type',
            status: modalFormData.status === 'Select Status' ? 'Active' : modalFormData.status
          });
          setFeesTypes((prev) => [{ ...created, sl: String(prev.length + 1).padStart(2, '0') }, ...prev]);
        } else if (currentSubTab === 'group') {
          const created = await feeService.groups.create({
            name: modalFormData.name || 'Class 9 (A) Fees',
            feesType: modalFormData.feesType || 'May month fees, Admission fees, Exam fees',
            status: modalFormData.status === 'Select Status' ? 'Active' : modalFormData.status
          });
          setFeesGroups((prev) => [{ ...created, sl: String(prev.length + 1).padStart(2, '0') }, ...prev]);
        } else if (currentSubTab === 'discount') {
          const created = await feeService.discounts.create(discountPayload(modalFormData));
          setFeesDiscounts((prev) => [{ ...created, sl: String(prev.length + 1).padStart(2, '0') }, ...prev]);
        }
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (e) {
      setError(e.message || 'Failed to save item');
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
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

      {isLoading && !collectList.length && !feesTypes.length && !feesGroups.length && !feesDiscounts.length && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading fees data...
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
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Discount Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Applicable Fee Type</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Discount Type</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Discount Value</th>
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
                          row={row}
                          busyKey={busyKey}
                          isOpen={activeDropdownId === row.id}
                          onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          onViewReceipt={() => handleOpenReceiptModal(row)}
                          onEdit={() => handleOpenEditModal(row)}
                          onDelete={() => runAction(`delete-${row.id}`, () => handleDeleteItem(row.id))}
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
                          row={row}
                          busyKey={busyKey}
                          isOpen={activeDropdownId === row.id}
                          onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          onEdit={() => handleOpenEditModal(row)}
                          onDelete={() => runAction(`delete-${row.id}`, () => handleDeleteItem(row.id))}
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
                          row={row}
                          busyKey={busyKey}
                          isOpen={activeDropdownId === row.id}
                          onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          onEdit={() => handleOpenEditModal(row)}
                          onDelete={() => runAction(`delete-${row.id}`, () => handleDeleteItem(row.id))}
                        />
                      </td>
                    </tr>
                  ))}

              {/* 4. Render Fees Discount (Screenshot 3) */}
              {currentSubTab === 'discount' &&
                feesDiscounts
                  .filter(fd => [fd.name, fd.feesType, fd.discountType, discountValueLabel(fd), fd.status].some(value => String(value || '').toLowerCase().includes(searchTerm.toLowerCase())))
                  .map((row, index) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => toggleSelectRow(row.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--text-secondary)' }}>{String(index + 1).padStart(2, '0')}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>{row.name}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.feesType || 'All fee types'}</td>
                      <td style={{ padding: '14px 16px' }}>{row.discountType || '—'}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>{discountValueLabel(row)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={row.status} />
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                        <ActionDropdownCell
                          row={row}
                          busyKey={busyKey}
                          isOpen={activeDropdownId === row.id}
                          onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          onEdit={() => handleOpenEditModal(row)}
                          onDelete={() => runAction(`delete-${row.id}`, () => handleDeleteItem(row.id))}
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
              {error && <p role="alert" style={{ color: '#ef4444' }}>{error}</p>}
              {/* Collect Fees Drawer Form */}
              {currentSubTab === 'collect' && (
                <>
                  {optionsError && <p role="alert">{optionsError} Close and reopen this form to retry.</p>}
                  {sectionsError && <p role="alert">{sectionsError} Select the class again to retry.</p>}
                  {!optionsLoading && !optionsError && !classes.length && <p role="status">No active classes. Ask an administrator to add a class and its sections.</p>}
                  {!optionsLoading && !optionsError && !activeOptions(feesTypes).length && <p role="status">No active fee types. Add a fee type in Fees Type before collecting fees.</p>}
                  {!optionsLoading && !optionsError && !paymentTypes.length && <p role="status">No active payment methods are configured.</p>}
                  {modalFormData.className && !sectionsLoading && !sectionsError && !sections.length && <p role="status">No active sections are assigned to this class.</p>}
                  <div>
                    <label htmlFor="collect-fee-type" style={{ display: 'block', marginBottom: 6 }}>Fee Type</label>
                    <select id="collect-fee-type" required style={inputStyle} value={modalFormData.feeTypeId}
                      disabled={optionsLoading || !!optionsError}
                      onChange={e => setModalFormData({ ...modalFormData, feeTypeId: e.target.value, discountId: '' })}>
                      <option value="">Select a fee type</option>
                      {activeOptions(feesTypes).map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label htmlFor="collect-class" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Class
                      </label>
                      <select id="collect-class"
                        value={modalFormData.className}
                        onChange={(e) => { setSections([]); setModalFormData({ ...modalFormData, className: e.target.value, section: '', rollNo: '' }); }}
                        required disabled={optionsLoading || !!optionsError}
                        style={inputStyle}
                      >
                        <option value="">{optionsLoading ? 'Loading classes...' : 'Select a class'}</option>
                        {classes.map(name => <option key={name} value={name}>{name}</option>)}
                      </select>
                    </div>

                    <div style={{ flex: 1 }}>
                      <label htmlFor="collect-section" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Section
                      </label>
                      <select id="collect-section"
                        value={modalFormData.section}
                        onChange={(e) => setModalFormData({ ...modalFormData, section: e.target.value, rollNo: '' })}
                        required disabled={!modalFormData.className || sectionsLoading || !!sectionsError}
                        style={inputStyle}
                      >
                        <option value="">{sectionsLoading ? 'Loading sections...' : 'Select a section'}</option>
                        {sections.map(section => <option key={section.id} value={section.name}>{section.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label htmlFor="collect-roll" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Roll No
                      </label>
                      <input id="collect-roll"
                        type="text"
                        placeholder="Enter roll no."
                        required
                        value={modalFormData.rollNo}
                        onChange={(e) => setModalFormData({ ...modalFormData, rollNo: e.target.value })}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label htmlFor="collect-date" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Date
                      </label>
                      <input id="collect-date"
                        type="date"
                        required
                        value={modalFormData.date}
                        onChange={(e) => setModalFormData({ ...modalFormData, date: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label htmlFor="collect-amount" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Amount</label>

                      </div>
                      <input id="collect-amount"
                        type="number" min="0.01" step="0.01"
                        placeholder="Enter fee amount"
                        value={modalFormData.amount}
                        onChange={(e) => setModalFormData({ ...modalFormData, amount: e.target.value })}
                        style={inputStyle}
                        required
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label htmlFor="collect-discount" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Discount
                      </label>
                      <select id="collect-discount"
                        value={modalFormData.discountId}
                        disabled={optionsLoading || !modalFormData.feeTypeId || !!optionsError}
                        onChange={(e) => setModalFormData({ ...modalFormData, discountId: e.target.value })}
                        style={inputStyle}
                      >
                        <option value="">No discount</option>
                        {discountOptions.map(discount => <option key={discount.id} value={discount.id}>{discount.name} ({discount.discountValue}{discount.discountType === 'Percentage' && !String(discount.discountValue).includes('%') ? '%' : ''})</option>)}
                      </select>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                        {!modalFormData.feeTypeId ? 'Select a fee type first.' : !discountOptions.length ? 'No active discounts apply to this fee type.' : 'Only active discounts for this fee type or all fee types are shown.'}
                      </p>
                    </div>
                  </div>

                  <PaymentTypePicker
                    value={modalFormData.paymentType} methods={paymentTypes} inputStyle={inputStyle}
                    disabled={optionsLoading || !!optionsError}
                    onChange={paymentType => setModalFormData(previous => ({ ...previous, paymentType }))}
                    onCreated={created => setPaymentTypes(previous => [...previous.filter(method => method.id !== created.id), created])}
                  />

                  <div>
                    <label htmlFor="collect-note" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Note
                    </label>
                    <textarea id="collect-note"
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
                      Discount Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sibling Discount"
                      value={modalFormData.name}
                      onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="discount-fee-type" style={{ display: 'block', marginBottom: 6 }}>Applicable Fee Type</label>
                    <select id="discount-fee-type" value={modalFormData.feesType || 'All'}
                      onChange={e => setModalFormData({ ...modalFormData, feesType: e.target.value })} style={inputStyle}>
                      <option value="All">All fee types</option>
                      {activeOptions(feesTypes).map(type => <option key={type.id} value={type.name}>{type.name}</option>)}
                    </select>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6 }}>Choose which fee type this discount applies to. All fee types makes it available for every fee collection.</p>
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
                        type="number" min="0" step="0.01" max={modalFormData.discountType === 'Percentage' ? 100 : undefined} required
                        placeholder={modalFormData.discountType === 'Percentage' ? 'e.g. 10 (10%)' : 'e.g. 200'}
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
                disabled={isSaving || (currentSubTab === 'collect' && (optionsLoading || sectionsLoading || !!optionsError || !!sectionsError || !classes.length || !sections.length || !activeOptions(feesTypes).length || !paymentTypes.length))}
                style={{
                  padding: '10px 36px',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
                }}
              >
                {isSaving ? <><Spinner size={16} color="#ffffff" /> Saving...</> : 'Save'}
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
              <div><strong>Student Name</strong> : {viewingReceiptItem.name || '—'}</div>
              <div><strong>Date:</strong> {viewingReceiptItem.date || '—'}</div>
              <div><strong>Class</strong> : {viewingReceiptItem.className || '—'} / {viewingReceiptItem.section || '—'}</div>
              <div><strong>Fee Type</strong> : {viewingReceiptItem.feeType || '—'}</div>
              <div><strong>Discount</strong> : {viewingReceiptItem.discount || 'None'} ({viewingReceiptItem.discountAmount || '0.00'})</div>
              <div><strong>Payment Type</strong> : {viewingReceiptItem.paymentType || '—'}</div>

              <div><strong>Roll No.</strong> : {viewingReceiptItem.rollNo || '—'}</div>

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
                <div>{viewingReceiptItem.amount ?? '0.00'}</div>
                <div style={{ color: '#10b981' }}>{viewingReceiptItem.paid ?? '0.00'}</div>
                <div style={{ color: '#ef4444' }}>{viewingReceiptItem.due ?? '0.00'}</div>
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
const ActionDropdownCell = ({ isOpen, onToggle, onViewReceipt, onEdit, onDelete, row, busyKey }) => {
  const isDeleting = busyKey === `delete-${row.id}`;
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
            disabled={isDeleting}
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
            {isDeleting ? <Spinner size={14} color="#ef4444" /> : <Trash2 size={14} />} Delete
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
