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
  Calendar,
  CheckCircle,
  Clock,
  BookOpen,
  Award
} from 'lucide-react';
import { examService } from '../../services/examService';
import { useApiAction } from '../../hooks/useApiAction';
import { Spinner } from '../ui/Spinner';

export const ExaminationsModule = () => {
  const { activeTab, setActiveTab } = useTheme();

  const getSubTabFromActiveTab = () => {
    if (activeTab === 'examinations-schedule') return 'schedule';
    if (activeTab === 'examinations-result') return 'result';
    return 'exam';
  };

  const [currentSubTab, setCurrentSubTab] = useState(getSubTabFromActiveTab());
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
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

  // 1. Exam List State & Data (Screenshots 1 & 2)
  const [exams, setExams] = useState([]);

  // 2. Exam Schedule State & Data (Screenshots 3 & 4)
  const [schedules, setSchedules] = useState([]);

  // 3. Exam Result State & Data (Screenshot 5)
  const [results, setResults] = useState([]);

  const fetchExamsData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [examRes, schedRes, resultRes] = await Promise.all([
        examService.exams.list(),
        examService.schedules.list(),
        examService.results.list()
      ]);
      const examItems = Array.isArray(examRes) ? examRes : [];
      const schedItems = Array.isArray(schedRes) ? schedRes : [];
      const resultItems = Array.isArray(resultRes) ? resultRes : [];
      setExams((prev) => (examItems.length ? examItems.map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })) : prev));
      setSchedules((prev) => (schedItems.length ? schedItems.map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })) : prev));
      setResults((prev) => (resultItems.length ? resultItems.map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })) : prev));
    } catch (e) {
      setError(e.message || 'Failed to load examination data');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchExamsData();
  }, [fetchExamsData]);

  // Modal Form State
  const [modalFormData, setModalFormData] = useState({
    name: '',
    date: '2026-09-15',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    status: 'Active',
    className: 'Class 1 (A)',
    section: 'Section A',
    room: '101',
    subject: 'English',
    duration: '3 Hours',
    admissionNo: 'AD52371',
    rollNo: '15',
    total: 600,
    percent: 85,
    grade: 'A',
    result: 'Pass'
  });

  const handleSubTabChange = (tabKey) => {
    setCurrentSubTab(tabKey);
    setActiveDropdownId(null);
    if (tabKey === 'exam') setActiveTab('examinations-exam');
    if (tabKey === 'schedule') setActiveTab('examinations-schedule');
    if (tabKey === 'result') setActiveTab('examinations-result');
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setModalFormData({
      name: '',
      date: '05 Jun 2015',
      startTime: '10:00 AM',
      endTime: '01:00 PM',
      status: 'Active',
      className: 'Class 1 (A)',
      section: 'Section A',
      room: '101',
      subject: 'English',
      duration: '3 Hours',
      admissionNo: 'AD52371',
      rollNo: '15',
      total: 600,
      percent: 85,
      grade: 'A',
      result: 'Pass'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setActiveDropdownId(null);
    setModalFormData({
      name: item.name || item.exam || '',
      date: item.date || '05 Jun 2015',
      startTime: item.startTime || '10:00 AM',
      endTime: item.endTime || '01:00 PM',
      status: item.status || 'Active',
      className: item.className || 'Class 1 (A)',
      section: 'Section A',
      room: item.room || '101',
      subject: item.subject || 'English',
      duration: item.duration || '3 Hours',
      admissionNo: item.admissionNo || 'AD52365',
      rollNo: item.rollNo || '12',
      total: item.total || 600,
      percent: item.percent || 85,
      grade: item.grade || 'A',
      result: item.result || 'Pass'
    });
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (item) => {
    setViewingItem(item);
    setActiveDropdownId(null);
    setIsDetailModalOpen(true);
  };

  const handleDeleteItem = async (id) => {
    setActiveDropdownId(null);
    try {
      if (currentSubTab === 'exam') {
        await examService.exams.remove(id);
        setExams((prev) => prev.filter((item) => item.id !== id));
      } else if (currentSubTab === 'schedule') {
        await examService.schedules.remove(id);
        setSchedules((prev) => prev.filter((item) => item.id !== id));
      } else if (currentSubTab === 'result') {
        await examService.results.remove(id);
        setResults((prev) => prev.filter((item) => item.id !== id));
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
        if (currentSubTab === 'exam') {
          const updated = await examService.exams.update(id, {
            name: modalFormData.name,
            date: modalFormData.date,
            startTime: modalFormData.startTime,
            endTime: modalFormData.endTime,
            status: modalFormData.status
          });
          setExams((prev) => prev.map((ex) => (ex.id === id ? { ...ex, ...updated } : ex)));
        } else if (currentSubTab === 'schedule') {
          const updated = await examService.schedules.update(id, {
            className: modalFormData.className,
            subject: modalFormData.subject,
            date: modalFormData.date,
            startTime: modalFormData.startTime,
            endTime: modalFormData.endTime,
            duration: modalFormData.duration,
            room: modalFormData.room
          });
          setSchedules((prev) => prev.map((sc) => (sc.id === id ? { ...sc, ...updated } : sc)));
        } else if (currentSubTab === 'result') {
          const updated = await examService.results.update(id, {
            name: modalFormData.name,
            admissionNo: modalFormData.admissionNo,
            rollNo: modalFormData.rollNo,
            className: modalFormData.className,
            exam: modalFormData.subject,
            total: modalFormData.total,
            percent: modalFormData.percent,
            grade: modalFormData.grade,
            result: modalFormData.result
          });
          setResults((prev) => prev.map((rs) => (rs.id === id ? { ...rs, ...updated } : rs)));
        }
      } else {
        if (currentSubTab === 'exam') {
          const created = await examService.exams.create({
            name: modalFormData.name || 'New Exam',
            date: modalFormData.date || '05 Jun 2015',
            startTime: modalFormData.startTime || '10:00 AM',
            endTime: modalFormData.endTime || '01:00 PM',
            status: modalFormData.status
          });
          setExams((prev) => [{ ...created, sl: String(prev.length + 1).padStart(2, '0') }, ...prev]);
        } else if (currentSubTab === 'schedule') {
          const created = await examService.schedules.create({
            className: modalFormData.className || 'Class 1 (A)',
            subject: modalFormData.subject || 'English',
            date: modalFormData.date || '05 Jun 2015',
            startTime: modalFormData.startTime || '10:00 AM',
            endTime: modalFormData.endTime || '01:00 PM',
            duration: modalFormData.duration || '3 hrs',
            room: modalFormData.room || '101'
          });
          setSchedules((prev) => [{ ...created, sl: String(prev.length + 1).padStart(2, '0') }, ...prev]);
        } else if (currentSubTab === 'result') {
          const created = await examService.results.create({
            admissionNo: modalFormData.admissionNo || 'AD52372',
            name: modalFormData.name || 'New Student Result',
            rollNo: modalFormData.rollNo || '21',
            className: modalFormData.className || 'Class 1 (A)',
            exam: 'Monthly Test',
            total: modalFormData.total || 620,
            percent: modalFormData.percent || 88,
            grade: modalFormData.grade || 'A',
            result: modalFormData.result || 'Pass'
          });
          setResults((prev) => [{ ...created, sl: String(prev.length + 1).padStart(2, '0') }, ...prev]);
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
      case 'schedule':
        return {
          title: 'Exam Schedule',
          breadcrumb: 'Dashboard / Exam Schedule',
          addBtnLabel: '+ Add Schedule',
          searchPlaceholder: 'Search...'
        };
      case 'result':
        return {
          title: 'Exam Result',
          breadcrumb: 'Dashboard / Exam Result',
          addBtnLabel: null,
          searchPlaceholder: 'Search...'
        };
      case 'exam':
      default:
        return {
          title: 'Exam List',
          breadcrumb: 'Dashboard / Exam List',
          addBtnLabel: '+ Add Exam',
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
              onClick={() => handleSubTabChange('exam')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'exam' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'exam' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'exam' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Exam
            </button>

            <button
              onClick={() => handleSubTabChange('schedule')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'schedule' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'schedule' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'schedule' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Exam Schedule
            </button>

            <button
              onClick={() => handleSubTabChange('result')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'result' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'result' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'result' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Exam Result
            </button>
          </div>

          {headerInfo.addBtnLabel && (
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

      {isLoading && !exams.length && !schedules.length && !results.length && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading examination data...
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
                      currentSubTab === 'exam'
                        ? selectedRows.length === exams.length
                        : currentSubTab === 'schedule'
                        ? selectedRows.length === schedules.length
                        : selectedRows.length === results.length
                    }
                    onChange={() =>
                      toggleSelectAll(
                        currentSubTab === 'exam'
                          ? exams
                          : currentSubTab === 'schedule'
                          ? schedules
                          : results
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

                {currentSubTab === 'exam' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Exam Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Exam Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Start Time</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>End Time</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  </>
                )}

                {currentSubTab === 'schedule' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Class</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Subject</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Exam Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Start Time</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>End Time</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Duration</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Room</th>
                  </>
                )}

                {currentSubTab === 'result' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Admission No</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Roll No</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Class</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Exam</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Grand Total</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Percent (%)</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Grade</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Result</th>
                  </>
                )}

                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* 1. Render Exam List (Screenshot 1) */}
              {currentSubTab === 'exam' &&
                exams
                  .filter((ex) => ex.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.date}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.startTime}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.endTime}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={row.status} />
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                        <ActionDropdownCell
                          row={row}
                          busyKey={busyKey}
                          isOpen={activeDropdownId === row.id}
                          onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          onView={() => handleOpenViewModal(row)}
                          onEdit={() => handleOpenEditModal(row)}
                          onDelete={() => runAction(`delete-${row.id}`, () => handleDeleteItem(row.id))}
                        />
                      </td>
                    </tr>
                  ))}

              {/* 2. Render Exam Schedule (Screenshot 3) */}
              {currentSubTab === 'schedule' &&
                schedules
                  .filter((sc) => sc.subject.toLowerCase().includes(searchTerm.toLowerCase()) || sc.className.toLowerCase().includes(searchTerm.toLowerCase()))
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
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{row.className}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.subject}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.date}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.startTime}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.endTime}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.duration}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>{row.room}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                        <ActionDropdownCell
                          row={row}
                          busyKey={busyKey}
                          isOpen={activeDropdownId === row.id}
                          onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          onView={() => handleOpenViewModal(row)}
                          onEdit={() => handleOpenEditModal(row)}
                          onDelete={() => runAction(`delete-${row.id}`, () => handleDeleteItem(row.id))}
                        />
                      </td>
                    </tr>
                  ))}

              {/* 3. Render Exam Result (Screenshot 5) */}
              {currentSubTab === 'result' &&
                results
                  .filter((rs) => rs.name.toLowerCase().includes(searchTerm.toLowerCase()) || rs.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()))
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
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.exam}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{row.total}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{row.percent}%</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{row.grade}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={row.result} />
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                        <ActionDropdownCell
                          row={row}
                          busyKey={busyKey}
                          isOpen={activeDropdownId === row.id}
                          onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          onView={() => handleOpenViewModal(row)}
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

      {/* Slide-over Drawer Modal for Add/Edit Exam & Add/Edit Schedule (Screenshots 2 & 4) */}
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
                {editingItem ? 'Edit ' : 'Add New '}
                {currentSubTab === 'exam' && 'Exam'}
                {currentSubTab === 'schedule' && 'Exam Schedule'}
                {currentSubTab === 'result' && 'Student Result'}
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
            <form onSubmit={handleSaveModal} id="exam-modal-form" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}>
              {/* Exam Form Fields (Screenshot 2) */}
              {currentSubTab === 'exam' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Exam Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Exam name"
                      value={modalFormData.name}
                      onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Exam Date
                      </label>
                      <input
                        type="text"
                        placeholder="dd/mm/yyyy"
                        value={modalFormData.date}
                        onChange={(e) => setModalFormData({ ...modalFormData, date: e.target.value })}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Start Time
                      </label>
                      <input
                        type="text"
                        placeholder="dd/mm/yyyy"
                        value={modalFormData.startTime}
                        onChange={(e) => setModalFormData({ ...modalFormData, startTime: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        End Time
                      </label>
                      <input
                        type="text"
                        placeholder="dd/mm/yyyy"
                        value={modalFormData.endTime}
                        onChange={(e) => setModalFormData({ ...modalFormData, endTime: e.target.value })}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Status
                      </label>
                      <select
                        value={modalFormData.status}
                        onChange={(e) => setModalFormData({ ...modalFormData, status: e.target.value })}
                        style={inputStyle}
                      >
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Schedule Form Fields (Screenshot 4) */}
              {currentSubTab === 'schedule' && (
                <>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Exam Name (Class)
                      </label>
                      <select
                        value={modalFormData.className}
                        onChange={(e) => setModalFormData({ ...modalFormData, className: e.target.value })}
                        style={inputStyle}
                      >
                        <option value="Class 1 (A)">Class 1 (A)</option>
                        <option value="Class 2 (B)">Class 2 (B)</option>
                        <option value="Class 3 (C)">Class 3 (C)</option>
                        <option value="Class 4 (A)">Class 4 (A)</option>
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
                        <option value="Section A">Select a Section</option>
                        <option value="Section A">Section A</option>
                        <option value="Section B">Section B</option>
                        <option value="Section C">Section C</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Room
                      </label>
                      <select
                        value={modalFormData.room}
                        onChange={(e) => setModalFormData({ ...modalFormData, room: e.target.value })}
                        style={inputStyle}
                      >
                        <option value="101">101</option>
                        <option value="102">102</option>
                        <option value="103">103</option>
                        <option value="104">104</option>
                      </select>
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Subject
                      </label>
                      <select
                        value={modalFormData.subject}
                        onChange={(e) => setModalFormData({ ...modalFormData, subject: e.target.value })}
                        style={inputStyle}
                      >
                        <option value="English">English</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Science">Science</option>
                        <option value="History">History</option>
                        <option value="Physics">Physics</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Exam Date
                      </label>
                      <input
                        type="text"
                        placeholder="dd/mm/yyyy"
                        value={modalFormData.date}
                        onChange={(e) => setModalFormData({ ...modalFormData, date: e.target.value })}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Start Time
                      </label>
                      <input
                        type="text"
                        placeholder="dd/mm/yyyy"
                        value={modalFormData.startTime}
                        onChange={(e) => setModalFormData({ ...modalFormData, startTime: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        End Time
                      </label>
                      <input
                        type="text"
                        placeholder="dd/mm/yyyy"
                        value={modalFormData.endTime}
                        onChange={(e) => setModalFormData({ ...modalFormData, endTime: e.target.value })}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Duration
                      </label>
                      <input
                        type="text"
                        placeholder="3 Hours"
                        value={modalFormData.duration}
                        onChange={(e) => setModalFormData({ ...modalFormData, duration: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Result Form Fields */}
              {currentSubTab === 'result' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Student Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter student name"
                      value={modalFormData.name}
                      onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Admission No
                      </label>
                      <input
                        type="text"
                        value={modalFormData.admissionNo}
                        onChange={(e) => setModalFormData({ ...modalFormData, admissionNo: e.target.value })}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Roll No
                      </label>
                      <input
                        type="text"
                        value={modalFormData.rollNo}
                        onChange={(e) => setModalFormData({ ...modalFormData, rollNo: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Grand Total
                      </label>
                      <input
                        type="number"
                        value={modalFormData.total}
                        onChange={(e) => setModalFormData({ ...modalFormData, total: e.target.value })}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Percent (%)
                      </label>
                      <input
                        type="number"
                        value={modalFormData.percent}
                        onChange={(e) => setModalFormData({ ...modalFormData, percent: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Grade
                      </label>
                      <input
                        type="text"
                        value={modalFormData.grade}
                        onChange={(e) => setModalFormData({ ...modalFormData, grade: e.target.value })}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                        Result Status
                      </label>
                      <select
                        value={modalFormData.result}
                        onChange={(e) => setModalFormData({ ...modalFormData, result: e.target.value })}
                        style={inputStyle}
                      >
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                      </select>
                    </div>
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
                form="exam-modal-form"
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

      {/* View Details Pop-up Dialog Modal */}
      {isDetailModalOpen && viewingItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            padding: '20px'
          }}
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card animate-fade-in"
            style={{
              width: '500px',
              maxWidth: '95vw',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d9488' }}>
                View Examination Details
              </h3>
              <button onClick={() => setIsDetailModalOpen(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              {currentSubTab === 'exam' && (
                <>
                  <div><strong>Exam Title:</strong> {viewingItem.name}</div>
                  <div><strong>Exam Date:</strong> {viewingItem.date}</div>
                  <div><strong>Timing:</strong> {viewingItem.startTime} - {viewingItem.endTime}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong>Status:</strong> <StatusBadge status={viewingItem.status} />
                  </div>
                </>
              )}

              {currentSubTab === 'schedule' && (
                <>
                  <div><strong>Class & Section:</strong> {viewingItem.className}</div>
                  <div><strong>Subject:</strong> {viewingItem.subject}</div>
                  <div><strong>Scheduled Date:</strong> {viewingItem.date}</div>
                  <div><strong>Time Slot:</strong> {viewingItem.startTime} to {viewingItem.endTime} ({viewingItem.duration})</div>
                  <div><strong>Assigned Classroom:</strong> Room {viewingItem.room}</div>
                </>
              )}

              {currentSubTab === 'result' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
                    <img src={viewingItem.avatar} alt={viewingItem.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{viewingItem.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Admission: {viewingItem.admissionNo} | Roll: {viewingItem.rollNo}</div>
                    </div>
                  </div>
                  <div><strong>Class Grade:</strong> {viewingItem.className}</div>
                  <div><strong>Exam Type:</strong> {viewingItem.exam}</div>
                  <div><strong>Grand Total Score:</strong> {viewingItem.total}</div>
                  <div><strong>Percentage Achieved:</strong> {viewingItem.percent}%</div>
                  <div><strong>Grade Letter:</strong> {viewingItem.grade}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong>Result:</strong> <StatusBadge status={viewingItem.result} />
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <button
                className="btn btn-primary"
                onClick={() => setIsDetailModalOpen(false)}
                style={{ backgroundColor: '#0d9488', padding: '8px 24px' }}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Action Dropdown Cell Component with View Details, Edit, and Delete options
const ActionDropdownCell = ({ isOpen, onToggle, onView, onEdit, onDelete, row, busyKey }) => {
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
            minWidth: '130px',
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
            <Eye size={14} color="#2563eb" /> View Details
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
  const isGood = status === 'Active' || status === 'Pass';
  const isPending = status === 'Pending';
  const isScheduled = status === 'Scheduled';
  const isBad = status === 'Closed' || status === 'Fail';

  let bgColor = '#dcfce7';
  let textColor = '#15803d';

  if (isPending) {
    bgColor = '#fef3c7';
    textColor = '#b45309';
  } else if (isScheduled) {
    bgColor = '#dbeafe';
    textColor = '#1d4ed8';
  } else if (isBad) {
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
