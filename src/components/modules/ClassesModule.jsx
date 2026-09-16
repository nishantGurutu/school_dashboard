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
  ChevronDown
} from 'lucide-react';
import { classService } from '../../services/classService';
import { useApiAction } from '../../hooks/useApiAction';
import { Spinner } from '../ui/Spinner';

export const ClassesModule = () => {
  const { activeTab, setActiveTab } = useTheme();

  // Determine current active sub-tab (section, subjects, class-list, class-room)
  const getSubTabFromActiveTab = () => {
    if (activeTab === 'classes-subjects') return 'subjects';
    if (activeTab === 'classes-list') return 'classList';
    if (activeTab === 'classes-room') return 'classRoom';
    return 'section';
  };

  const [currentSubTab, setCurrentSubTab] = useState(getSubTabFromActiveTab());
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
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

  // Section State & Data (Screenshots 1 & 2)
  const [sections, setSections] = useState([]);

  // Subjects State & Data (Screenshots 3 & 4)
  const [subjects, setSubjects] = useState([]);

  // Class List State & Data (Screenshot 5)
  const [classList, setClassList] = useState([]);

  // Class Room State & Data (Matching User's Latest Screenshot)
  const [classRooms, setClassRooms] = useState([]);

  const fetchClassesData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [secRes, subRes, clsRes, roomRes] = await Promise.all([
        classService.sections.list(),
        classService.subjects.list(),
        classService.list.list(),
        classService.rooms.list()
      ]);
      const secItems = Array.isArray(secRes) ? secRes : [];
      const subItems = Array.isArray(subRes) ? subRes : [];
      const clsItems = Array.isArray(clsRes) ? clsRes : [];
      const roomItems = Array.isArray(roomRes) ? roomRes : [];
      setSections((prev) => (secItems.length ? secItems.map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })) : prev));
      setSubjects((prev) => (subItems.length ? subItems.map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })) : prev));
      setClassList((prev) => (clsItems.length ? clsItems.map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })) : prev));
      setClassRooms((prev) => (roomItems.length ? roomItems.map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })) : prev));
    } catch (e) {
      setError(e.message || 'Failed to load classes data');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchClassesData();
  }, [fetchClassesData]);

  // Modal Form State
  const [modalFormData, setModalFormData] = useState({
    name: '',
    code: '',
    section: '',
    room: '',
    capacity: '',
    status: 'Active'
  });

  const handleSubTabChange = (tabKey) => {
    setCurrentSubTab(tabKey);
    setActiveDropdownId(null);
    if (tabKey === 'section') setActiveTab('classes-section');
    if (tabKey === 'subjects') setActiveTab('classes-subjects');
    if (tabKey === 'classList') setActiveTab('classes-list');
    if (tabKey === 'classRoom') setActiveTab('classes-room');
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setModalFormData({
      name: '',
      code: '',
      section: 'A, B, C, D',
      room: '',
      capacity: '',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setActiveDropdownId(null);
    setModalFormData({
      name: item.name || item.room || '',
      code: item.code || '',
      section: item.section || '',
      room: item.room || '',
      capacity: item.capacity || '',
      status: item.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (id) => {
    setActiveDropdownId(null);
    try {
      if (currentSubTab === 'section') {
        await classService.sections.remove(id);
        setSections((prev) => prev.filter((item) => item.id !== id));
      } else if (currentSubTab === 'subjects') {
        await classService.subjects.remove(id);
        setSubjects((prev) => prev.filter((item) => item.id !== id));
      } else if (currentSubTab === 'classList') {
        await classService.list.remove(id);
        setClassList((prev) => prev.filter((item) => item.id !== id));
      } else if (currentSubTab === 'classRoom') {
        await classService.rooms.remove(id);
        setClassRooms((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (e) {
      setError(e.message || 'Failed to delete item');
    }
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();

    if (savingRef.current) {
      return;
    }
    savingRef.current = true;
    setIsSaving(true);

    try {
      if (editingItem) {
        const id = editingItem.id;
        if (currentSubTab === 'section') {
          const updated = await classService.sections.update(id, {
            name: modalFormData.name,
            status: modalFormData.status
          });
          setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
        } else if (currentSubTab === 'subjects') {
          const updated = await classService.subjects.update(id, {
            name: modalFormData.name,
            code: modalFormData.code,
            status: modalFormData.status
          });
          setSubjects((prev) => prev.map((sub) => (sub.id === id ? { ...sub, ...updated } : sub)));
        } else if (currentSubTab === 'classList') {
          const updated = await classService.list.update(id, {
            name: modalFormData.name,
            section: modalFormData.section,
            status: modalFormData.status
          });
          setClassList((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
        } else if (currentSubTab === 'classRoom') {
          const updated = await classService.rooms.update(id, {
            room: modalFormData.name,
            capacity: modalFormData.capacity,
            status: modalFormData.status
          });
          setClassRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
        }
      } else {
        if (currentSubTab === 'section') {
          const created = await classService.sections.create({
            name: modalFormData.name || 'New Section',
            status: modalFormData.status
          });
          setSections((prev) => [{ ...created, sl: String(prev.length + 1).padStart(2, '0') }, ...prev]);
        } else if (currentSubTab === 'subjects') {
          const created = await classService.subjects.create({
            name: modalFormData.name || 'New Subject',
            code: modalFormData.code || '',
            status: modalFormData.status
          });
          setSubjects((prev) => [{ ...created, sl: String(prev.length + 1).padStart(2, '0') }, ...prev]);
        } else if (currentSubTab === 'classList') {
          const created = await classService.list.create({
            name: modalFormData.name || 'New Class',
            section: modalFormData.section || 'A, B, C, D',
            status: modalFormData.status
          });
          setClassList((prev) => [{ ...created, sl: String(prev.length + 1).padStart(2, '0') }, ...prev]);
        } else if (currentSubTab === 'classRoom') {
          const created = await classService.rooms.create({
            room: modalFormData.name || '19',
            capacity: modalFormData.capacity || '50',
            status: modalFormData.status
          });
          setClassRooms((prev) => [{ ...created, sl: String(prev.length + 1).padStart(2, '0') }, ...prev]);
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
      case 'subjects':
        return {
          title: 'Subjects List',
          breadcrumb: 'Dashboard / Subjects List',
          addBtnLabel: '+ Add Subject',
          searchPlaceholder: 'Search...'
        };
      case 'classList':
        return {
          title: 'Class List',
          breadcrumb: 'Dashboard / Class List',
          addBtnLabel: '+ Add Class',
          searchPlaceholder: 'Search...'
        };
      case 'classRoom':
        return {
          title: 'Class Room List',
          breadcrumb: 'Dashboard / Class Room List',
          addBtnLabel: '+ Add Class Room',
          searchPlaceholder: 'Search...'
        };
      case 'section':
      default:
        return {
          title: 'Section Details',
          breadcrumb: 'Dashboard / Section Details',
          addBtnLabel: '+ Add Section',
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
              onClick={() => handleSubTabChange('section')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'section' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'section' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'section' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Section
            </button>

            <button
              onClick={() => handleSubTabChange('subjects')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'subjects' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'subjects' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'subjects' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Subjects
            </button>

            <button
              onClick={() => handleSubTabChange('classList')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'classList' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'classList' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'classList' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Class List
            </button>

            <button
              onClick={() => handleSubTabChange('classRoom')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'classRoom' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'classRoom' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'classRoom' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Class Room
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

      {isLoading && !sections.length && !subjects.length && !classList.length && !classRooms.length && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading classes data...
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
                      currentSubTab === 'section'
                        ? selectedRows.length === sections.length
                        : currentSubTab === 'subjects'
                        ? selectedRows.length === subjects.length
                        : currentSubTab === 'classList'
                        ? selectedRows.length === classList.length
                        : selectedRows.length === classRooms.length
                    }
                    onChange={() =>
                      toggleSelectAll(
                        currentSubTab === 'section'
                          ? sections
                          : currentSubTab === 'subjects'
                          ? subjects
                          : currentSubTab === 'classList'
                          ? classList
                          : classRooms
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

                {currentSubTab === 'section' && (
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Section Name</th>
                )}
                {currentSubTab === 'subjects' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Subject</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Code</th>
                  </>
                )}
                {currentSubTab === 'classList' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Section</th>
                  </>
                )}
                {currentSubTab === 'classRoom' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Room No</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Capacity</th>
                  </>
                )}

                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Render Section View (Screenshots 1 & 2) */}
              {currentSubTab === 'section' &&
                sections
                  .filter((sec) => sec.name.toLowerCase().includes(searchTerm.toLowerCase()))
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

              {/* Render Subjects View (Screenshots 3 & 4) */}
              {currentSubTab === 'subjects' &&
                subjects
                  .filter((sub) => sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.code}</td>
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

              {/* Render Class List View (Screenshot 5) */}
              {currentSubTab === 'classList' &&
                classList
                  .filter((cls) => cls.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.section}</td>
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

              {/* Render Class Room View (Latest Screenshot) */}
              {currentSubTab === 'classRoom' &&
                classRooms
                  .filter((rm) => rm.room.toLowerCase().includes(searchTerm.toLowerCase()))
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
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{row.room}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.capacity}</td>
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

      {/* Right Slide-over Modal / Drawer for Add/Edit Section, Subject, Class, Class Room */}
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
              maxWidth: '90vw',
              height: '100vh',
              backgroundColor: 'var(--bg-card)',
              boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.2)',
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingItem ? 'Edit ' : 'Add New '}
                {currentSubTab === 'section' && 'Section'}
                {currentSubTab === 'subjects' && 'Subject'}
                {currentSubTab === 'classList' && 'Class'}
                {currentSubTab === 'classRoom' && 'Class Room'}
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

            {/* Modal Form Body */}
            <form onSubmit={handleSaveModal} id="modal-form" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              {currentSubTab === 'section' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Section Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter section name"
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
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </>
              )}

              {currentSubTab === 'subjects' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Subjects Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter subjects name"
                      value={modalFormData.name}
                      onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Subjects Code
                    </label>
                    <input
                      type="text"
                      placeholder="Enter subjects code"
                      value={modalFormData.code}
                      onChange={(e) => setModalFormData({ ...modalFormData, code: e.target.value })}
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
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </>
              )}

              {currentSubTab === 'classList' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Class Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter class name"
                      value={modalFormData.name}
                      onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Section
                    </label>
                    <input
                      type="text"
                      placeholder="Enter section (e.g. A, B, C, D)"
                      value={modalFormData.section}
                      onChange={(e) => setModalFormData({ ...modalFormData, section: e.target.value })}
                      style={inputStyle}
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
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </>
              )}

              {currentSubTab === 'classRoom' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Room Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Class Room name"
                      value={modalFormData.name}
                      onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Capacity
                    </label>
                    <input
                      type="text"
                      placeholder="Enter room capacity"
                      value={modalFormData.capacity}
                      onChange={(e) => setModalFormData({ ...modalFormData, capacity: e.target.value })}
                      style={inputStyle}
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
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </>
              )}
            </form>

            {/* Modal Footer Buttons matching Screenshots */}
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
                form="modal-form"
                className="btn btn-primary"
                disabled={isSaving}
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
    </div>
  );
};

// Action Dropdown Cell Component for Edit and Delete Options
const ActionDropdownCell = ({ isOpen, onToggle, onEdit, onDelete, row, busyKey }) => {
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
            minWidth: '120px',
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
            <Edit size={14} color="#0d9488" /> Edit
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
