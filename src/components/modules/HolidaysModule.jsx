import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  Calendar,
  Sparkles,
  Users,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Printer,
  RefreshCw,
  Tag,
  CalendarRange,
  List,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { holidayService } from '../../services/holidayService';
import { Spinner } from '../ui/Spinner';

// Curated aesthetic palettes for dynamic categories
const CATEGORY_PALETTES = [
  { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.14)', border: 'rgba(59, 130, 246, 0.3)' },
  { color: '#10b981', bg: 'rgba(16, 185, 129, 0.14)', border: 'rgba(16, 185, 129, 0.3)' },
  { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.3)' },
  { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.14)', border: 'rgba(139, 92, 246, 0.3)' },
  { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.14)', border: 'rgba(236, 72, 153, 0.3)' },
  { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.14)', border: 'rgba(6, 182, 212, 0.3)' },
  { color: '#f97316', bg: 'rgba(249, 115, 22, 0.14)', border: 'rgba(249, 115, 22, 0.3)' },
  { color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.14)', border: 'rgba(20, 184, 166, 0.3)' },
  { color: '#d946ef', bg: 'rgba(217, 70, 239, 0.14)', border: 'rgba(217, 70, 239, 0.3)' },
  { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.14)', border: 'rgba(99, 102, 241, 0.3)' }
];

const getCategoryTheme = (category = '') => {
  if (!category) return CATEGORY_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CATEGORY_PALETTES.length;
  return CATEGORY_PALETTES[index];
};

export const HolidaysModule = () => {
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Dynamic View & Filter States
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'calendar'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState('ALL'); // 'ALL' | 'UPCOMING' | 'ACTIVE_TODAY' | 'THIS_MONTH' | 'PAST'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [monthFilter, setMonthFilter] = useState('ALL');
  const [targetFilter, setTargetFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date-asc'); // 'date-asc' | 'date-desc' | 'title-asc' | 'duration-desc'

  // Calendar Navigation State
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [dayDetailModal, setDayDetailModal] = useState(null); // { date: 'YYYY-MM-DD', holidays: [...] }

  // Custom Category State inside Modal
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    endDate: '',
    category: 'National Holiday',
    target: 'ALL',
    description: ''
  });

  // Auto-dismiss success notification
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch Holidays
  const fetchHolidays = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await holidayService.list();
      if (Array.isArray(result)) {
        setHolidays(result);
      } else if (result?.data && Array.isArray(result.data)) {
        setHolidays(result.data);
      } else if (result?.content && Array.isArray(result.content)) {
        setHolidays(result.content);
      } else {
        setHolidays([]);
      }
    } catch (e) {
      setError(e.message || 'Failed to fetch school holidays');
      setHolidays([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  // Dynamic Date & Duration Helpers
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const calculateDuration = useCallback((startStr, endStr) => {
    if (!startStr) return 1;
    const end = endStr || startStr;
    try {
      const d1 = new Date(startStr + 'T00:00:00');
      const d2 = new Date(end + 'T00:00:00');
      const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  }, []);

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getRelativeStatus = useCallback((startStr, endStr) => {
    const end = endStr || startStr;
    if (startStr <= todayStr && todayStr <= end) {
      return { label: 'Today (Active)', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', isLive: true };
    }
    if (startStr > todayStr) {
      try {
        const d1 = new Date(todayStr + 'T00:00:00');
        const d2 = new Date(startStr + 'T00:00:00');
        const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) return { label: 'Tomorrow', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
        if (diffDays <= 7) return { label: `In ${diffDays} days`, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
        if (diffDays <= 30) return { label: `In ${Math.ceil(diffDays / 7)} weeks`, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' };
        return { label: `Upcoming`, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)' };
      } catch {
        return { label: 'Upcoming', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
      }
    }
    return { label: 'Past', color: 'var(--text-muted)', bg: 'rgba(156, 163, 175, 0.14)' };
  }, [todayStr]);

  // Dynamic Statistics
  const dynamicStats = useMemo(() => {
    const totalEvents = holidays.length;
    const totalDaysOff = holidays.reduce((sum, h) => sum + calculateDuration(h.date, h.endDate), 0);
    const upcomingCount = holidays.filter((h) => (h.endDate || h.date) >= todayStr).length;
    const activeTodayCount = holidays.filter((h) => h.date <= todayStr && todayStr <= (h.endDate || h.date)).length;
    const currentMonthPrefix = todayStr.slice(0, 7);
    const thisMonthCount = holidays.filter((h) => (h.date && h.date.startsWith(currentMonthPrefix)) || (h.endDate && h.endDate.startsWith(currentMonthPrefix))).length;
    const pastCount = holidays.filter((h) => (h.endDate || h.date) < todayStr).length;

    // Dynamic Category distribution map
    const categoryCounts = {};
    holidays.forEach((h) => {
      const cat = h.category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    return {
      totalEvents,
      totalDaysOff,
      upcomingCount,
      activeTodayCount,
      thisMonthCount,
      pastCount,
      categoryCounts
    };
  }, [holidays, todayStr, calculateDuration]);

  // Dynamically Extracted Filter Options
  const dynamicCategories = useMemo(() => {
    const cats = Array.from(new Set(holidays.map((h) => h.category).filter(Boolean)));
    const defaultList = ['National Holiday', 'Festival', 'School Vacation', 'Gazetted Holiday', 'Observance', 'Emergency / Weather'];
    defaultList.forEach((c) => {
      if (!cats.includes(c)) cats.push(c);
    });
    return cats;
  }, [holidays]);

  const dynamicYears = useMemo(() => {
    const currentYear = new Date().getFullYear().toString();
    const years = Array.from(new Set([...holidays.map((h) => h.date?.slice(0, 4)), currentYear].filter(Boolean)));
    return years.sort();
  }, [holidays]);

  const monthOptions = [
    { value: 'ALL', label: 'All Months' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  // Dynamic Filtering & Sorting
  const filteredHolidays = useMemo(() => {
    return holidays
      .filter((h) => {
        // Search Term (matches title, description, category, date)
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchTitle = (h.title || '').toLowerCase().includes(q);
          const matchDesc = (h.description || '').toLowerCase().includes(q);
          const matchCat = (h.category || '').toLowerCase().includes(q);
          const matchDate = (h.date || '').includes(q) || (h.endDate || '').includes(q);
          if (!matchTitle && !matchDesc && !matchCat && !matchDate) return false;
        }

        // Status Tab Filter
        const end = h.endDate || h.date;
        if (statusTab === 'UPCOMING' && end < todayStr) return false;
        if (statusTab === 'ACTIVE_TODAY' && !(h.date <= todayStr && todayStr <= end)) return false;
        if (statusTab === 'THIS_MONTH') {
          const currentMonthPrefix = todayStr.slice(0, 7);
          const inMonth = (h.date && h.date.startsWith(currentMonthPrefix)) || (h.endDate && h.endDate.startsWith(currentMonthPrefix));
          if (!inMonth) return false;
        }
        if (statusTab === 'PAST' && end >= todayStr) return false;

        // Category Filter
        if (categoryFilter !== 'ALL' && h.category !== categoryFilter) return false;

        // Year Filter
        if (yearFilter !== 'ALL') {
          const holidayYear = h.date?.slice(0, 4);
          const holidayEndYear = h.endDate?.slice(0, 4);
          if (holidayYear !== yearFilter && holidayEndYear !== yearFilter) return false;
        }

        // Month Filter
        if (monthFilter !== 'ALL') {
          const holidayMonth = h.date?.slice(5, 7);
          const holidayEndMonth = h.endDate?.slice(5, 7);
          if (holidayMonth !== monthFilter && holidayEndMonth !== monthFilter) return false;
        }

        // Target Filter
        if (targetFilter !== 'ALL' && h.target !== targetFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-asc') {
          return (a.date || '').localeCompare(b.date || '');
        }
        if (sortBy === 'date-desc') {
          return (b.date || '').localeCompare(a.date || '');
        }
        if (sortBy === 'title-asc') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (sortBy === 'duration-desc') {
          const durA = calculateDuration(a.date, a.endDate);
          const durB = calculateDuration(b.date, b.endDate);
          return durB - durA;
        }
        return 0;
      });
  }, [
    holidays,
    searchTerm,
    statusTab,
    categoryFilter,
    yearFilter,
    monthFilter,
    targetFilter,
    sortBy,
    todayStr,
    calculateDuration
  ]);

  // Modal Handlers
  const handleOpenAddModal = (presetDate = null) => {
    setEditingHoliday(null);
    setIsCustomCategory(false);
    setFormData({
      title: '',
      date: presetDate || new Date().toISOString().split('T')[0],
      endDate: presetDate || '',
      category: 'Festival',
      target: 'ALL',
      description: ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (h) => {
    setEditingHoliday(h);
    setIsCustomCategory(!dynamicCategories.includes(h.category));
    setFormData({
      title: h.title || '',
      date: h.date || '',
      endDate: h.endDate || '',
      category: h.category || 'National Holiday',
      target: h.target || 'ALL',
      description: h.description || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleDuplicateHoliday = async (h) => {
    try {
      const clone = {
        title: `${h.title} (Copy)`,
        date: h.date,
        endDate: h.endDate || h.date,
        category: h.category,
        target: h.target,
        description: h.description || ''
      };
      await holidayService.create(clone);
      setSuccessMessage(`Duplicated holiday "${clone.title}" successfully!`);
      await fetchHolidays();
    } catch (e) {
      setError(e.message || 'Failed to duplicate holiday');
    }
  };

  const handleSaveHoliday = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Holiday title is required');
      return;
    }
    if (!formData.date.trim()) {
      setError('Holiday start date is required');
      return;
    }
    if (formData.endDate && formData.endDate < formData.date) {
      setError('End date cannot be earlier than start date');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const payload = {
        title: formData.title.trim(),
        date: formData.date.trim(),
        endDate: formData.endDate?.trim() || formData.date.trim(),
        category: formData.category?.trim() || 'General',
        target: formData.target,
        description: formData.description.trim()
      };

      if (editingHoliday) {
        await holidayService.update(editingHoliday.id, payload);
        setSuccessMessage(`Holiday "${payload.title}" updated successfully!`);
      } else {
        await holidayService.create(payload);
        setSuccessMessage(`Holiday "${payload.title}" added to academic calendar!`);
      }

      setIsModalOpen(false);
      setDayDetailModal(null);
      await fetchHolidays();
    } catch (e) {
      setError(e.message || 'Failed to save holiday');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      await holidayService.remove(id);
      setSuccessMessage('Holiday removed from calendar');
      setDeleteConfirmId(null);
      setDayDetailModal(null);
      await fetchHolidays();
    } catch (e) {
      setError(e.message || 'Failed to delete holiday');
    }
  };

  // Dynamic Export to CSV
  const handleExportCSV = () => {
    if (!filteredHolidays.length) {
      setError('No holidays to export with current filters');
      return;
    }
    const headers = ['Title', 'Start Date', 'End Date', 'Days Off', 'Category', 'Target Audience', 'Status', 'Description'];
    const rows = filteredHolidays.map((h) => [
      `"${(h.title || '').replace(/"/g, '""')}"`,
      h.date,
      h.endDate || h.date,
      calculateDuration(h.date, h.endDate),
      `"${h.category || ''}"`,
      `"${h.target || 'ALL'}"`,
      `"${getRelativeStatus(h.date, h.endDate).label}"`,
      `"${(h.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `school-holidays-export-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusTab('ALL');
    setCategoryFilter('ALL');
    setYearFilter('ALL');
    setMonthFilter('ALL');
    setTargetFilter('ALL');
    setSortBy('date-asc');
  };

  const isFilterActive =
    Boolean(searchTerm) ||
    statusTab !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    yearFilter !== 'ALL' ||
    monthFilter !== 'ALL' ||
    targetFilter !== 'ALL';

  // Monthly Calendar Matrix Generation
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Monday as day 0
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = prevDate.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr
      });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const curDate = new Date(year, month, i);
      const dateStr = curDate.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: true,
        isToday: dateStr === todayStr
      });
    }

    // Next month padding to fill complete grid of 35 or 42 cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = nextDate.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: false,
        isToday: dateStr === todayStr
      });
    }

    return days;
  }, [calendarDate, todayStr]);

  // Map holidays onto calendar days
  const getHolidaysForDate = useCallback(
    (dateStr) => {
      return holidays.filter((h) => {
        const start = h.date;
        const end = h.endDate || h.date;
        return dateStr >= start && dateStr <= end;
      });
    },
    [holidays]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Dynamic Header */}
      <div
        className="card animate-fade-in"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '22px 24px',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-hover) 100%)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
            }}
          >
            <CalendarDays size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>School Holiday Management</h2>
              {dynamicStats.activeTodayCount > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      animation: 'pulse 1.5s infinite'
                    }}
                  />
                  School Closed Today
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Configure official school holidays, festivals, and academic breaks. Dates marked here automatically show "H" in student/teacher calendar and disable attendance marking.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* View Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-app)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: viewMode === 'table' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'table' ? '#3b82f6' : 'var(--text-secondary)',
                boxShadow: viewMode === 'table' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <List size={15} /> Table View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: viewMode === 'calendar' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'calendar' ? '#3b82f6' : 'var(--text-secondary)',
                boxShadow: viewMode === 'calendar' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Calendar size={15} /> Monthly Calendar
            </button>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchHolidays}
            title="Refresh Holidays from Server"
            style={{ padding: '9px 12px' }}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportCSV}
            title="Export filtered list to CSV"
            style={{ padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={16} /> Export CSV
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleOpenAddModal()}
            style={{
              padding: '9px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)'
            }}
          >
            <Plus size={18} /> Add New Holiday
          </button>
        </div>
      </div>

      {/* Dynamic Metric Cards (100% Data-Driven) */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        {/* Card 1: Total Holiday Events */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '18px 20px',
            borderLeft: '4px solid #3b82f6',
            transition: 'transform 0.2s'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Holidays
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {dynamicStats.totalEvents} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>events</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Days Off (Calculates Multi-Day Vacation Spans) */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '18px 20px',
            borderLeft: '4px solid #8b5cf6',
            transition: 'transform 0.2s'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CalendarRange size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Days Off
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#8b5cf6' }}>
              {dynamicStats.totalDaysOff} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>school days</span>
            </div>
          </div>
        </div>

        {/* Card 3: Upcoming Holidays */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '18px 20px',
            borderLeft: '4px solid #10b981',
            transition: 'transform 0.2s'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Upcoming Holidays
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>
              {dynamicStats.upcomingCount} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>remaining</span>
            </div>
          </div>
        </div>

        {/* Card 4: This Month / Active Today */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '18px 20px',
            borderLeft: '4px solid #f59e0b',
            transition: 'transform 0.2s'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              This Month Break
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>
              {dynamicStats.thisMonthCount} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>events</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Category Distribution Quick Chips */}
      {Object.keys(dynamicStats.categoryCounts).length > 0 && (
        <div
          className="card"
          style={{
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            <Layers size={15} /> Categories:
          </div>

          <button
            type="button"
            onClick={() => setCategoryFilter('ALL')}
            style={{
              border: categoryFilter === 'ALL' ? '1px solid #3b82f6' : '1px solid var(--border-color)',
              backgroundColor: categoryFilter === 'ALL' ? 'rgba(59, 130, 246, 0.14)' : 'var(--bg-app)',
              color: categoryFilter === 'ALL' ? '#3b82f6' : 'var(--text-primary)',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            All Categories <span style={{ opacity: 0.7 }}>({dynamicStats.totalEvents})</span>
          </button>

          {Object.entries(dynamicStats.categoryCounts).map(([catName, count]) => {
            const theme = getCategoryTheme(catName);
            const isSelected = categoryFilter === catName;
            return (
              <button
                key={catName}
                type="button"
                onClick={() => setCategoryFilter(isSelected ? 'ALL' : catName)}
                style={{
                  border: isSelected ? `2px solid ${theme.color}` : `1px solid ${theme.border}`,
                  backgroundColor: isSelected ? theme.bg : 'var(--bg-app)',
                  color: theme.color,
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isSelected ? `0 2px 8px ${theme.border}` : 'none'
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: theme.color }} />
                {catName} <span style={{ opacity: 0.85 }}>({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Notifications */}
      {successMessage && (
        <div
          className="animate-fade-in"
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(34, 197, 94, 0.12)',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div
          className="animate-fade-in"
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Dynamic Status Tabs & Comprehensive Filter Toolbar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Status Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          {[
            { id: 'ALL', label: 'All Holidays', count: dynamicStats.totalEvents },
            { id: 'UPCOMING', label: 'Upcoming', count: dynamicStats.upcomingCount },
            { id: 'ACTIVE_TODAY', label: 'Active Today', count: dynamicStats.activeTodayCount },
            { id: 'THIS_MONTH', label: 'This Month', count: dynamicStats.thisMonthCount },
            { id: 'PAST', label: 'Past Holidays', count: dynamicStats.pastCount }
          ].map((tab) => {
            const isActive = statusTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusTab(tab.id)}
                style={{
                  border: 'none',
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.14)' : 'transparent',
                  color: isActive ? '#3b82f6' : 'var(--text-secondary)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
                <span
                  style={{
                    backgroundColor: isActive ? '#3b82f6' : 'var(--bg-app)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Multi-Field Filters Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '340px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              className="input"
              placeholder="Search by title, category, date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px', height: '38px', width: '100%', fontSize: '0.85rem' }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Year Filter */}
            <select
              className="input"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{ height: '38px', padding: '0 10px', fontSize: '0.8rem', minWidth: '110px' }}
            >
              <option value="ALL">All Years</option>
              {dynamicYears.map((yr) => (
                <option key={yr} value={yr}>
                  Year {yr}
                </option>
              ))}
            </select>

            {/* Month Filter */}
            <select
              className="input"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              style={{ height: '38px', padding: '0 10px', fontSize: '0.8rem', minWidth: '120px' }}
            >
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            {/* Target Filter */}
            <select
              className="input"
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value)}
              style={{ height: '38px', padding: '0 10px', fontSize: '0.8rem', minWidth: '130px' }}
            >
              <option value="ALL">All Audiences</option>
              <option value="STUDENTS">Students Only</option>
              <option value="STAFF">Staff & Teachers</option>
            </select>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpDown size={14} color="var(--text-muted)" />
              <select
                className="input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ height: '38px', padding: '0 10px', fontSize: '0.8rem', minWidth: '150px' }}
              >
                <option value="date-asc">Date: Nearest First</option>
                <option value="date-desc">Date: Furthest First</option>
                <option value="title-asc">Title: A to Z</option>
                <option value="duration-desc">Duration: Longest First</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {isFilterActive && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClearFilters}
                style={{ height: '38px', padding: '0 12px', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
              >
                <X size={14} style={{ marginRight: '4px' }} /> Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Table View vs Calendar View */}
      {viewMode === 'calendar' ? (
        /* Dynamic Monthly Interactive Calendar */
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Calendar Header Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <span
                style={{
                  fontSize: '0.8rem',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  color: '#3b82f6',
                  fontWeight: 700
                }}
              >
                {
                  holidays.filter((h) => {
                    const ym = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}`;
                    return (h.date && h.date.startsWith(ym)) || (h.endDate && h.endDate.startsWith(ym));
                  }).length
                }{' '}
                Holidays this month
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                style={{ padding: '6px 12px' }}
                title="Previous Month"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCalendarDate(new Date())}
                style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700 }}
              >
                Today
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                style={{ padding: '6px 12px' }}
                title="Next Month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Calendar Day Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => (
              <div
                key={dayName}
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: idx >= 5 ? '#f59e0b' : 'var(--text-muted)',
                  padding: '8px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Calendar Grid Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {calendarDays.map((cell, idx) => {
              const dayHolidays = getHolidaysForDate(cell.dateStr);
              const hasHoliday = dayHolidays.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (hasHoliday) {
                      setDayDetailModal({ date: cell.dateStr, holidays: dayHolidays });
                    } else {
                      handleOpenAddModal(cell.dateStr);
                    }
                  }}
                  style={{
                    minHeight: '105px',
                    borderRadius: '12px',
                    padding: '8px',
                    border: cell.isToday
                      ? '2px solid #3b82f6'
                      : hasHoliday
                        ? '1px solid rgba(59, 130, 246, 0.4)'
                        : '1px solid var(--border-color)',
                    backgroundColor: hasHoliday
                      ? 'rgba(59, 130, 246, 0.05)'
                      : cell.isCurrentMonth
                        ? 'var(--bg-app)'
                        : 'transparent',
                    opacity: cell.isCurrentMonth ? 1 : 0.4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    boxShadow: cell.isToday ? '0 0 12px rgba(59, 130, 246, 0.25)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: cell.isToday ? 900 : 700,
                        color: cell.isToday ? '#3b82f6' : 'var(--text-primary)',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: cell.isToday ? 'rgba(59, 130, 246, 0.18)' : 'transparent'
                      }}
                    >
                      {cell.dayNum}
                    </span>

                    {hasHoliday && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                          borderRadius: '6px',
                          padding: '1px 6px'
                        }}
                      >
                        H
                      </span>
                    )}
                  </div>

                  {/* Holiday Pills on Day */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                    {dayHolidays.slice(0, 2).map((h) => {
                      const theme = getCategoryTheme(h.category);
                      return (
                        <div
                          key={h.id}
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: theme.bg,
                            color: theme.color,
                            border: `1px solid ${theme.border}`,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={`${h.title} (${h.category})`}
                        >
                          {h.title}
                        </div>
                      );
                    })}

                    {dayHolidays.length > 2 && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                        +{dayHolidays.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Hover Quick Add Indicator */}
                  {!hasHoliday && cell.isCurrentMonth && (
                    <div style={{ textAlign: 'right', opacity: 0.3 }}>
                      <Plus size={12} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Rich Dynamic Data Table */
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          {isLoading && !holidays.length ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Spinner size={32} color="#3b82f6" />
              <div style={{ marginTop: '14px', fontWeight: 600 }}>Loading school holidays...</div>
            </div>
          ) : filteredHolidays.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <CalendarDays size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>No holidays match your criteria</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                {isFilterActive
                  ? 'Try clearing some filters or searching with different keywords.'
                  : 'Click "Add New Holiday" above to declare school holidays.'}
              </p>
              {isFilterActive && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClearFilters}
                  style={{ marginTop: '16px', fontSize: '0.85rem' }}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700 }}>
                      DATE / DURATION
                    </th>
                    <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700 }}>
                      HOLIDAY NAME
                    </th>
                    <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700 }}>
                      CATEGORY
                    </th>
                    <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700 }}>
                      TARGET AUDIENCE
                    </th>
                    <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700 }}>
                      DESCRIPTION / REASON
                    </th>
                    <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700 }}>
                      STATUS
                    </th>
                    <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHolidays.map((holiday) => {
                    const statusObj = getRelativeStatus(holiday.date, holiday.endDate);
                    const durationDays = calculateDuration(holiday.date, holiday.endDate);
                    const isRange = holiday.endDate && holiday.endDate !== holiday.date;
                    const catTheme = getCategoryTheme(holiday.category);

                    return (
                      <tr
                        key={holiday.id}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background-color 0.2s',
                          backgroundColor: statusObj.isLive ? 'rgba(16, 185, 129, 0.04)' : 'transparent'
                        }}
                      >
                        {/* Date & Range & Duration */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                              {formatDateDisplay(holiday.date)}
                            </span>
                            {isRange && (
                              <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>
                                to {formatDateDisplay(holiday.endDate)}
                              </span>
                            )}
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                width: 'fit-content',
                                marginTop: '2px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '10px',
                                backgroundColor: durationDays > 1 ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-app)',
                                color: durationDays > 1 ? '#8b5cf6' : 'var(--text-muted)'
                              }}
                            >
                              {durationDays} {durationDays === 1 ? 'day off' : 'days off'}
                            </span>
                          </div>
                        </td>

                        {/* Holiday Title with Themed 'H' Icon */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                backgroundColor: catTheme.bg,
                                color: catTheme.color,
                                border: `1px solid ${catTheme.border}`,
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                flexShrink: 0
                              }}
                            >
                              H
                            </span>
                            <div>
                              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                {holiday.title}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category with Dynamic Theming */}
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: catTheme.bg,
                              color: catTheme.color,
                              border: `1px solid ${catTheme.border}`,
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.75rem'
                            }}
                          >
                            {holiday.category || 'General'}
                          </span>
                        </td>

                        {/* Target Audience */}
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: 'var(--text-secondary)'
                            }}
                          >
                            {holiday.target === 'ALL'
                              ? 'All School (Closed)'
                              : holiday.target === 'STUDENTS'
                                ? 'Students Only'
                                : 'Staff & Teachers Only'}
                          </span>
                        </td>

                        {/* Description */}
                        <td style={{ padding: '14px 18px', maxWidth: '240px' }}>
                          <span
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--text-secondary)',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {holiday.description || '—'}
                          </span>
                        </td>

                        {/* Status & Relative Countdown */}
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: statusObj.bg,
                              color: statusObj.color,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            {statusObj.isLive && (
                              <span
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: statusObj.color
                                }}
                              />
                            )}
                            {statusObj.label}
                          </span>
                        </td>

                        {/* Actions: Edit, Duplicate, Delete */}
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(holiday)}
                              style={{
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '6px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Edit Holiday"
                            >
                              <Edit size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDuplicateHoliday(holiday)}
                              style={{
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '6px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Duplicate / Clone Holiday"
                            >
                              <Copy size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(holiday.id)}
                              style={{
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '6px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Delete Holiday"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Holiday Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  {editingHoliday ? 'Edit School Holiday' : 'Add New School Holiday'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Declare a holiday. Students and teachers will see "H" marked in their app calendar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveHoliday} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Holiday Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Holiday Name / Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Gandhi Jayanti, Diwali Festival, Winter Vacation"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{ width: '100%', height: '40px' }}
                />
              </div>

              {/* Start Date & End Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Start Date <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={formData.date}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setFormData({
                        ...formData,
                        date: newStart,
                        endDate: formData.endDate && formData.endDate < newStart ? newStart : formData.endDate
                      });
                    }}
                    required
                    style={{ width: '100%', height: '40px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    End Date (For Multi-Day Break)
                  </label>
                  <input
                    type="date"
                    className="input"
                    min={formData.date}
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    style={{ width: '100%', height: '40px' }}
                  />
                </div>
              </div>

              {/* Dynamic Live Duration Preview Banner */}
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#3b82f6',
                  fontWeight: 600
                }}
              >
                <CalendarRange size={16} />
                <span>
                  Total Duration:{' '}
                  <strong>{calculateDuration(formData.date, formData.endDate)} school day(s) off</strong>{' '}
                  {formData.endDate && formData.endDate !== formData.date && (
                    <span>
                      ({formData.date} to {formData.endDate})
                    </span>
                  )}
                </span>
              </div>

              {/* Category (Dynamic Selector or Custom Input) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Category</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(!isCustomCategory)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#3b82f6',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {isCustomCategory ? '← Choose Existing' : '+ Type Custom Category'}
                  </button>
                </div>

                {isCustomCategory ? (
                  <input
                    type="text"
                    className="input"
                    placeholder="Type custom category name (e.g. Sports Meet, Founder's Day)"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', height: '40px' }}
                  />
                ) : (
                  <select
                    className="input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', height: '40px' }}
                  >
                    {dynamicCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}

                {/* Quick Category Suggestion Chips */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {['Festival', 'National Holiday', 'School Vacation', 'Gazetted Holiday', 'Emergency / Weather'].map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, category: cat });
                          setIsCustomCategory(false);
                        }}
                        style={{
                          border: 'none',
                          backgroundColor: formData.category === cat ? '#3b82f6' : 'var(--bg-app)',
                          color: formData.category === cat ? '#ffffff' : 'var(--text-secondary)',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Target Audience
                </label>
                <select
                  className="input"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  style={{ width: '100%', height: '40px' }}
                >
                  <option value="ALL">All School (Closed for Students & Staff)</option>
                  <option value="STUDENTS">Students Only (Teachers / Staff Working Day)</option>
                  <option value="STAFF">Staff & Teachers Only</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Description / Circular Notes (Optional)
                </label>
                <textarea
                  className="input"
                  rows="3"
                  placeholder="e.g. School remains closed for all academic and administrative activities."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
                />
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 18px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                  style={{
                    padding: '10px 22px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isSaving ? (
                    <>
                      <Spinner size={16} color="#ffffff" /> Saving...
                    </>
                  ) : editingHoliday ? (
                    'Update Holiday'
                  ) : (
                    'Save Holiday'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Day Details Modal (from Calendar click) */}
      {dayDetailModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '24px',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {formatDateDisplay(dayDetailModal.date)}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {dayDetailModal.holidays.length} holiday(s) declared for this date
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDayDetailModal(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '340px', overflowY: 'auto' }}>
              {dayDetailModal.holidays.map((h) => {
                const theme = getCategoryTheme(h.category);
                return (
                  <div
                    key={h.id}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-app)',
                      border: `1px solid ${theme.border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          backgroundColor: theme.bg,
                          color: theme.color
                        }}
                      >
                        {h.category}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {h.target === 'ALL' ? 'School Closed' : h.target}
                      </span>
                    </div>

                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {h.title}
                    </div>

                    {h.description && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {h.description}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setDayDetailModal(null);
                          handleOpenEditModal(h);
                        }}
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        <Edit size={14} style={{ marginRight: '4px' }} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDayDetailModal(null);
                          setDeleteConfirmId(h.id);
                        }}
                        style={{
                          border: 'none',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} style={{ marginRight: '4px' }} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const date = dayDetailModal.date;
                  setDayDetailModal(null);
                  handleOpenAddModal(date);
                }}
                style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Add Another Holiday
              </button>

              <button
                type="button"
                className="btn"
                onClick={() => setDayDetailModal(null)}
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}
            >
              <Trash2 size={24} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Delete Holiday?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Are you sure you want to remove this holiday from the school calendar? Attendance marking will be re-enabled for this date.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                className="btn"
                onClick={() => setDeleteConfirmId(null)}
                style={{ padding: '10px 18px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteHoliday(deleteConfirmId)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidaysModule;
