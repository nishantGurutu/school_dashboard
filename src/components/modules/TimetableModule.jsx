import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Calendar,
  Clock,
  BookOpen,
  UserCheck,
  Plus,
  Search,
  Trash2,
  Edit,
  Layers,
  Grid,
  List,
  Filter,
  CheckCircle,
  AlertCircle,
  X,
  DoorOpen,
  GraduationCap,
  RefreshCw,
  MoreVertical,
  Check
} from 'lucide-react';
import { timetableService } from '../../services/timetableService';
import { classService } from '../../services/classService';
import { subjectService } from '../../services/subjectService';
import { teacherService } from '../../services/teacherService';

const DAYS_OF_WEEK = [
  { key: 'Mon', label: 'Monday', short: 'Mon' },
  { key: 'Tue', label: 'Tuesday', short: 'Tue' },
  { key: 'Wed', label: 'Wednesday', short: 'Wed' },
  { key: 'Thu', label: 'Thursday', short: 'Thu' },
  { key: 'Fri', label: 'Friday', short: 'Fri' },
  { key: 'Sat', label: 'Saturday', short: 'Sat' }
];

const STANDARD_PERIODS = [
  { name: 'Period 1', start: '09:00 AM', end: '09:45 AM' },
  { name: 'Period 2', start: '09:45 AM', end: '10:30 AM' },
  { name: 'Period 3', start: '10:45 AM', end: '11:30 AM' },
  { name: 'Period 4', start: '11:30 AM', end: '12:15 PM' },
  { name: 'Period 5', start: '01:00 PM', end: '01:45 PM' },
  { name: 'Period 6', start: '01:45 PM', end: '02:30 PM' },
  { name: 'Period 7', start: '02:30 PM', end: '03:15 PM' },
  { name: 'Period 8', start: '03:15 PM', end: '04:00 PM' }
];

const DEFAULT_CLASSES = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
];

const DEFAULT_SECTIONS = ['A', 'B', 'C', 'D'];

const SUBJECT_COLORS = [
  { bg: 'rgba(13, 148, 136, 0.1)', text: '#0d9488', border: 'rgba(13, 148, 136, 0.25)' },
  { bg: 'rgba(37, 99, 235, 0.1)', text: '#2563eb', border: 'rgba(37, 99, 235, 0.25)' },
  { bg: 'rgba(147, 51, 234, 0.1)', text: '#9333ea', border: 'rgba(147, 51, 234, 0.25)' },
  { bg: 'rgba(217, 119, 6, 0.1)', text: '#d97706', border: 'rgba(217, 119, 6, 0.25)' },
  { bg: 'rgba(225, 29, 72, 0.1)', text: '#e11d48', border: 'rgba(225, 29, 72, 0.25)' },
  { bg: 'rgba(5, 150, 105, 0.1)', text: '#059669', border: 'rgba(5, 150, 105, 0.25)' }
];

export const TimetableModule = () => {
  const { setActiveTab } = useTheme();

  // Filter States - Default to Class 6, Section A as requested in flow
  const [selectedClass, setSelectedClass] = useState('Class 6');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedDayFilter, setSelectedDayFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Data States
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [availableClasses, setAvailableClasses] = useState(DEFAULT_CLASSES);
  const [availableSections, setAvailableSections] = useState(DEFAULT_SECTIONS);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  // Form State
  const initialForm = {
    className: 'Class 6',
    section: 'A',
    dayOfWeek: 'Mon',
    periodName: 'Period 1',
    subject: '',
    teacherName: '',
    classroom: 'Room 101',
    startTime: '09:00 AM',
    endTime: '09:45 AM',
    status: 'Active'
  };
  const [formData, setFormData] = useState(initialForm);

  // Auto-dismiss success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Load auxiliary options (classes, sections, subjects, teachers, rooms) from API
  useEffect(() => {
    const loadAuxData = async () => {
      try {
        const [clsRes, secRes, subRes, tchRes, roomRes] = await Promise.allSettled([
          classService.classes.list(),
          classService.sections.list(),
          classService.subjects.list(),
          teacherService.list(),
          classService.rooms.list()
        ]);

        if (clsRes.status === 'fulfilled' && clsRes.value) {
          const raw = Array.isArray(clsRes.value) ? clsRes.value : (clsRes.value.content || clsRes.value.data || []);
          const apiClassNames = raw.map(c => c.name || c.className).filter(Boolean);
          const combined = Array.from(new Set([...apiClassNames, ...DEFAULT_CLASSES]));
          if (combined.length > 0) setAvailableClasses(combined);
        }

        if (secRes.status === 'fulfilled' && secRes.value) {
          const raw = Array.isArray(secRes.value) ? secRes.value : (secRes.value.content || secRes.value.data || []);
          const secNames = Array.from(new Set(raw.map(s => (s.name || s.section || (typeof s === 'string' ? s : '')).trim()).filter(Boolean)));
          if (secNames.length > 0) setAvailableSections(secNames);
        }

        if (subRes.status === 'fulfilled' && subRes.value) {
          const raw = Array.isArray(subRes.value) ? subRes.value : (subRes.value.content || subRes.value.data || []);
          setAvailableSubjects(raw);
        }

        if (tchRes.status === 'fulfilled' && tchRes.value) {
          const raw = Array.isArray(tchRes.value) ? tchRes.value : (tchRes.value.content || tchRes.value.data || []);
          setAvailableTeachers(raw);
        }

        if (roomRes.status === 'fulfilled' && roomRes.value) {
          const raw = Array.isArray(roomRes.value) ? roomRes.value : (roomRes.value.content || roomRes.value.data || []);
          setAvailableRooms(raw);
        }
      } catch (err) {
        console.warn('Failed to fetch auxiliary dropdown data:', err);
      }
    };

    loadAuxData();
  }, []);

  // Fetch timetable slots based on filters
  const fetchTimetable = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedClass && selectedClass !== 'all') params.className = selectedClass;
      if (selectedSection && selectedSection !== 'all') params.section = selectedSection;

      const data = await timetableService.list(params);
      const list = Array.isArray(data) ? data : [];
      setTimetableSlots(list);
    } catch (err) {
      console.error('Failed to load timetable:', err);
      setError(err.message || 'Failed to load timetable schedule');
    } finally {
      setIsLoading(false);
    }
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  // Filter slots for search and day
  const filteredSlots = useMemo(() => {
    return timetableSlots.filter(slot => {
      // Day filter
      if (selectedDayFilter !== 'all') {
        const slotDay = (slot.dayOfWeek || '').toLowerCase();
        const filterDay = selectedDayFilter.toLowerCase();
        if (!slotDay.startsWith(filterDay.substring(0, 3))) return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const sub = (slot.subject || '').toLowerCase();
        const tch = (slot.teacherName || '').toLowerCase();
        const rm = (slot.classroom || '').toLowerCase();
        const p = (slot.periodName || '').toLowerCase();
        return sub.includes(query) || tch.includes(query) || rm.includes(query) || p.includes(query);
      }
      return true;
    });
  }, [timetableSlots, selectedDayFilter, searchTerm]);

  // Open modal for Adding new slot
  const handleOpenAddModal = (presetDay = null) => {
    setEditingSlot(null);
    const defaultSec = selectedSection !== 'all' ? selectedSection : (availableSections[0] || 'A');
    const defaultSub = availableSubjects.length > 0 ? (availableSubjects[0].name || availableSubjects[0]) : '';
    setFormData({
      ...initialForm,
      className: selectedClass !== 'all' ? selectedClass : (availableClasses[0] || 'Class 6'),
      section: defaultSec,
      dayOfWeek: presetDay || (selectedDayFilter !== 'all' ? selectedDayFilter : 'Mon'),
      subject: defaultSub,
      teacherName: availableTeachers.length > 0
        ? `${availableTeachers[0].firstName || ''} ${availableTeachers[0].lastName || ''}`.trim()
        : ''
    });
    setError('');
    setIsModalOpen(true);
  };

  // Open modal for Editing existing slot
  const handleOpenEditModal = (slot) => {
    setEditingSlot(slot);
    setFormData({
      className: slot.className || 'Class 6',
      section: slot.section || 'A',
      dayOfWeek: slot.dayOfWeek || 'Mon',
      periodName: slot.periodName || 'Period 1',
      subject: slot.subject || '',
      teacherName: slot.teacherName || '',
      classroom: slot.classroom || 'Room 101',
      startTime: slot.startTime || '09:00 AM',
      endTime: slot.endTime || '09:45 AM',
      status: slot.status || 'Active'
    });
    setError('');
    setIsModalOpen(true);
  };

  // Quick period preset selector
  const handlePeriodChange = (periodName) => {
    const matched = STANDARD_PERIODS.find(p => p.name === periodName);
    if (matched) {
      setFormData(prev => ({
        ...prev,
        periodName: matched.name,
        startTime: matched.start,
        endTime: matched.end
      }));
    } else {
      setFormData(prev => ({ ...prev, periodName }));
    }
  };

  // Save (Create or Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.className || !formData.section || !formData.dayOfWeek || !formData.subject || !formData.startTime || !formData.endTime) {
      setError('Please fill in all required fields (Class, Section, Day, Subject, Start & End Time)');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      if (editingSlot) {
        await timetableService.update(editingSlot.id, formData);
        setSuccessMessage(`Timetable slot for ${formData.subject} updated successfully!`);
      } else {
        await timetableService.create(formData);
        setSuccessMessage(`New timetable slot created for ${formData.className} (${formData.section}) - ${formData.subject}!`);
      }
      setIsModalOpen(false);
      await fetchTimetable();
    } catch (err) {
      setError(err.message || 'Failed to save timetable slot');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete slot
  const handleDeleteSlot = async (slotId, subjectName) => {
    if (!window.confirm(`Are you sure you want to delete this ${subjectName} period?`)) {
      return;
    }
    try {
      await timetableService.delete(slotId);
      setSuccessMessage('Timetable slot deleted successfully');
      await fetchTimetable();
    } catch (err) {
      setError(err.message || 'Failed to delete slot');
    }
  };

  // Helper color picker for subjects
  const getSubjectColor = (subject = '') => {
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % SUBJECT_COLORS.length;
    return SUBJECT_COLORS[idx];
  };

  return (
    <div className="timetable-module" style={{ padding: '24px 28px', minHeight: '85vh' }}>
      {/* Top Header & Navigation Subtabs */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#0d9488', fontWeight: 600, marginBottom: '4px' }}>
              <span>Academic</span>
              <span>/</span>
              <span>Timetable</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Class Timetable Management
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Configure and assign class schedules, subjects, and teachers. Synced live to Student, Teacher & Parent mobile apps.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => fetchTimetable()}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
              title="Refresh Timetable"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => handleOpenAddModal()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(13, 148, 136, 0.3)'
              }}
            >
              <Plus size={18} />
              <span>+ Add Timetable Slot</span>
            </button>
          </div>
        </div>

        {/* Sub-tab navigation bar matching Academic / Classes */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '20px',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--card-bg, #f1f5f9)',
            width: 'fit-content',
            border: '1px solid var(--border-color, #e2e8f0)'
          }}
        >
          <button
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: '#0d9488',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Calendar size={15} /> Timetable
          </button>
          <button
            onClick={() => setActiveTab('classes-section')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={15} /> Section
          </button>
          <button
            onClick={() => setActiveTab('classes-subjects')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BookOpen size={15} /> Subjects
          </button>
          <button
            onClick={() => setActiveTab('classes-list')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <GraduationCap size={15} /> Class List
          </button>
          <button
            onClick={() => setActiveTab('classes-room')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <DoorOpen size={15} /> Class Room
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div
          style={{
            padding: '12px 18px',
            marginBottom: '16px',
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
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '12px 18px',
            marginBottom: '16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#b91c1c',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div
        style={{
          padding: '18px 20px',
          borderRadius: 'var(--radius-lg, 12px)',
          backgroundColor: 'var(--surface-color, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          {/* Class, Section, and Day Selectors */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
            {/* Class Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Select Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--input-bg, #ffffff)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  outline: 'none',
                  minWidth: '130px',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Classes</option>
                {availableClasses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Section Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Select Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--input-bg, #ffffff)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  outline: 'none',
                  minWidth: '110px',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Sections</option>
                {availableSections.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Day Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Day of Week
              </label>
              <select
                value={selectedDayFilter}
                onChange={(e) => setSelectedDayFilter(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--input-bg, #ffffff)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  outline: 'none',
                  minWidth: '120px',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Days (Mon-Sat)</option>
                {DAYS_OF_WEEK.map(d => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Box & View Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--input-bg, #ffffff)',
                minWidth: '220px'
              }}
            >
              <Search size={16} color="var(--text-muted, #94a3b8)" />
              <input
                type="text"
                placeholder="Search subject, teacher, room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  width: '100%'
                }}
              />
              {searchTerm && (
                <X size={14} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSearchTerm('')} />
              )}
            </div>

            {/* Grid vs Table View Toggle */}
            <div
              style={{
                display: 'flex',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--card-bg, #f1f5f9)',
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => setViewMode('grid')}
                title="Weekly Schedule Grid"
                style={{
                  padding: '7px 12px',
                  border: 'none',
                  backgroundColor: viewMode === 'grid' ? '#0d9488' : 'transparent',
                  color: viewMode === 'grid' ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <Grid size={15} /> Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="Tabular List"
                style={{
                  padding: '7px 12px',
                  border: 'none',
                  backgroundColor: viewMode === 'table' ? '#0d9488' : 'transparent',
                  color: viewMode === 'table' ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <List size={15} /> List
              </button>
            </div>
          </div>
        </div>

        {/* Current Active Filter Indicator Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed var(--border-color)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Filter:</span>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '12px',
              backgroundColor: 'rgba(13, 148, 136, 0.1)',
              color: '#0d9488',
              fontSize: '0.8rem',
              fontWeight: 700
            }}
          >
            {selectedClass} • {selectedSection === 'all' ? 'All Sections' : selectedSection}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredSlots.length}</strong> scheduled periods
          </span>
        </div>
      </div>

      {/* Main Content Area: Weekly Grid View OR Table View */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 16px', color: '#0d9488' }} />
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>Loading timetable records...</p>
        </div>
      ) : filteredSlots.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'var(--surface-color)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-color)'
          }}
        >
          <Calendar size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
            No Timetable Slots Found
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 18px' }}>
            There are currently no scheduled periods for <strong>{selectedClass} ({selectedSection})</strong>. Click the button below to add the first period.
          </p>
          <button
            onClick={() => handleOpenAddModal()}
            style={{
              padding: '9px 18px',
              backgroundColor: '#0d9488',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            + Create First Timetable Slot
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* WEEKLY MATRIX GRID VIEW */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            alignItems: 'start'
          }}
        >
          {DAYS_OF_WEEK.map(dayObj => {
            if (selectedDayFilter !== 'all' && selectedDayFilter !== dayObj.key) {
              return null;
            }

            const daySlots = filteredSlots.filter(s => {
              const d = (s.dayOfWeek || '').toLowerCase();
              return d.startsWith(dayObj.key.toLowerCase());
            });

            return (
              <div
                key={dayObj.key}
                style={{
                  backgroundColor: 'var(--surface-color, #ffffff)',
                  borderRadius: 'var(--radius-lg, 12px)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Day Header */}
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'var(--card-header-bg, #f8fafc)',
                    borderBottom: '1px solid var(--border-color, #e2e8f0)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: '#0d9488',
                        color: '#ffffff',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {dayObj.short}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {dayObj.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      backgroundColor: 'var(--border-color)',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}
                  >
                    {daySlots.length} Periods
                  </span>
                </div>

                {/* Day Slots List */}
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '140px' }}>
                  {daySlots.length === 0 ? (
                    <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <p style={{ margin: 0, fontSize: '0.825rem' }}>No periods scheduled</p>
                    </div>
                  ) : (
                    daySlots.map(slot => {
                      const colorStyle = getSubjectColor(slot.subject);
                      return (
                        <div
                          key={slot.id}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '10px',
                            backgroundColor: colorStyle.bg,
                            border: `1px solid ${colorStyle.border}`,
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                color: colorStyle.text,
                                letterSpacing: '0.5px'
                              }}
                            >
                              {slot.periodName || 'Period'}
                            </span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                onClick={() => handleOpenEditModal(slot)}
                                title="Edit Slot"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: 'var(--text-secondary)',
                                  padding: '2px',
                                  borderRadius: '4px'
                                }}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteSlot(slot.id, slot.subject)}
                                title="Delete Slot"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#ef4444',
                                  padding: '2px',
                                  borderRadius: '4px'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                            {slot.subject}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            <UserCheck size={14} color="#0d9488" />
                            <span style={{ fontWeight: 600 }}>{slot.teacherName || 'Teacher Not Assigned'}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: `1px dashed ${colorStyle.border}`, fontSize: '0.775rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                              <Clock size={13} color="var(--text-muted)" />
                              <span>{slot.startTime} – {slot.endTime}</span>
                            </div>
                            {slot.classroom && (
                              <span
                                style={{
                                  padding: '2px 6px',
                                  borderRadius: '6px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                  border: `1px solid ${colorStyle.border}`,
                                  fontWeight: 700,
                                  color: colorStyle.text,
                                  fontSize: '0.725rem'
                                }}
                              >
                                {slot.classroom}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Quick Add Button For this Day */}
                  <button
                    onClick={() => handleOpenAddModal(dayObj.key)}
                    style={{
                      marginTop: '6px',
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px dashed var(--border-color)',
                      backgroundColor: 'transparent',
                      color: '#0d9488',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <Plus size={14} /> Add Period for {dayObj.short}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div
          style={{
            backgroundColor: 'var(--surface-color, #ffffff)',
            borderRadius: 'var(--radius-lg, 12px)',
            border: '1px solid var(--border-color, #e2e8f0)',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--card-header-bg, #f8fafc)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Day</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Period</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Subject</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Class & Section</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Assigned Faculty</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Time</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Room</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSlots.map((slot, index) => {
                  const color = getSubjectColor(slot.subject);
                  return (
                    <tr
                      key={slot.id || index}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--card-bg, #f1f5f9)',
                            fontSize: '0.8rem',
                            fontWeight: 700
                          }}
                        >
                          {slot.dayOfWeek}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {slot.periodName}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            backgroundColor: color.bg,
                            color: color.text,
                            fontWeight: 700
                          }}
                        >
                          {slot.subject}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {slot.className} - {slot.section}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <UserCheck size={14} color="#0d9488" />
                          <span>{slot.teacherName || '—'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                        {slot.startTime} – {slot.endTime}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {slot.classroom || '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '10px',
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          {slot.status || 'Active'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenEditModal(slot)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              backgroundColor: 'transparent',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer'
                            }}
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot.id, slot.subject)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #fecaca',
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              cursor: 'pointer'
                            }}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT TIMETABLE MODAL */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--surface-color, #ffffff)',
              borderRadius: 'var(--radius-lg, 16px)',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid var(--border-color, #e2e8f0)'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {editingSlot ? 'Edit Timetable Slot' : 'Add Timetable Slot'}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Assign period, subject & teacher for chosen class & section
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {/* Class */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Class <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'var(--input-bg, #ffffff)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  >
                    {availableClasses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Section <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'var(--input-bg, #ffffff)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  >
                    {availableSections.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {/* Day of Week */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Day of Week <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'var(--input-bg, #ffffff)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  >
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d.key} value={d.key}>{d.label} ({d.short})</option>
                    ))}
                  </select>
                </div>

                {/* Period Preset */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Period / Time Slot
                  </label>
                  <select
                    value={formData.periodName}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'var(--input-bg, #ffffff)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  >
                    {STANDARD_PERIODS.map(p => (
                      <option key={p.name} value={p.name}>{p.name} ({p.start} - {p.end})</option>
                    ))}
                    <option value="Zero Period">Zero Period</option>
                    <option value="Activity Slot">Activity Slot</option>
                    <option value="Remedial Slot">Remedial Slot</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Subject <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'var(--input-bg, #ffffff)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  >
                    <option value="">-- Select Registered Subject --</option>
                    {availableSubjects.length > 0 ? (
                      availableSubjects.map(sub => {
                        const subName = typeof sub === 'string' ? sub : (sub.name || '');
                        const subCode = typeof sub === 'object' && sub.code ? ` (${sub.code})` : '';
                        const key = typeof sub === 'object' && sub.id ? sub.id : subName;
                        return (
                          <option key={key} value={subName}>
                            {subName}{subCode}
                          </option>
                        );
                      })
                    ) : (
                      <option value="" disabled>Loading subjects or none found</option>
                    )}
                  </select>
                  <input
                    type="text"
                    placeholder="Or type custom subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'var(--input-bg, #ffffff)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              {/* Assign Teacher */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Assign Teacher / Faculty
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={formData.teacherName}
                    onChange={(e) => {
                      const sel = availableTeachers.find(t => `${t.firstName || ''} ${t.lastName || ''}`.trim() === e.target.value);
                      setFormData({
                        ...formData,
                        teacherName: e.target.value,
                        teacherId: sel ? sel.id : null
                      });
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'var(--input-bg, #ffffff)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  >
                    <option value="">-- Select Teacher --</option>
                    {availableTeachers.map(t => {
                      const name = `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.name;
                      return (
                        <option key={t.id || name} value={name}>
                          {name} {t.department ? `(${t.department})` : ''}
                        </option>
                      );
                    })}
                    <option value="Ms. Priya Sharma">Ms. Priya Sharma (Maths)</option>
                    <option value="Mr. Rajesh Sharma">Mr. Rajesh Sharma (English)</option>
                    <option value="Dr. Verma">Dr. Verma (Science)</option>
                    <option value="Mrs. Neha Gupta">Mrs. Neha Gupta (Social Studies)</option>
                    <option value="Ms. Kulkarni">Ms. Kulkarni (Computer)</option>
                    <option value="Mr. Suresh Joshi">Mr. Suresh Joshi (Hindi)</option>
                    <option value="Coach Rawat">Coach Rawat (Physical Ed.)</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Or enter teacher name"
                    value={formData.teacherName}
                    onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'var(--input-bg, #ffffff)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              {/* Time & Classroom */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {/* Start Time */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Start Time <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'var(--input-bg, #ffffff)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                {/* End Time */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    End Time <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 09:45 AM"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'var(--input-bg, #ffffff)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                {/* Room */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Classroom / Room
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room 101"
                    value={formData.classroom}
                    onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'var(--input-bg, #ffffff)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)'
                  }}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>{editingSlot ? 'Update Timetable Slot' : 'Save Timetable Slot'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableModule;
