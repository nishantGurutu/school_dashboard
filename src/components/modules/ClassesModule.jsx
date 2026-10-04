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
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Layers,
  BookOpen,
  GraduationCap,
  DoorOpen,
  Calendar,
  Building2,
  Eye,
  Briefcase
} from 'lucide-react';
import { classService } from '../../services/classService';
import { useApiAction } from '../../hooks/useApiAction';
import { Spinner } from '../ui/Spinner';
import { DesignationModule } from './DesignationModule';

export const ClassesModule = () => {
  const { activeTab, setActiveTab } = useTheme();

  // Determine current active sub-tab (department, designation, section, subjects, classList, classRoom)
  const getSubTabFromActiveTab = () => {
    if (activeTab === 'classes-designation' || activeTab === 'classes-designations' || activeTab === 'designation' || activeTab === 'designations') return 'designation';
    if (activeTab === 'classes-department' || activeTab === 'classes-departments' || activeTab === 'department' || activeTab === 'departments') return 'department';
    if (activeTab === 'classes-subjects') return 'subjects';
    if (activeTab === 'classes-list') return 'classList';
    if (activeTab === 'classes-room') return 'classRoom';
    return 'department';
  };

  const [currentSubTab, setCurrentSubTab] = useState(getSubTabFromActiveTab());
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingDepartment, setViewingDepartment] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { busyKey, runAction } = useApiAction();
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  // Data states for academic sections
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classList, setClassList] = useState([]);
  const [classRooms, setClassRooms] = useState([]);
  const [designationAddTrigger, setDesignationAddTrigger] = useState(0);

  // Sync sub-tab from parent activeTab
  useEffect(() => {
    setCurrentSubTab(getSubTabFromActiveTab());
    setActiveDropdownId(null);
    setSelectedRows([]);
    setCurrentPage(1);
    setSearchTerm('');
  }, [activeTab]);

  // Flash message timer
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchClassesData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [deptRes, desigRes, secRes, subRes, clsRes, roomRes] = await Promise.all([
        classService.departments.list(),
        classService.designations.list().catch(() => []),
        classService.sections.list(),
        classService.subjects.list(),
        classService.classes.list(),
        classService.rooms.list()
      ]);

      const deptItems = Array.isArray(deptRes) ? deptRes : [];
      const desigItems = Array.isArray(desigRes) ? desigRes : [];
      const secItems = Array.isArray(secRes) ? secRes : [];
      const subItems = Array.isArray(subRes) ? subRes : [];
      const clsItems = Array.isArray(clsRes) ? clsRes : [];
      const roomItems = Array.isArray(roomRes) ? roomRes : [];

      setDepartments(deptItems.map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })));
      setDesignations(desigItems.map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })));
      setSections(secItems.map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })));
      setSubjects(subItems.map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })));
      setClassList(clsItems.map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })));
      setClassRooms(roomItems.map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })));
    } catch (e) {
      setError(e.message || 'Failed to load classes data from server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClassesData();
  }, [fetchClassesData]);

  // Form State
  const [modalFormData, setModalFormData] = useState({
    name: '',
    code: '',
    headOfDepartment: '',
    description: '',
    sectionId: '',
    section: '',
    room: '',
    capacity: '',
    status: 'Active'
  });

  const handleSubTabChange = (tabKey) => {
    setCurrentSubTab(tabKey);
    setActiveDropdownId(null);
    setSelectedRows([]);
    setCurrentPage(1);
    setSearchTerm('');
    if (tabKey === 'designation') setActiveTab('classes-designation');
    if (tabKey === 'department') setActiveTab('classes-department');
    if (tabKey === 'section') setActiveTab('classes-section');
    if (tabKey === 'subjects') setActiveTab('classes-subjects');
    if (tabKey === 'classList') setActiveTab('classes-list');
    if (tabKey === 'classRoom') setActiveTab('classes-room');
  };

  const handleOpenAddModal = () => {
    if (currentSubTab === 'designation') {
      setDesignationAddTrigger((prev) => prev + 1);
      return;
    }
    setEditingItem(null);
    setError('');

    // Preselect first section for class if available
    let defaultSectionId = '';
    let defaultSectionName = '';
    if (sections.length > 0) {
      defaultSectionId = String(sections[0].id);
      defaultSectionName = sections[0].name;
    }

    setModalFormData({
      name: '',
      code: '',
      headOfDepartment: '',
      description: '',
      sectionId: defaultSectionId,
      section: defaultSectionName,
      room: '',
      capacity: '40',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setActiveDropdownId(null);
    setError('');

    // For class, resolve sectionId
    let secId = item.sectionId ? String(item.sectionId) : '';
    let secName = item.section || '';
    if (!secId && secName && sections.length > 0) {
      const match = sections.find(s => s.name.toLowerCase() === secName.toLowerCase());
      if (match) {
        secId = String(match.id);
        secName = match.name;
      }
    }

    setModalFormData({
      name: item.name || item.room || '',
      code: item.code || '',
      headOfDepartment: item.headOfDepartment || '',
      description: item.description || '',
      sectionId: secId,
      section: secName,
      room: item.room || item.name || '',
      capacity: item.capacity || '',
      status: item.status || 'Active'
    });
    setIsModalOpen(true);
  };

  // View Details (fetches fresh details from Details API GET /api/classes/departments/{id})
  const handleOpenDetailsModal = async (item) => {
    setActiveDropdownId(null);
    setViewingDepartment(item);
    setIsDetailsLoading(true);
    try {
      const detailed = await classService.departments.get(item.id);
      if (detailed) {
        setViewingDepartment(detailed);
      }
    } catch (e) {
      console.warn('Using cached department details as fallback:', e);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    setActiveDropdownId(null);
    try {
      if (currentSubTab === 'department') {
        await classService.departments.remove(id);
        setDepartments((prev) => prev.filter((item) => item.id !== id).map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })));
        setSuccessMessage('Department deleted successfully!');
      } else if (currentSubTab === 'section') {
        await classService.sections.remove(id);
        setSections((prev) => prev.filter((item) => item.id !== id).map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })));
        setSuccessMessage('Section deleted successfully!');
      } else if (currentSubTab === 'subjects') {
        await classService.subjects.remove(id);
        setSubjects((prev) => prev.filter((item) => item.id !== id).map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })));
        setSuccessMessage('Subject deleted successfully!');
      } else if (currentSubTab === 'classList') {
        await classService.classes.remove(id);
        setClassList((prev) => prev.filter((item) => item.id !== id).map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })));
        setSuccessMessage('Class deleted successfully!');
      } else if (currentSubTab === 'classRoom') {
        await classService.rooms.remove(id);
        setClassRooms((prev) => prev.filter((item) => item.id !== id).map((item, i) => ({ ...item, sl: String(i + 1).padStart(2, '0') })));
        setSuccessMessage('Class Room deleted successfully!');
      }
    } catch (e) {
      setError(e.message || 'Failed to delete item');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedRows.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} selected item(s)?`)) return;

    try {
      setIsLoading(true);
      for (const id of selectedRows) {
        if (currentSubTab === 'department') await classService.departments.remove(id);
        else if (currentSubTab === 'section') await classService.sections.remove(id);
        else if (currentSubTab === 'subjects') await classService.subjects.remove(id);
        else if (currentSubTab === 'classList') await classService.classes.remove(id);
        else if (currentSubTab === 'classRoom') await classService.rooms.remove(id);
      }
      setSelectedRows([]);
      setSuccessMessage(`${selectedRows.length} item(s) deleted successfully!`);
      await fetchClassesData();
    } catch (e) {
      setError(e.message || 'Failed to delete selected items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();

    if (savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    setError('');

    try {
      if (editingItem) {
        const id = editingItem.id;
        if (currentSubTab === 'department') {
          const updated = await classService.departments.update(id, {
            name: modalFormData.name.trim(),
            code: modalFormData.code.trim().toUpperCase(),
            headOfDepartment: modalFormData.headOfDepartment?.trim() || null,
            description: modalFormData.description?.trim() || null,
            status: modalFormData.status
          });
          setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...updated } : d)));
          setSuccessMessage('Department updated successfully!');
        } else if (currentSubTab === 'section') {
          const updated = await classService.sections.update(id, {
            name: modalFormData.name.trim(),
            status: modalFormData.status
          });
          setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
          setSuccessMessage('Section updated successfully!');
        } else if (currentSubTab === 'subjects') {
          const updated = await classService.subjects.update(id, {
            name: modalFormData.name.trim(),
            code: modalFormData.code.trim(),
            status: modalFormData.status
          });
          setSubjects((prev) => prev.map((sub) => (sub.id === id ? { ...sub, ...updated } : sub)));
          setSuccessMessage('Subject updated successfully!');
        } else if (currentSubTab === 'classList') {
          const sec = sections.find(s => String(s.id) === String(modalFormData.sectionId));
          const updated = await classService.classes.update(id, {
            name: modalFormData.name.trim(),
            sectionId: modalFormData.sectionId ? Number(modalFormData.sectionId) : null,
            section: sec ? sec.name : (modalFormData.section || null),
            status: modalFormData.status
          });
          setClassList((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
          setSuccessMessage('Class updated successfully!');
        } else if (currentSubTab === 'classRoom') {
          const updated = await classService.rooms.update(id, {
            room: (modalFormData.room || modalFormData.name).trim(),
            capacity: modalFormData.capacity ? modalFormData.capacity.trim() : '',
            status: modalFormData.status
          });
          setClassRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
          setSuccessMessage('Class Room updated successfully!');
        }
      } else {
        // Create new item
        if (currentSubTab === 'department') {
          const created = await classService.departments.create({
            name: modalFormData.name.trim(),
            code: modalFormData.code.trim().toUpperCase(),
            headOfDepartment: modalFormData.headOfDepartment?.trim() || null,
            description: modalFormData.description?.trim() || null,
            status: modalFormData.status
          });
          setDepartments((prev) => [{ ...created, sl: '01' }, ...prev.map((d, i) => ({ ...d, sl: String(i + 2).padStart(2, '0') }))]);
          setSuccessMessage('Department created successfully!');
        } else if (currentSubTab === 'section') {
          const created = await classService.sections.create({
            name: modalFormData.name.trim(),
            status: modalFormData.status
          });
          setSections((prev) => [{ ...created, sl: '01' }, ...prev.map((s, i) => ({ ...s, sl: String(i + 2).padStart(2, '0') }))]);
          setSuccessMessage('Section created successfully!');
        } else if (currentSubTab === 'subjects') {
          const created = await classService.subjects.create({
            name: modalFormData.name.trim(),
            code: modalFormData.code.trim(),
            status: modalFormData.status
          });
          setSubjects((prev) => [{ ...created, sl: '01' }, ...prev.map((s, i) => ({ ...s, sl: String(i + 2).padStart(2, '0') }))]);
          setSuccessMessage('Subject created successfully!');
        } else if (currentSubTab === 'classList') {
          const sec = sections.find(s => String(s.id) === String(modalFormData.sectionId));
          const created = await classService.classes.create({
            name: modalFormData.name.trim(),
            sectionId: modalFormData.sectionId ? Number(modalFormData.sectionId) : null,
            section: sec ? sec.name : (modalFormData.section || null),
            status: modalFormData.status
          });
          setClassList((prev) => [{ ...created, sl: '01' }, ...prev.map((c, i) => ({ ...c, sl: String(i + 2).padStart(2, '0') }))]);
          setSuccessMessage('Class created successfully!');
        } else if (currentSubTab === 'classRoom') {
          const created = await classService.rooms.create({
            room: (modalFormData.room || modalFormData.name).trim(),
            capacity: modalFormData.capacity ? modalFormData.capacity.trim() : '',
            status: modalFormData.status
          });
          setClassRooms((prev) => [{ ...created, sl: '01' }, ...prev.map((r, i) => ({ ...r, sl: String(i + 2).padStart(2, '0') }))]);
          setSuccessMessage('Class Room created successfully!');
        }
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (e) {
      setError(e.message || 'Failed to save item. Please check your inputs.');
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = '';

    if (currentSubTab === 'department') {
      headers = ['S.L', 'Department Name', 'Code', 'Head of Department', 'Description', 'Status'];
      rows = departments.map((d, idx) => [idx + 1, d.name, d.code, d.headOfDepartment || 'N/A', d.description || '', d.status]);
      filename = 'academic_departments.csv';
    } else if (currentSubTab === 'section') {
      headers = ['S.L', 'Section Name', 'Status'];
      rows = sections.map((s, idx) => [idx + 1, s.name, s.status]);
      filename = 'school_sections.csv';
    } else if (currentSubTab === 'subjects') {
      headers = ['S.L', 'Subject Name', 'Code', 'Status'];
      rows = subjects.map((s, idx) => [idx + 1, s.name, s.code, s.status]);
      filename = 'school_subjects.csv';
    } else if (currentSubTab === 'classList') {
      headers = ['S.L', 'Class Name', 'Section', 'Status'];
      rows = classList.map((c, idx) => [idx + 1, c.name, c.section || 'N/A', c.status]);
      filename = 'school_classes.csv';
    } else {
      headers = ['S.L', 'Room No', 'Capacity', 'Status'];
      rows = classRooms.map((r, idx) => [idx + 1, r.room, r.capacity || 'N/A', r.status]);
      filename = 'school_classrooms.csv';
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Header Details Config
  const getHeaderInfo = () => {
    switch (currentSubTab) {
      case 'department':
        return {
          title: 'Academic Departments',
          breadcrumb: 'Dashboard / Academic / Department',
          addBtnLabel: '+ Add Department',
          searchPlaceholder: 'Search departments by name, code, HOD...'
        };
      case 'designation':
        return {
          title: 'Academic & Staff Designations',
          breadcrumb: 'Dashboard / Academic / Designation',
          addBtnLabel: '+ Add Designation',
          searchPlaceholder: 'Search designations by title, code, category...'
        };
      case 'subjects':
        return {
          title: 'Subjects List',
          breadcrumb: 'Dashboard / Classes / Subjects List',
          addBtnLabel: '+ Add Subject',
          searchPlaceholder: 'Search subjects by name or code...'
        };
      case 'classList':
        return {
          title: 'Class List',
          breadcrumb: 'Dashboard / Classes / Class List',
          addBtnLabel: '+ Add Class',
          searchPlaceholder: 'Search classes by name or section...'
        };
      case 'classRoom':
        return {
          title: 'Class Room List',
          breadcrumb: 'Dashboard / Classes / Class Room List',
          addBtnLabel: '+ Add Class Room',
          searchPlaceholder: 'Search rooms by name or capacity...'
        };
      case 'section':
      default:
        return {
          title: 'Section Details',
          breadcrumb: 'Dashboard / Classes / Section Details',
          addBtnLabel: '+ Add Section',
          searchPlaceholder: 'Search sections by name...'
        };
    }
  };

  const headerInfo = getHeaderInfo();

  // Current active list & filtered items
  const getCurrentList = () => {
    if (currentSubTab === 'department') return departments;
    if (currentSubTab === 'section') return sections;
    if (currentSubTab === 'subjects') return subjects;
    if (currentSubTab === 'classList') return classList;
    return classRooms;
  };

  const fullList = getCurrentList();

  const filteredItems = fullList.filter((item) => {
    const q = searchTerm.toLowerCase();
    if (currentSubTab === 'department') {
      return (
        (item.name || '').toLowerCase().includes(q) ||
        (item.code || '').toLowerCase().includes(q) ||
        (item.headOfDepartment || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.status || '').toLowerCase().includes(q)
      );
    }
    if (currentSubTab === 'section') {
      return (item.name || '').toLowerCase().includes(q) || (item.status || '').toLowerCase().includes(q);
    }
    if (currentSubTab === 'subjects') {
      return (item.name || '').toLowerCase().includes(q) || (item.code || '').toLowerCase().includes(q) || (item.status || '').toLowerCase().includes(q);
    }
    if (currentSubTab === 'classList') {
      return (item.name || '').toLowerCase().includes(q) || (item.section || '').toLowerCase().includes(q) || (item.status || '').toLowerCase().includes(q);
    }
    if (currentSubTab === 'classRoom') {
      return (item.room || '').toLowerCase().includes(q) || (item.capacity || '').toLowerCase().includes(q) || (item.status || '').toLowerCase().includes(q);
    }
    return true;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / rowsPerPage));
  const paginatedItems = filteredItems.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedItems.length && paginatedItems.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedItems.map((item) => item.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      {/* Top Header Card */}
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{headerInfo.title}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0 }}>{headerInfo.breadcrumb}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Sub-Nav Tabs */}
          <div style={{
            display: 'flex',
            gap: '4px',
            backgroundColor: 'var(--bg-app)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)'
          }}>
            <button
              onClick={() => setActiveTab('classes-timetable')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <Calendar size={15} /> Timetable
            </button>

            <button
              onClick={() => handleSubTabChange('department')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'department' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'department' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'department' ? 700 : 500,
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <Building2 size={15} /> Department ({departments.length})
            </button>

            <button
              id="academic-tab-designation"
              onClick={() => handleSubTabChange('designation')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'designation' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'designation' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'designation' ? 700 : 500,
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <Briefcase size={15} /> Designation ({designations.length})
            </button>

            <button
              onClick={() => handleSubTabChange('section')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'section' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'section' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'section' ? 700 : 500,
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <Layers size={15} /> Section ({sections.length})
            </button>

            <button
              onClick={() => handleSubTabChange('subjects')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'subjects' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'subjects' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'subjects' ? 700 : 500,
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <BookOpen size={15} /> Subjects ({subjects.length})
            </button>

            <button
              onClick={() => handleSubTabChange('classList')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'classList' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'classList' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'classList' ? 700 : 500,
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <GraduationCap size={15} /> Class List ({classList.length})
            </button>

            <button
              onClick={() => handleSubTabChange('classRoom')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'classRoom' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'classRoom' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'classRoom' ? 700 : 500,
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <DoorOpen size={15} /> Class Room ({classRooms.length})
            </button>
          </div>

          <button
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
            <Plus size={18} /> {headerInfo.addBtnLabel}
          </button>
        </div>
      </div>

      {/* Designation SubTab View OR Standard Academic Table & Modals */}
      {currentSubTab === 'designation' ? (
        <DesignationModule
          hideHeader={true}
          openAddTrigger={designationAddTrigger}
          onDataChange={fetchClassesData}
        />
      ) : (
        <>
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

            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder={headerInfo.searchPlaceholder}
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
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>Showing {filteredItems.length} records</span>
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: '6px 12px',
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

                {currentSubTab === 'department' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Department Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Code</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Head of Department (HOD)</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Description</th>
                  </>
                )}
                {currentSubTab === 'section' && (
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Section Name</th>
                )}
                {currentSubTab === 'subjects' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Subject Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Subject Code</th>
                  </>
                )}
                {currentSubTab === 'classList' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Class Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Assigned Section</th>
                  </>
                )}
                {currentSubTab === 'classRoom' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Room Number</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Capacity</th>
                  </>
                )}

                <th style={{ padding: '12px 16px', fontWeight: 600, width: '120px' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center', width: '90px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={currentSubTab === 'department' ? 7 : 6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    <Spinner size={24} color="#0d9488" />
                    <div style={{ marginTop: '8px' }}>Loading data from server...</div>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={currentSubTab === 'department' ? 7 : 6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No records found. Click <strong>{headerInfo.addBtnLabel}</strong> to add one!
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

                    {/* Department tab */}
                    {currentSubTab === 'department' && (
                      <>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
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
                            }}>
                              <Building2 size={18} />
                            </div>
                            <div>
                              <div
                                style={{ fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                onClick={() => handleOpenDetailsModal(row)}
                                title="Click to view full department details"
                              >
                                {row.name}
                                <span style={{ fontSize: '0.75rem', color: '#0d9488' }}>🔍</span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Academic Stream
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-app)',
                            border: '1px solid var(--border-color)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            letterSpacing: '0.5px',
                            color: '#0d9488'
                          }}>
                            {row.code}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 500 }}>
                          {row.headOfDepartment ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <span>👤</span> {row.headOfDepartment}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>Not Assigned</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.description}>
                          {row.description || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>}
                        </td>
                      </>
                    )}

                    {/* Section tab */}
                    {currentSubTab === 'section' && (
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {row.name}
                      </td>
                    )}

                    {/* Subjects tab */}
                    {currentSubTab === 'subjects' && (
                      <>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>{row.name}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-app)',
                            border: '1px solid var(--border-color)',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}>
                            {row.code}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Class List tab */}
                    {currentSubTab === 'classList' && (
                      <>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>{row.name}</td>
                        <td style={{ padding: '14px 16px' }}>
                          {row.section ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              backgroundColor: '#e0f2fe',
                              color: '#0369a1',
                              fontWeight: 600,
                              fontSize: '0.8rem'
                            }}>
                              Section: {row.section}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>None</span>
                          )}
                        </td>
                      </>
                    )}

                    {/* Class Room tab */}
                    {currentSubTab === 'classRoom' && (
                      <>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>{row.room}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                          {row.capacity ? `${row.capacity} students` : '—'}
                        </td>
                      </>
                    )}

                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={row.status} />
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                      <ActionDropdownCell
                        row={row}
                        busyKey={busyKey}
                        isOpen={activeDropdownId === row.id}
                        onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                        onViewDetails={currentSubTab === 'department' ? () => handleOpenDetailsModal(row) : null}
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

      {/* Modal / Slide-over Drawer for Add/Edit Section, Subject, Class, Class Room */}
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
              width: '460px',
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
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  {editingItem ? 'Edit ' : 'Add New '}
                  {currentSubTab === 'department' && 'Department'}
                  {currentSubTab === 'section' && 'Section'}
                  {currentSubTab === 'subjects' && 'Subject'}
                  {currentSubTab === 'classList' && 'Class'}
                  {currentSubTab === 'classRoom' && 'Class Room'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  {currentSubTab === 'department'
                    ? 'Fill out department details, code, and assign Head of Department'
                    : currentSubTab === 'classList'
                    ? 'Enter class name, choose section from dropdown, and set status'
                    : 'Fill out the details below and click Save'}
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
            <form onSubmit={handleSaveModal} id="modal-form" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}>
              {error && (
                <div style={{ padding: '10px 14px', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '0.825rem', fontWeight: 600 }}>
                  {error}
                </div>
              )}

              {/* 0. Department Form */}
              {currentSubTab === 'department' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Department Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Science, Arts & Humanities, Commerce"
                      value={modalFormData.name}
                      onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                      style={inputStyle}
                      required
                    />
                    {/* Quick suggestion buttons */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Quick Presets:</span>
                      {[
                        { name: 'Science', code: 'SCI' },
                        { name: 'Commerce', code: 'COMM' },
                        { name: 'Arts & Humanities', code: 'ARTS' },
                        { name: 'Computer Science & IT', code: 'CSIT' },
                        { name: 'Vocational Studies', code: 'VOC' }
                      ].map((sug) => (
                        <button
                          key={sug.name}
                          type="button"
                          onClick={() => setModalFormData({ ...modalFormData, name: sug.name, code: sug.code })}
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
                          + {sug.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Department Code <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SCI, COMM, ARTS, CSIT"
                      value={modalFormData.code}
                      onChange={(e) => setModalFormData({ ...modalFormData, code: e.target.value.toUpperCase() })}
                      style={inputStyle}
                      required
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Short code identifier for academic records
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Head of Department (HOD)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Rajesh Sharma / Prof. Sunita Verma"
                      value={modalFormData.headOfDepartment}
                      onChange={(e) => setModalFormData({ ...modalFormData, headOfDepartment: e.target.value })}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Physics, Chemistry, Biology and Advanced Laboratories"
                      value={modalFormData.description}
                      onChange={(e) => setModalFormData({ ...modalFormData, description: e.target.value })}
                      style={{ ...inputStyle, resize: 'vertical' }}
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

              {/* 1. Section Form */}
              {currentSubTab === 'section' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Section Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Section A, A, Rose"
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

              {/* 2. Subjects Form */}
              {currentSubTab === 'subjects' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Subject Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mathematics, Science, English"
                      value={modalFormData.name}
                      onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Subject Code <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MATH-101, SCI-201"
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

              {/* 3. Class List Form: 3 Fields (1. Class Name, 2. Section Dropdown, 3. Status) */}
              {currentSubTab === 'classList' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      1. Class Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Class 10, Grade 9, Nursery"
                      value={modalFormData.name}
                      onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                        2. Section (Dropdown) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {sections.length} available
                      </span>
                    </div>

                    <select
                      value={modalFormData.sectionId}
                      onChange={(e) => {
                        const secId = e.target.value;
                        const match = sections.find(s => String(s.id) === secId);
                        setModalFormData({
                          ...modalFormData,
                          sectionId: secId,
                          section: match ? match.name : ''
                        });
                      }}
                      style={inputStyle}
                      required
                    >
                      <option value="" disabled>-- Select School Section --</option>
                      {sections.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.name} ({sec.status})
                        </option>
                      ))}
                    </select>

                    {sections.length === 0 && (
                      <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '6px', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.78rem' }}>
                        ⚠️ No sections found! Please{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setIsModalOpen(false);
                            handleSubTabChange('section');
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0d9488',
                            fontWeight: 700,
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          add a Section here first
                        </button>
                        . Once added, it will appear in this dropdown.
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      3. Status
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

              {/* 4. Class Room Form */}
              {currentSubTab === 'classRoom' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Room Name / Number <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Room 101, Science Lab 2"
                      value={modalFormData.room}
                      onChange={(e) => setModalFormData({ ...modalFormData, room: e.target.value, name: e.target.value })}
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      Capacity (Number of Students)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 40"
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

            {/* Modal Footer Buttons */}
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
                style={{
                  padding: '10px 24px',
                  fontWeight: 600,
                  fontSize: '0.875rem'
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

      {/* 5. Department Details Modal */}
      {viewingDepartment && (
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
          onClick={() => setViewingDepartment(null)}
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
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Building2 size={26} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    {viewingDepartment.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.5px'
                    }}>
                      CODE: {viewingDepartment.code}
                    </span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                      Academic Stream & Faculty
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingDepartment(null)}
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
                  <Spinner size={14} color="#0d9488" /> Syncing fresh department details from API...
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '14px',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-light)'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Head of Department (HOD)
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {viewingDepartment.headOfDepartment ? `👤 ${viewingDepartment.headOfDepartment}` : 'Not Assigned'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Status
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <StatusBadge status={viewingDepartment.status} />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    System ID
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                    #{viewingDepartment.id}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Created Date
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                    {viewingDepartment.createdAt ? new Date(viewingDepartment.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Department Description
                </div>
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  color: 'var(--text-primary)'
                }}>
                  {viewingDepartment.description || 'No detailed description provided for this academic department.'}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              backgroundColor: 'var(--bg-app)'
            }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setViewingDepartment(null)}
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const target = viewingDepartment;
                  setViewingDepartment(null);
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
                <Edit size={14} /> Edit Department
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

// Action Dropdown Cell Component for Edit and Delete Options
const ActionDropdownCell = ({ isOpen, onToggle, onEdit, onDelete, onViewDetails, row, busyKey }) => {
  const isDeleting = busyKey === `delete-${row.id}`;
  const cellRef = useRef(null);

  // Close when clicking outside
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

// Status Badge Component
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
  fontFamily: 'inherit',
  boxSizing: 'border-box'
};

export default ClassesModule;
