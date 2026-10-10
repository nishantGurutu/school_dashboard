import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  FolderPlus,
  FileText,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  Layers,
  ExternalLink,
  X,
  GraduationCap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { classService } from '../../services/classService';
import { authStorage } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const TeacherCurriculumModule = () => {
  const { showToast } = useToast();
  const currentUser = authStorage.getUser();

  // Navigation Sub-Tabs
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('workspace'); // 'workspace' | 'notes'

  // Loading & Data State
  const [loading, setLoading] = useState(false);
  const [classesList, setClassesList] = useState([]);
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Chapter for the Notes Inspector Panel
  const [selectedChapterForNotes, setSelectedChapterForNotes] = useState(null);

  // Modals state
  // 1. Subject Modal (Subject class ki hogi)
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    className: 'Class 10',
    status: 'Active'
  });
  const [savingSubject, setSavingSubject] = useState(false);

  // 2. Chapter Modal (Chapter subject ki hogi)
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [chapterModalMode, setChapterModalMode] = useState('create'); // 'create' | 'edit'
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterForm, setChapterForm] = useState({
    subjectId: '',
    chapterNumber: 'Chapter 1',
    chapterTitle: '',
    className: 'Class 10',
    description: '',
    displayOrder: 1
  });
  const [savingChapter, setSavingChapter] = useState(false);

  // 3. Note Modal (Notes chapter ki hogi)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteTargetChapter, setNoteTargetChapter] = useState(null);
  const [noteForm, setNoteForm] = useState({
    chapterId: '',
    title: '',
    description: '',
    file: null,
    directUrl: '',
    isDownloadable: true
  });
  const [uploadingNote, setUploadingNote] = useState(false);

  // ==========================================
  // 1. INITIAL LOAD: CLASSES LIST
  // ==========================================
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const clsRes = await classService.classes.list();
      if (Array.isArray(clsRes) && clsRes.length > 0) {
        setClassesList(clsRes);
        setSelectedClass(clsRes[0]?.name || 'Class 10');
      } else {
        // Sensible fallback classes
        const defaultClasses = [
          { id: 1, name: 'Class 10' },
          { id: 2, name: 'Class 9' },
          { id: 3, name: 'Class 11' },
          { id: 4, name: 'Class 12' }
        ];
        setClassesList(defaultClasses);
        setSelectedClass('Class 10');
      }
    } catch (err) {
      console.warn('Could not load classes list, using defaults:', err);
      setClassesList([
        { id: 1, name: 'Class 10' },
        { id: 2, name: 'Class 9' },
        { id: 3, name: 'Class 11' },
        { id: 4, name: 'Class 12' }
      ]);
    }
  };

  // ==========================================
  // 2. LOAD SUBJECTS WHEN CLASS CHANGES
  // "Subject class ki hogi"
  // ==========================================
  useEffect(() => {
    if (selectedClass) {
      loadSubjectsForClass(selectedClass);
    }
  }, [selectedClass]);

  const loadSubjectsForClass = async (className) => {
    try {
      setLoading(true);
      const res = await curriculumService.getSubjects(className);
      const subs = Array.isArray(res) ? res : [];
      setSubjects(subs);

      // Auto-select first subject or retain selection if valid
      if (subs.length > 0) {
        setSelectedSubject((prev) => {
          if (!prev) return subs[0];
          const found = subs.find((s) => s.id === prev.id);
          return found || subs[0];
        });
      } else {
        setSelectedSubject(null);
        setChapters([]);
        setSelectedChapterForNotes(null);
      }
    } catch (err) {
      console.error('Error loading subjects for class:', err);
      showToast('error', 'Failed to load subjects for ' + className);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 3. LOAD CHAPTERS WHEN SUBJECT CHANGES
  // "Chapter subject ki hogi"
  // ==========================================
  useEffect(() => {
    if (selectedSubject) {
      loadChaptersForSubject(selectedSubject.id, selectedClass);
    } else {
      setChapters([]);
      setSelectedChapterForNotes(null);
    }
  }, [selectedSubject, selectedClass]);

  const loadChaptersForSubject = async (subjectId, className) => {
    try {
      setLoading(true);
      const data = await curriculumService.getChapters(subjectId, className);
      const chapList = Array.isArray(data) ? data : [];
      setChapters(chapList);

      // Select first chapter by default for the detail view
      if (chapList.length > 0) {
        setSelectedChapterForNotes((prev) => {
          if (!prev) return chapList[0];
          const matched = chapList.find((c) => c.id === prev.id);
          return matched || chapList[0];
        });
      } else {
        setSelectedChapterForNotes(null);
      }
    } catch (err) {
      console.error('Error loading chapters:', err);
      showToast('error', 'Failed to load chapters and notes');
    } finally {
      setLoading(false);
    }
  };

  // Summary Metrics
  const metrics = useMemo(() => {
    let totalNotes = 0;
    const allNotesList = [];

    chapters.forEach((ch) => {
      const chNotes = ch.notes || [];
      totalNotes += chNotes.length;
      chNotes.forEach((n) => {
        allNotesList.push({
          ...n,
          chapterTitle: ch.chapterTitle,
          chapterNumber: ch.chapterNumber,
          subjectName: selectedSubject?.name || 'Subject',
          className: ch.className || selectedClass,
          belongsTo: `${ch.chapterNumber} - ${ch.chapterTitle}`
        });
      });
    });

    return {
      chaptersCount: chapters.length,
      notesCount: totalNotes,
      allNotesList
    };
  }, [chapters, selectedSubject, selectedClass]);

  // Filtered Chapters
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return chapters;
    const query = searchQuery.toLowerCase();
    return chapters.filter((ch) => {
      const matchesChapter =
        (ch.chapterTitle || '').toLowerCase().includes(query) ||
        (ch.chapterNumber || '').toLowerCase().includes(query);
      const matchesNotes = (ch.notes || []).some((n) => (n.title || '').toLowerCase().includes(query));
      return matchesChapter || matchesNotes;
    });
  }, [chapters, searchQuery]);

  // ==========================================
  // SUBJECT HANDLERS ("Subject class ki hogi")
  // ==========================================
  const handleOpenAddSubject = () => {
    setSubjectForm({
      name: '',
      code: '',
      className: selectedClass || 'Class 10',
      status: 'Active'
    });
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) {
      showToast('error', 'Subject name is required');
      return;
    }

    try {
      setSavingSubject(true);
      const targetClass = subjectForm.className || selectedClass || 'Class 10';
      const created = await curriculumService.createSubject({
        name: subjectForm.name.trim(),
        code: subjectForm.code?.trim() || null,
        className: targetClass,
        status: subjectForm.status || 'Active'
      });

      showToast('success', `Subject "${created.name}" created for ${targetClass}!`);
      setIsSubjectModalOpen(false);

      // If created for the current class, refresh and select it
      if (targetClass === selectedClass) {
        await loadSubjectsForClass(targetClass);
        setSelectedSubject(created);
      } else {
        setSelectedClass(targetClass);
      }
    } catch (err) {
      showToast('error', 'Failed to create subject: ' + (err.message || 'Error'));
    } finally {
      setSavingSubject(false);
    }
  };

  // ==========================================
  // CHAPTER HANDLERS ("Chapter subject ki hogi")
  // ==========================================
  const handleOpenAddChapter = () => {
    if (!selectedSubject && subjects.length === 0) {
      showToast('error', `Please add a subject to ${selectedClass} first!`);
      handleOpenAddSubject();
      return;
    }

    setChapterForm({
      subjectId: selectedSubject ? selectedSubject.id : (subjects[0]?.id || ''),
      chapterNumber: `Chapter ${chapters.length + 1}`,
      chapterTitle: '',
      className: selectedClass || 'Class 10',
      description: '',
      displayOrder: chapters.length + 1
    });
    setChapterModalMode('create');
    setEditingChapter(null);
    setIsChapterModalOpen(true);
  };

  const handleOpenEditChapter = (ch) => {
    setChapterForm({
      subjectId: ch.subjectId || selectedSubject?.id || '',
      chapterNumber: ch.chapterNumber,
      chapterTitle: ch.chapterTitle,
      className: ch.className || selectedClass,
      description: ch.description || '',
      displayOrder: ch.displayOrder || 1
    });
    setChapterModalMode('edit');
    setEditingChapter(ch);
    setIsChapterModalOpen(true);
  };

  const handleSaveChapter = async (e) => {
    e.preventDefault();
    if (!chapterForm.chapterTitle.trim()) {
      showToast('error', 'Chapter title is required');
      return;
    }
    const targetSubId = chapterForm.subjectId || selectedSubject?.id;
    if (!targetSubId) {
      showToast('error', 'Please select a subject for this chapter');
      return;
    }

    try {
      setSavingChapter(true);
      if (chapterModalMode === 'create') {
        const saved = await curriculumService.createChapter({
          subjectId: targetSubId,
          className: chapterForm.className || selectedClass,
          chapterNumber: chapterForm.chapterNumber,
          chapterTitle: chapterForm.chapterTitle,
          description: chapterForm.description,
          displayOrder: chapterForm.displayOrder
        });
        showToast('success', `${saved.chapterNumber} added to ${selectedSubject?.name || 'Subject'}!`);
      } else {
        await curriculumService.updateChapter(editingChapter.id, {
          chapterNumber: chapterForm.chapterNumber,
          chapterTitle: chapterForm.chapterTitle,
          description: chapterForm.description,
          displayOrder: chapterForm.displayOrder
        });
        showToast('success', 'Chapter updated successfully!');
      }

      setIsChapterModalOpen(false);
      loadChaptersForSubject(targetSubId, chapterForm.className || selectedClass);
    } catch (err) {
      showToast('error', 'Failed to save chapter: ' + (err.message || 'Error'));
    } finally {
      setSavingChapter(false);
    }
  };

  const handleDeleteChapter = async (id, title) => {
    if (!window.confirm(`Delete chapter "${title}" and all its attached study notes?`)) return;
    try {
      await curriculumService.deleteChapter(id);
      showToast('success', 'Chapter deleted successfully!');
      if (selectedChapterForNotes?.id === id) {
        setSelectedChapterForNotes(null);
      }
      if (selectedSubject) {
        loadChaptersForSubject(selectedSubject.id, selectedClass);
      }
    } catch (err) {
      showToast('error', 'Failed to delete chapter: ' + err.message);
    }
  };

  // ==========================================
  // NOTE HANDLERS ("Notes chapter ki hogi")
  // ==========================================
  const handleOpenAddNoteToChapter = (chapter) => {
    const target = chapter || selectedChapterForNotes || chapters[0];
    if (!target) {
      showToast('error', 'Please select or create a chapter first to attach notes!');
      return;
    }

    setNoteTargetChapter(target);
    setNoteForm({
      chapterId: target.id,
      title: '',
      description: '',
      file: null,
      directUrl: '',
      isDownloadable: true
    });
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteForm.title.trim()) {
      showToast('error', 'Note title is required');
      return;
    }
    const resolvedChapterId = noteForm.chapterId || noteTargetChapter?.id;
    if (!resolvedChapterId) {
      showToast('error', 'Please choose a target chapter for this note');
      return;
    }

    try {
      setUploadingNote(true);
      const teacherName = currentUser?.name || currentUser?.fullName || 'Teacher';

      if (noteForm.file) {
        const formData = new FormData();
        formData.append('file', noteForm.file);
        formData.append('chapterId', resolvedChapterId);
        if (selectedSubject) formData.append('subjectId', selectedSubject.id);
        formData.append('className', selectedClass);
        formData.append('title', noteForm.title.trim());
        if (noteForm.description) formData.append('description', noteForm.description.trim());
        formData.append('isDownloadable', String(noteForm.isDownloadable));
        formData.append('teacherName', teacherName);

        await curriculumService.uploadNote(formData);
        showToast('success', 'Study note published & attached to chapter successfully!');
      } else {
        await curriculumService.addNoteJson({
          chapterId: resolvedChapterId,
          subjectId: selectedSubject ? selectedSubject.id : null,
          className: selectedClass,
          title: noteForm.title.trim(),
          description: noteForm.description ? noteForm.description.trim() : null,
          directUrl: noteForm.directUrl ? noteForm.directUrl.trim() : null,
          fileType: noteForm.directUrl ? 'LINK' : 'TEXT',
          isDownloadable: noteForm.isDownloadable,
          teacherName: teacherName
        });
        showToast('success', 'Study note published to chapter successfully!');
      }

      setIsNoteModalOpen(false);
      // Refresh chapters & notes
      if (selectedSubject) {
        await loadChaptersForSubject(selectedSubject.id, selectedClass);
      }
    } catch (err) {
      console.error('Note upload error:', err);
      showToast('error', 'Failed to publish note: ' + (err.message || 'Error'));
    } finally {
      setUploadingNote(false);
    }
  };

  const handleDeleteNote = async (noteId, noteTitle) => {
    if (!window.confirm(`Delete study note "${noteTitle}"?`)) return;
    try {
      await curriculumService.deleteNote(noteId);
      showToast('success', 'Note deleted successfully!');
      if (selectedSubject) {
        loadChaptersForSubject(selectedSubject.id, selectedClass);
      }
    } catch (err) {
      showToast('error', 'Failed to delete note: ' + err.message);
    }
  };

  // Reusable inline input styles matching Aurora design tokens
  const inputStyle = {
    width: '100%',
    backgroundColor: 'var(--bg-app)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '0.85rem',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const btnPrimaryStyle = {
    backgroundColor: '#0d9488',
    color: '#ffffff',
    borderRadius: '8px',
    padding: '8px 14px',
    fontWeight: 600,
    fontSize: '0.825rem',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  };

  const btnSecondaryStyle = {
    backgroundColor: 'var(--bg-app)',
    color: 'var(--text-primary)',
    borderRadius: '8px',
    padding: '8px 14px',
    fontWeight: 500,
    fontSize: '0.825rem',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}>
      {/* ======================================================== */}
      {/* 1. TOP HEADER & HIERARCHY FLOW STATUS */}
      {/* ======================================================== */}
      <div
        className="card animate-fade-in"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '16px 20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Curriculum & Study Notes
            </h2>
            <span
              style={{
                backgroundColor: 'rgba(13, 148, 136, 0.12)',
                color: '#0d9488',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px'
              }}
            >
              Teacher Exclusive
            </span>
          </div>

          {/* Interactive Hierarchy Flow Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Hierarchy:</span>
            <span style={{ color: '#0d9488', fontWeight: 700 }}>1. Class</span>
            <ArrowRight size={13} color="var(--text-muted)" />
            <span style={{ color: '#0d9488', fontWeight: 700 }}>2. Subject</span>
            <ArrowRight size={13} color="var(--text-muted)" />
            <span style={{ color: '#0d9488', fontWeight: 700 }}>3. Chapters</span>
            <ArrowRight size={13} color="var(--text-muted)" />
            <span style={{ color: '#0d9488', fontWeight: 700 }}>4. Notes & PDFs</span>
          </div>
        </div>

        {/* View Switchers & Add Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              gap: '4px',
              backgroundColor: 'var(--bg-app)',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('workspace')}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeWorkspaceTab === 'workspace' ? '#0d9488' : 'transparent',
                color: activeWorkspaceTab === 'workspace' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activeWorkspaceTab === 'workspace' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Layers size={14} /> Curriculum Studio
            </button>

            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('notes')}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeWorkspaceTab === 'notes' ? '#0d9488' : 'transparent',
                color: activeWorkspaceTab === 'notes' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activeWorkspaceTab === 'notes' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileText size={14} /> All Notes Directory ({metrics.notesCount})
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenAddChapter}
            style={btnPrimaryStyle}
          >
            <FolderPlus size={15} /> + Add Chapter
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DUAL SELECTOR: STEP 1 (CLASS) ➔ STEP 2 (SUBJECT OF CLASS) */}
      {/* ======================================================== */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 240px) 1fr', gap: '20px', alignItems: 'start' }}>
          {/* STEP 1: SELECT CLASS */}
          <div style={{ borderRight: '1px solid var(--border-light)', paddingRight: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
              Step 1: Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{
                ...inputStyle,
                fontSize: '0.875rem',
                fontWeight: 700,
                borderColor: '#0d9488',
                backgroundColor: 'var(--bg-card)'
              }}
            >
              {classesList.map((c) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
              Select class to view & manage its subjects
            </p>
          </div>

          {/* STEP 2: SELECT SUBJECT OF THAT CLASS ("Subject class ki hogi") */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Step 2: Subjects of {selectedClass} ({subjects.length})
              </label>
              <button
                type="button"
                onClick={handleOpenAddSubject}
                style={{
                  ...btnSecondaryStyle,
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  color: '#0d9488',
                  borderColor: '#0d9488'
                }}
              >
                <Plus size={13} /> + Add Subject to {selectedClass}
              </button>
            </div>

            {/* Subject Selector Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {subjects.length === 0 ? (
                <div
                  style={{
                    padding: '8px 14px',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    border: '1px dashed #ef4444',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <AlertCircle size={15} />
                  <span>No subjects added yet for {selectedClass}. Click <strong>"+ Add Subject to {selectedClass}"</strong> to create one.</span>
                </div>
              ) : (
                subjects.map((sub) => {
                  const isSelected = selectedSubject?.id === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubject(sub)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #0d9488' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? '#0d9488' : 'var(--bg-app)',
                        color: isSelected ? '#ffffff' : 'var(--text-primary)',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 6px rgba(13, 148, 136, 0.25)' : 'none'
                      }}
                    >
                      <BookOpen size={14} color={isSelected ? '#ffffff' : 'var(--text-secondary)'} />
                      <span>{sub.name}</span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--border-light)',
                          color: isSelected ? '#ffffff' : 'var(--text-muted)',
                          padding: '1px 5px',
                          borderRadius: '4px'
                        }}
                      >
                        {sub.code || 'SUB'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ACTIVE CONTEXT STATUS BAR */}
        <div
          style={{
            borderTop: '1px solid var(--border-light)',
            paddingTop: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>Active Selection:</span>
            <span style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
              🏫 Class: {selectedClass}
            </span>
            <span>➔</span>
            <span style={{ backgroundColor: 'rgba(13, 148, 136, 0.12)', color: '#0d9488', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
              📚 Subject: {selectedSubject ? `${selectedSubject.name} (${selectedSubject.code})` : 'None Selected'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>{metrics.chaptersCount}</strong> Chapters
            </div>
            <div>•</div>
            <div>
              <strong style={{ color: '#0d9488' }}>{metrics.notesCount}</strong> Study Notes / PDFs
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. ALL-IN-ONE STUDIO: CHAPTERS (LEFT) ➔ NOTES (RIGHT) */}
      {/* ======================================================== */}
      {activeWorkspaceTab === 'workspace' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(330px, 48%) 1fr', gap: '20px', alignItems: 'start' }}>
          {/* ========================================== */}
          {/* LEFT PANEL: CHAPTERS OF SELECTED SUBJECT */}
          {/* "Chapter subject ki hogi" */}
          {/* ========================================== */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Chapters ({selectedSubject?.name || 'Subject'})
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Click a chapter to inspect its study materials & notes
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddChapter}
                style={{
                  ...btnPrimaryStyle,
                  padding: '6px 12px',
                  fontSize: '0.78rem'
                }}
              >
                <Plus size={14} /> Add Chapter
              </button>
            </div>

            {/* Quick Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search chapters or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  ...inputStyle,
                  padding: '7px 12px 7px 32px',
                  fontSize: '0.8rem'
                }}
              />
            </div>

            {loading && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Loading chapters...
              </div>
            )}

            {!loading && filteredChapters.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: '8px',
                  border: '1px dashed var(--border-color)'
                }}
              >
                <Layers size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>No Chapters Found</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '4px 0 12px' }}>
                  {selectedSubject
                    ? `No chapters added for ${selectedSubject.name} in ${selectedClass} yet.`
                    : `Please select or add a subject first.`}
                </p>
                <button type="button" onClick={handleOpenAddChapter} style={btnPrimaryStyle}>
                  <Plus size={14} /> Add Chapter 1
                </button>
              </div>
            )}

            {!loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredChapters.map((ch) => {
                  const isSelected = selectedChapterForNotes?.id === ch.id;
                  const directNotes = ch.notes || [];
                  const notesCount = directNotes.length;

                  return (
                    <div
                      key={ch.id}
                      onClick={() => setSelectedChapterForNotes(ch)}
                      style={{
                        border: isSelected ? '2px solid #0d9488' : '1px solid var(--border-color)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: isSelected ? 'rgba(13, 148, 136, 0.03)' : 'var(--bg-card)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {/* Chapter Item Header */}
                      <div
                        style={{
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: isSelected ? 'rgba(13, 148, 136, 0.08)' : 'var(--bg-app)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                          <span
                            style={{
                              backgroundColor: '#0d9488',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {ch.chapterNumber}
                          </span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {ch.chapterTitle}
                            </h4>

                            {/* "capter kis subject ka hi kaise pata chalega" -> Explicit Metadata Badges */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.7rem', color: '#0d9488', fontWeight: 700, backgroundColor: 'rgba(13, 148, 136, 0.1)', padding: '1px 6px', borderRadius: '3px' }}>
                                📚 {ch.subjectName || selectedSubject?.name || 'Subject'}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-card)', padding: '1px 6px', borderRadius: '3px', border: '1px solid var(--border-light)' }}>
                                🏫 {ch.className || selectedClass}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Chapter Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                          {/* Notes Count Badge */}
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              backgroundColor: notesCount > 0 ? 'rgba(13, 148, 136, 0.15)' : 'var(--bg-app)',
                              color: notesCount > 0 ? '#0d9488' : 'var(--text-muted)'
                            }}
                          >
                            {notesCount} {notesCount === 1 ? 'Note' : 'Notes'}
                          </span>

                          {/* Direct Add Note Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenAddNoteToChapter(ch)}
                            title="Add Note directly to this Chapter"
                            style={{
                              border: '1px solid #0d9488',
                              background: 'rgba(13, 148, 136, 0.1)',
                              color: '#0d9488',
                              cursor: 'pointer',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            <Upload size={12} /> + Note
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditChapter(ch)}
                            title="Edit Chapter"
                            style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: '3px' }}
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteChapter(ch.id, ch.chapterTitle)}
                            title="Delete Chapter"
                            style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '3px' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Chapter Overview */}
                      {ch.description && (
                        <div style={{ padding: '6px 14px 8px', fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-light)' }}>
                          {ch.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ========================================== */}
          {/* RIGHT PANEL: STUDY NOTES OF SELECTED CHAPTER */}
          {/* "Notes chapter ki hogi" */}
          {/* ========================================== */}
          <div className="card" style={{ padding: '20px', minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
            {selectedChapterForNotes ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ backgroundColor: '#0d9488', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px' }}>
                        {selectedChapterForNotes.chapterNumber}
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                        {selectedChapterForNotes.chapterTitle}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>Subject: <strong>{selectedSubject?.name || 'Subject'}</strong></span>
                      <span>•</span>
                      <span>Class: <strong>{selectedChapterForNotes.className || selectedClass}</strong></span>
                      <span>•</span>
                      <span>Attached: <strong style={{ color: '#0d9488' }}>{(selectedChapterForNotes.notes || []).length} Study Notes</strong></span>
                    </div>
                  </div>

                  {/* Primary Note Upload Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenAddNoteToChapter(selectedChapterForNotes)}
                    style={btnPrimaryStyle}
                  >
                    <Upload size={14} /> + Upload Note / PDF
                  </button>
                </div>

                {/* Study Notes List for Selected Chapter */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
                    Published Study Materials for this Chapter
                  </h4>

                  {(!selectedChapterForNotes.notes || selectedChapterForNotes.notes.length === 0) ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        backgroundColor: 'var(--bg-app)',
                        borderRadius: '8px',
                        border: '1px dashed var(--border-color)',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <FileText size={32} color="var(--border-color)" style={{ margin: '0 auto 8px' }} />
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        No study notes attached to this chapter yet.
                      </p>
                      <p style={{ margin: '4px 0 12px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Upload PDF documents or handwritten revision sheets for students.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenAddNoteToChapter(selectedChapterForNotes)}
                        style={btnPrimaryStyle}
                      >
                        <Upload size={14} /> Upload First Note to Chapter
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {selectedChapterForNotes.notes.map((note, idx) => (
                        <div
                          key={note.id || idx}
                          style={{
                            padding: '12px 14px',
                            backgroundColor: 'var(--bg-app)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.75rem'
                              }}
                            >
                              {note.fileType || 'PDF'}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <h5 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {note.title}
                              </h5>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                <span>{note.fileSizeFormatted || 'Document'}</span>
                                <span>•</span>
                                <span>{note.uploadedDate || 'Recent'}</span>
                                {note.description && (
                                  <>
                                    <span>•</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{note.description}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Note Action Buttons */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {note.fileUrl && (
                              <a
                                href={note.fileUrl.startsWith('http') ? note.fileUrl : `http://localhost:8080${note.fileUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  ...btnSecondaryStyle,
                                  padding: '4px 8px',
                                  fontSize: '0.75rem',
                                  textDecoration: 'none'
                                }}
                              >
                                <ExternalLink size={12} /> View
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(note.id, note.title)}
                              style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                              title="Delete Note"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '80px 20px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}
              >
                <BookOpen size={48} color="var(--border-color)" style={{ marginBottom: '14px' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>
                  No Chapter Selected
                </h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '6px 0 0 0', maxWidth: '300px' }}>
                  Click any chapter from the left panel to view and attach its study notes.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. TAB 2: ALL NOTES DIRECTORY TABLE */}
      {/* ======================================================== */}
      {activeWorkspaceTab === 'notes' && (
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              All Published Notes for {selectedSubject?.name || 'Subject'} ({metrics.notesCount})
            </h3>
          </div>

          {metrics.allNotesList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No notes published yet. Go to "Curriculum Studio" and click "+ Upload Note" on a chapter.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 12px' }}>#</th>
                  <th style={{ padding: '10px 12px' }}>Note Title</th>
                  <th style={{ padding: '10px 12px' }}>Belongs To Chapter</th>
                  <th style={{ padding: '10px 12px' }}>Subject & Class</th>
                  <th style={{ padding: '10px 12px' }}>Type & Size</th>
                  <th style={{ padding: '10px 12px' }}>Date</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {metrics.allNotesList.map((n, idx) => (
                  <tr key={n.id || idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px' }}>{idx + 1}</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{n.title}</td>
                    <td style={{ padding: '12px', color: '#0d9488', fontWeight: 600 }}>{n.belongsTo}</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{n.subjectName} ({n.className || selectedClass})</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                        {n.fileType || 'PDF'}
                      </span>
                      <span style={{ marginLeft: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.fileSizeFormatted}</span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{n.uploadedDate}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {n.fileUrl && (
                          <a
                            href={n.fileUrl.startsWith('http') ? n.fileUrl : `http://localhost:8080${n.fileUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ ...btnSecondaryStyle, padding: '4px 8px', fontSize: '0.75rem', textDecoration: 'none' }}
                          >
                            <ExternalLink size={12} /> View
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(n.id, n.title)}
                          style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL: ADD SUBJECT ("Subject class ki hogi") */}
      {/* ======================================================== */}
      {isSubjectModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            padding: '20px'
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: 0,
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-app)'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Add Subject to {subjectForm.className}
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#0d9488', margin: '2px 0 0 0', fontWeight: 600 }}>
                  Hierarchy: Class ➔ Subject
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSubjectModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  Target Class *
                </label>
                <select
                  value={subjectForm.className}
                  onChange={(e) => setSubjectForm({ ...subjectForm, className: e.target.value })}
                  style={inputStyle}
                  required
                >
                  {classesList.map((c) => (
                    <option key={c.id || c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science, Mathematics, English"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Subject Code (Optional - e.g. SCI-10, MATH-10)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty for auto-generated code"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsSubjectModalOpen(false)} style={btnSecondaryStyle}>
                  Cancel
                </button>
                <button type="submit" disabled={savingSubject} style={btnPrimaryStyle}>
                  {savingSubject ? 'Saving...' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL: ADD / EDIT CHAPTER ("Chapter subject ki hogi") */}
      {/* ======================================================== */}
      {isChapterModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            padding: '20px'
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: 0,
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-app)'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {chapterModalMode === 'create' ? 'Add Chapter to Subject' : 'Edit Chapter'}
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#0d9488', margin: '2px 0 0 0', fontWeight: 600 }}>
                  Hierarchy: {chapterForm.className} ➔ {selectedSubject?.name || 'Subject'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsChapterModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveChapter} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Class and Subject Selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                      Belongs to Subject *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChapterModalOpen(false);
                        handleOpenAddSubject();
                      }}
                      style={{ fontSize: '0.72rem', color: '#0d9488', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      + New Subject
                    </button>
                  </div>
                  <select
                    value={chapterForm.subjectId || selectedSubject?.id || ''}
                    onChange={(e) => setChapterForm({ ...chapterForm, subjectId: e.target.value })}
                    style={inputStyle}
                    required
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                    Target Class *
                  </label>
                  <select
                    value={chapterForm.className}
                    onChange={(e) => setChapterForm({ ...chapterForm, className: e.target.value })}
                    style={inputStyle}
                    required
                  >
                    {classesList.map((c) => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chapter Number & Title */}
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                    Chapter No. *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chapter 1"
                    value={chapterForm.chapterNumber}
                    onChange={(e) => setChapterForm({ ...chapterForm, chapterNumber: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                    Chapter Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chemical Reactions & Equations"
                    value={chapterForm.chapterTitle}
                    onChange={(e) => setChapterForm({ ...chapterForm, chapterTitle: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Chapter Overview / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Key concepts covered in this chapter..."
                  value={chapterForm.description}
                  onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsChapterModalOpen(false)} style={btnSecondaryStyle}>
                  Cancel
                </button>
                <button type="submit" disabled={savingChapter} style={btnPrimaryStyle}>
                  {savingChapter ? 'Saving...' : 'Save Chapter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. MODAL: UPLOAD NOTES ("Notes chapter ki hogi") */}
      {/* ======================================================== */}
      {isNoteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            padding: '20px'
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: 0,
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-app)'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Upload Note / PDF Material
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#0d9488', margin: '2px 0 0 0', fontWeight: 700 }}>
                  Attaching to {noteTargetChapter?.chapterNumber} - {noteTargetChapter?.chapterTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNote} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  Target Chapter *
                </label>
                <select
                  value={noteForm.chapterId || noteTargetChapter?.id || ''}
                  onChange={(e) => setNoteForm({ ...noteForm, chapterId: e.target.value })}
                  style={inputStyle}
                  required
                >
                  {chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.chapterNumber} - {c.chapterTitle} ({c.className || selectedClass})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  Note Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 1 Complete Handwritten Notes & Formulas"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Teacher Instructions / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Must read sections 1 to 4 before solving exercises..."
                  value={noteForm.description}
                  onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {/* Styled File Drop Box */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  Select PDF or Document *
                </label>
                <div
                  style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-app)',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNoteForm({ ...noteForm, file: e.target.files[0] });
                      }
                    }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                  <Upload size={28} color="#0d9488" style={{ margin: '0 auto 8px' }} />
                  {noteForm.file ? (
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d9488' }}>
                      ✓ {noteForm.file.name} ({(noteForm.file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  ) : (
                    <div>
                      <p style={{ margin: 0, fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Click to upload or drag PDF here
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        PDF, Word, or PowerPoint files up to 50MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Link Fallback */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Or Google Drive / Document Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={noteForm.directUrl}
                  onChange={(e) => setNoteForm({ ...noteForm, directUrl: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {/* Downloadable Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                <input
                  type="checkbox"
                  id="allowDownloadCheck"
                  checked={noteForm.isDownloadable}
                  onChange={(e) => setNoteForm({ ...noteForm, isDownloadable: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#0d9488' }}
                />
                <label htmlFor="allowDownloadCheck" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Allow students in mobile app to download this note for offline reading
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsNoteModalOpen(false)} style={btnSecondaryStyle}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingNote}
                  style={{
                    ...btnPrimaryStyle,
                    opacity: uploadingNote ? 0.6 : 1
                  }}
                >
                  {uploadingNote ? 'Uploading...' : 'Publish Note to Chapter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
