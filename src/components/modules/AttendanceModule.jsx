import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Search,
  Download,
  Filter,
  ChevronDown,
  X,
  Calendar,
  CheckCircle,
  Clock,
  UserCheck,
  Award
} from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { useApiAction } from '../../hooks/useApiAction';
import { Spinner } from '../ui/Spinner';

export const AttendanceModule = () => {
  const { activeTab, setActiveTab } = useTheme();

  const getSubTabFromActiveTab = () => {
    if (activeTab === 'attendance-teacher') return 'teacher';
    if (activeTab === 'attendance-employee') return 'employee';
    return 'student';
  };

  const [currentSubTab, setCurrentSubTab] = useState(getSubTabFromActiveTab());
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { busyKey, runAction } = useApiAction();

  useEffect(() => {
    setCurrentSubTab(getSubTabFromActiveTab());
    setIsFilterOpen(false);
  }, [activeTab]);

  // Attendance data loaded from backend per active tab
  const [studentList, setStudentList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const normalizeStatus = (status) => {
    if (!status) return 'Present';
    const s = String(status).toLowerCase().replace(/[_ -]/g, '');
    if (s.includes('half')) return 'Halfday';
    if (s.includes('late')) return 'Late';
    if (s.includes('absent')) return 'Absent';
    if (s.includes('holiday')) return 'Holiday';
    return 'Present';
  };

  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const type = currentSubTab === 'teacher' ? 'TEACHER' : currentSubTab === 'employee' ? 'EMPLOYEE' : 'STUDENT';
      const result = await attendanceService.list(`type=${type}`);
      const items = (Array.isArray(result) ? result : []).map((r, i) => ({
        ...r,
        sl: String(i + 1).padStart(2, '0'),
        attendance: normalizeStatus(r.status)
      }));
      if (currentSubTab === 'student') setStudentList(items);
      else if (currentSubTab === 'teacher') setTeacherList(items);
      else setEmployeeList(items);
    } catch (e) {
      setError(e.message || 'Failed to load attendance');
    } finally {
      setIsLoading(false);
    }
  }, [currentSubTab]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Filter Form State
  const [studentFilter, setStudentFilter] = useState({
    className: 'Class 1',
    section: 'Section A',
    date: '2026-09-06'
  });

  const [teacherFilter, setTeacherFilter] = useState({
    subject: 'English',
    date: '2026-09-06'
  });

  const [employeeFilter, setEmployeeFilter] = useState({
    department: 'Principal',
    designation: 'English',
    date: '2026-09-06'
  });

  const [appliedStudentFilter, setAppliedStudentFilter] = useState(null);
  const [appliedTeacherFilter, setAppliedTeacherFilter] = useState(null);
  const [appliedEmployeeFilter, setAppliedEmployeeFilter] = useState(null);

  const handleSubTabChange = (tabKey) => {
    setCurrentSubTab(tabKey);
    setIsFilterOpen(false);
    if (tabKey === 'student') setActiveTab('attendance-student');
    if (tabKey === 'teacher') setActiveTab('attendance-teacher');
    if (tabKey === 'employee') setActiveTab('attendance-employee');
  };

  // Toggle Attendance Radio selection
  const handleAttendanceChange = async (id, status) => {
    try {
      const currentRow =
        currentSubTab === 'student'
          ? studentList.find((s) => s.id === id)
          : currentSubTab === 'teacher'
          ? teacherList.find((t) => t.id === id)
          : employeeList.find((e) => e.id === id);
      if (currentRow) {
        await attendanceService.update(id, { ...currentRow, status });
      }
      if (currentSubTab === 'student') {
        setStudentList((prev) => prev.map((s) => (s.id === id ? { ...s, attendance: status } : s)));
      } else if (currentSubTab === 'teacher') {
        setTeacherList((prev) => prev.map((t) => (t.id === id ? { ...t, attendance: status } : t)));
      } else if (currentSubTab === 'employee') {
        setEmployeeList((prev) => prev.map((e) => (e.id === id ? { ...e, attendance: status } : e)));
      }
    } catch (e) {
      setError(e.message || 'Failed to update attendance');
    }
  };

  // Update Note field
  const handleNoteChange = (id, noteText) => {
    if (currentSubTab === 'student') {
      setStudentList((prev) => prev.map((s) => (s.id === id ? { ...s, note: noteText } : s)));
    } else if (currentSubTab === 'teacher') {
      setTeacherList((prev) => prev.map((t) => (t.id === id ? { ...t, note: noteText } : t)));
    } else if (currentSubTab === 'employee') {
      setEmployeeList((prev) => prev.map((e) => (e.id === id ? { ...e, note: noteText } : e)));
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

  const handleApplyFilter = () => {
    if (currentSubTab === 'student') {
      setAppliedStudentFilter(studentFilter);
    } else if (currentSubTab === 'teacher') {
      setAppliedTeacherFilter(teacherFilter);
    } else if (currentSubTab === 'employee') {
      setAppliedEmployeeFilter(employeeFilter);
    }
    setIsFilterOpen(false);
  };

  const handleResetFilter = () => {
    if (currentSubTab === 'student') {
      setStudentFilter({ className: 'Class 1', section: 'Section A', date: '2026-09-06' });
      setAppliedStudentFilter(null);
    } else if (currentSubTab === 'teacher') {
      setTeacherFilter({ subject: 'English', date: '2026-09-06' });
      setAppliedTeacherFilter(null);
    } else if (currentSubTab === 'employee') {
      setEmployeeFilter({ department: 'Principal', designation: 'English', date: '2026-09-06' });
      setAppliedEmployeeFilter(null);
    }
    setIsFilterOpen(false);
  };

  const getHeaderInfo = () => {
    switch (currentSubTab) {
      case 'teacher':
        return {
          title: 'Teacher Attendance',
          breadcrumb: 'Dashboard / Teacher Attendance'
        };
      case 'employee':
        return {
          title: 'Employee Attendance',
          breadcrumb: 'Dashboard / Employee Attendance'
        };
      case 'student':
      default:
        return {
          title: 'Student Attendance',
          breadcrumb: 'Dashboard / Student Attendance'
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
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{headerInfo.title}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{headerInfo.breadcrumb}</p>
        </div>

        {/* Sub-Nav Tabs */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-app)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <button
            onClick={() => handleSubTabChange('student')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: currentSubTab === 'student' ? '#0d9488' : 'transparent',
              color: currentSubTab === 'student' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: currentSubTab === 'student' ? 700 : 500,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Student Attendance
          </button>

          <button
            onClick={() => handleSubTabChange('teacher')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: currentSubTab === 'teacher' ? '#0d9488' : 'transparent',
              color: currentSubTab === 'teacher' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: currentSubTab === 'teacher' ? 700 : 500,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Teacher Attendance
          </button>

          <button
            onClick={() => handleSubTabChange('employee')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: currentSubTab === 'employee' ? '#0d9488' : 'transparent',
              color: currentSubTab === 'employee' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: currentSubTab === 'employee' ? 700 : 500,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Employee Attendance
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

      {isLoading && !studentList.length && !teacherList.length && !employeeList.length && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading attendance...
        </div>
      )}

      {/* Main Table Card */}
      <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', position: 'relative' }}>
        {/* Controls Toolbar Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
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

            {/* Filter Toggle Button */}
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                style={{
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: isFilterOpen ? '#e0f2fe' : undefined,
                  borderColor: isFilterOpen ? '#0284c7' : undefined
                }}
              >
                <Filter size={14} /> Filter <ChevronDown size={14} />
              </button>

              {/* Filter Popover Modal (Screenshots 4 & 5) */}
              {isFilterOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '44px',
                    left: 0,
                    width: '360px',
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '16px',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.18)',
                    border: '1px solid var(--border-color)',
                    padding: '20px',
                    zIndex: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    animation: 'fadeIn 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Filter</h4>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Student Attendance Filter Form (Class, Section, Date) */}
                  {currentSubTab === 'student' && (
                    <>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>Class</label>
                          <select
                            value={studentFilter.className}
                            onChange={(e) => setStudentFilter({ ...studentFilter, className: e.target.value })}
                            style={filterInputStyle}
                          >
                            <option value="Class 1">Class 1</option>
                            <option value="Class 2">Class 2</option>
                            <option value="Class 3">Class 3</option>
                            <option value="Class 4">Class 4</option>
                            <option value="Class 5">Class 5</option>
                          </select>
                        </div>

                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>Section</label>
                          <select
                            value={studentFilter.section}
                            onChange={(e) => setStudentFilter({ ...studentFilter, section: e.target.value })}
                            style={filterInputStyle}
                          >
                            <option value="Section A">Section A</option>
                            <option value="Section B">Section B</option>
                            <option value="Section C">Section C</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>Date</label>
                        <input
                          type="date"
                          value={studentFilter.date}
                          onChange={(e) => setStudentFilter({ ...studentFilter, date: e.target.value })}
                          style={filterInputStyle}
                        />
                      </div>
                    </>
                  )}

                  {/* Teacher Attendance Filter Form (Subject, Date - Screenshot 5) */}
                  {currentSubTab === 'teacher' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>Subject</label>
                        <select
                          value={teacherFilter.subject}
                          onChange={(e) => setTeacherFilter({ ...teacherFilter, subject: e.target.value })}
                          style={filterInputStyle}
                        >
                          <option value="English">English</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Physics">Physics</option>
                          <option value="Biology">Biology</option>
                          <option value="Chemistry">Chemistry</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>Date</label>
                        <input
                          type="date"
                          value={teacherFilter.date}
                          onChange={(e) => setTeacherFilter({ ...teacherFilter, date: e.target.value })}
                          style={filterInputStyle}
                        />
                      </div>
                    </>
                  )}

                  {/* Employee Attendance Filter Form (Departments, Designation, Date - Screenshot 4) */}
                  {currentSubTab === 'employee' && (
                    <>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>Departments</label>
                          <select
                            value={employeeFilter.department}
                            onChange={(e) => setEmployeeFilter({ ...employeeFilter, department: e.target.value })}
                            style={filterInputStyle}
                          >
                            <option value="Principal">Principal</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Physics">Physics</option>
                            <option value="Biology">Biology</option>
                            <option value="English">English</option>
                            <option value="Chemistry">Chemistry</option>
                          </select>
                        </div>

                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>Designation</label>
                          <select
                            value={employeeFilter.designation}
                            onChange={(e) => setEmployeeFilter({ ...employeeFilter, designation: e.target.value })}
                            style={filterInputStyle}
                          >
                            <option value="English">English</option>
                            <option value="Principal">Principal</option>
                            <option value="Senior Teacher">Senior Teacher</option>
                            <option value="Subject Teacher">Subject Teacher</option>
                            <option value="Assistant Teacher">Assistant Teacher</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>Date</label>
                        <input
                          type="date"
                          value={employeeFilter.date}
                          onChange={(e) => setEmployeeFilter({ ...employeeFilter, date: e.target.value })}
                          style={filterInputStyle}
                        />
                      </div>
                    </>
                  )}

                  {/* Filter Action Buttons (Reset & Apply - Screenshots 4 & 5) */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={handleResetFilter}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        backgroundColor: '#fecdd3',
                        color: '#9f1239',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Reset
                    </button>

                    <button
                      type="button"
                      onClick={handleApplyFilter}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        backgroundColor: '#0d9488',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
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
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 16px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={
                      currentSubTab === 'student'
                        ? selectedRows.length === studentList.length
                        : currentSubTab === 'teacher'
                        ? selectedRows.length === teacherList.length
                        : selectedRows.length === employeeList.length
                    }
                    onChange={() =>
                      toggleSelectAll(
                        currentSubTab === 'student'
                          ? studentList
                          : currentSubTab === 'teacher'
                          ? teacherList
                          : employeeList
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
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Admission No</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Name</th>

                {currentSubTab === 'student' && (
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Class</th>
                )}

                {currentSubTab === 'teacher' && (
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Class</th>
                )}

                {currentSubTab === 'employee' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Departments</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Designation</th>
                  </>
                )}

                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Attendance</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Note</th>
              </tr>
            </thead>
            <tbody>
              {/* 1. Student Attendance Table (Screenshot 1) */}
              {currentSubTab === 'student' &&
                studentList
                  .filter((s) => {
                    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
                    if (!appliedStudentFilter) return matchesSearch;
                    return matchesSearch && s.className.includes(appliedStudentFilter.className);
                  })
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
                          <img src={row.avatar} alt={row.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Roll No: {row.rollNo}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>{row.className}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <AttendanceRadioGroup
                          id={row.id}
                          selectedStatus={row.attendance}
                          busy={busyKey === `attendance-${row.id}`}
                          onChange={(status) => runAction(`attendance-${row.id}`, () => handleAttendanceChange(row.id, status))}
                        />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="text"
                          placeholder="Write note..."
                          value={row.note}
                          onChange={(e) => handleNoteChange(row.id, e.target.value)}
                          style={tableNoteInputStyle}
                        />
                      </td>
                    </tr>
                  ))}

              {/* 2. Teacher Attendance Table (Screenshot 2) */}
              {currentSubTab === 'teacher' &&
                teacherList
                  .filter((t) => {
                    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
                    if (!appliedTeacherFilter) return matchesSearch;
                    return matchesSearch && t.className.toLowerCase() === appliedTeacherFilter.subject.toLowerCase();
                  })
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
                          <img src={row.avatar} alt={row.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                          <span style={{ fontWeight: 700 }}>{row.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>{row.className}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <AttendanceRadioGroup
                          id={row.id}
                          selectedStatus={row.attendance}
                          busy={busyKey === `attendance-${row.id}`}
                          onChange={(status) => runAction(`attendance-${row.id}`, () => handleAttendanceChange(row.id, status))}
                        />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="text"
                          placeholder="Write note..."
                          value={row.note}
                          onChange={(e) => handleNoteChange(row.id, e.target.value)}
                          style={tableNoteInputStyle}
                        />
                      </td>
                    </tr>
                  ))}

              {/* 3. Employee Attendance Table (Screenshot 3) */}
              {currentSubTab === 'employee' &&
                employeeList
                  .filter((e) => {
                    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
                    if (!appliedEmployeeFilter) return matchesSearch;
                    return matchesSearch && e.department.toLowerCase() === appliedEmployeeFilter.department.toLowerCase();
                  })
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
                          <img src={row.avatar} alt={row.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                          <span style={{ fontWeight: 700 }}>{row.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>{row.department}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>{row.designation}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <AttendanceRadioGroup
                          id={row.id}
                          selectedStatus={row.attendance}
                          busy={busyKey === `attendance-${row.id}`}
                          onChange={(status) => runAction(`attendance-${row.id}`, () => handleAttendanceChange(row.id, status))}
                        />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="text"
                          placeholder="Write note..."
                          value={row.note}
                          onChange={(e) => handleNoteChange(row.id, e.target.value)}
                          style={tableNoteInputStyle}
                        />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Inline Attendance Radio Group Component matching screenshots
const AttendanceRadioGroup = ({ id, selectedStatus, onChange, busy }) => {
  const options = ['Present', 'Late', 'Absent', 'Halfday', 'Holiday'];

  if (busy) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'nowrap' }}>
        <Spinner size={16} color="#0d9488" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'nowrap' }}>
      {options.map((opt) => {
        const isChecked = selectedStatus === opt;
        return (
          <label
            key={opt}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              fontWeight: isChecked ? 600 : 400,
              userSelect: 'none'
            }}
          >
            <input
              type="radio"
              name={`attendance-radio-${id}`}
              checked={isChecked}
              onChange={() => onChange(opt)}
              style={{
                accentColor: '#0d9488',
                cursor: 'pointer',
                width: '14px',
                height: '14px'
              }}
            />
            <span>{opt}</span>
          </label>
        );
      })}
    </div>
  );
};

const filterInputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-app)',
  color: 'var(--text-primary)',
  fontSize: '0.85rem',
  outline: 'none'
};

const tableNoteInputStyle = {
  width: '180px',
  padding: '6px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-app)',
  color: 'var(--text-primary)',
  fontSize: '0.8rem',
  outline: 'none'
};
