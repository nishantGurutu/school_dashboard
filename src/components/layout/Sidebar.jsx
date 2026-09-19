import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { authStorage } from '../../services/api';
import {
  Home,
  GraduationCap,
  UserCheck,
  User,
  ListOrdered,
  FileEdit,
  CircleDollarSign,
  CalendarCheck,
  Clock,
  Award,
  BookOpen,
  DollarSign,
  UserCog,
  BookMarked,
  ChevronRight,
  ChevronDown,
  FolderKanban,
  Kanban
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, isSidebarCollapsed } = useTheme();
  const [openSubMenu, setOpenSubMenu] = useState('classes'); // Default open classes sub-menu
  const currentUser = authStorage.getUser();

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Home, hasSub: true },
    { key: 'students', label: 'Students', icon: GraduationCap, hasSub: true },
    { key: 'teachers', label: 'Teachers', icon: UserCheck, hasSub: true },
    { key: 'guardian', label: 'Guardian', icon: User, hasSub: true },
    {
      key: 'classes',
      label: 'Classes',
      icon: ListOrdered,
      hasSub: true,
      subItems: [
        { key: 'classes-section', label: 'Section' },
        { key: 'classes-subjects', label: 'Subjects' },
        { key: 'classes-list', label: 'Class List' },
        { key: 'classes-room', label: 'Class Room' }
      ]
    },
    {
      key: 'examinations',
      label: 'Examinations',
      icon: FileEdit,
      hasSub: true,
      subItems: [
        { key: 'examinations-exam', label: 'Exam' },
        { key: 'examinations-schedule', label: 'Exam Schedule' },
        { key: 'examinations-result', label: 'Exam Result' }
      ]
    },
    {
      key: 'fees',
      label: 'Fees Collection',
      icon: CircleDollarSign,
      hasSub: true,
      subItems: [
        { key: 'fees-collect', label: 'Fees Collect' },
        { key: 'fees-type', label: 'Fees Type' },
        { key: 'fees-group', label: 'Fees Group' },
        { key: 'fees-discount', label: 'Fees Discount' }
      ]
    },
    {
      key: 'attendance',
      label: 'Attendance',
      icon: CalendarCheck,
      hasSub: true,
      subItems: [
        { key: 'attendance-student', label: 'Student Attendance' },
        { key: 'attendance-teacher', label: 'Teacher Attendance' },
        { key: 'attendance-employee', label: 'Employee Attendance' }
      ]
    },
    {
      key: 'leaves',
      label: 'Leaves',
      icon: Clock,
      hasSub: true,
      subItems: [
        { key: 'leaves-type', label: 'Leave Types' },
        { key: 'leaves-request', label: 'Leave Request' }
      ]
    },
    { key: 'certificate', label: 'Certificate', icon: Award, hasSub: false },
    {
      key: 'library',
      label: 'Library',
      icon: BookOpen,
      hasSub: true,
      subItems: [
        { key: 'library-books', label: 'Books List' },
        { key: 'library-members', label: 'Members List' },
        { key: 'library-issue-return', label: 'Issue Return' }
      ]
    },
    {
      key: 'accounts',
      label: 'Accounts',
      icon: DollarSign,
      hasSub: true,
      subItems: [
        { key: 'accounts-income-head', label: 'Income Head' },
        { key: 'accounts-income-list', label: 'Income List' },
        { key: 'accounts-expense-head', label: 'Expense Head' },
        { key: 'accounts-expense-list', label: 'Expense List' },
        { key: 'accounts-transaction', label: 'Transaction' }
      ]
    },
    { key: 'hrm', label: 'HRM', icon: UserCog, hasSub: true },
    { key: 'notice', label: 'Notice Board', icon: BookMarked, hasSub: false }
  ];

  const handleParentNavClick = (item) => {
    if (item.subItems) {
      if (openSubMenu === item.key) {
        setOpenSubMenu(null);
      } else {
        setOpenSubMenu(item.key);
        if (item.key === 'classes' && !activeTab.startsWith('classes')) {
          setActiveTab('classes-section');
        }
        if (item.key === 'examinations' && !activeTab.startsWith('examinations')) {
          setActiveTab('examinations-exam');
        }
        if (item.key === 'fees' && !activeTab.startsWith('fees')) {
          setActiveTab('fees-collect');
        }
        if (item.key === 'attendance' && !activeTab.startsWith('attendance')) {
          setActiveTab('attendance-student');
        }
        if (item.key === 'leaves' && !activeTab.startsWith('leaves')) {
          setActiveTab('leaves-type');
        }
        if (item.key === 'library' && !activeTab.startsWith('library')) {
          setActiveTab('library-books');
        }
        if (item.key === 'accounts' && !activeTab.startsWith('accounts')) {
          setActiveTab('accounts-income-head');
        }
      }
    } else {
      setActiveTab(item.key);
    }
  };

  const isItemActive = (item) => {
    if (activeTab === item.key) return true;
    if (item.key === 'classes' && activeTab.startsWith('classes')) return true;
    if (item.key === 'examinations' && activeTab.startsWith('examinations')) return true;
    if (item.key === 'fees' && activeTab.startsWith('fees')) return true;
    if (item.key === 'attendance' && activeTab.startsWith('attendance')) return true;
    if (item.key === 'leaves' && activeTab.startsWith('leaves')) return true;
    if (item.key === 'library' && activeTab.startsWith('library')) return true;
    if (item.key === 'accounts' && activeTab.startsWith('accounts')) return true;
    return false;
  };

  return (
    <aside
      style={{
        width: isSidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          padding: isSidebarCollapsed ? '0 20px' : '0 24px',
          gap: '12px',
          borderBottom: '1px solid var(--border-light)'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 50%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
            flexShrink: 0
          }}
        >
          <GraduationCap size={22} color="#ffffff" />
        </div>
        {!isSidebarCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                color: 'var(--text-primary)',
                fontFamily: 'Urbanist, sans-serif',
                lineHeight: 1.1
              }}
            >
              EduDash
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              SCHOOL MANAGEMENT
            </span>
          </div>
        )}
      </div>

      {/* Admin Profile Widget matching screenshot */}
      {!isSidebarCollapsed && (
        <div
          style={{
            margin: '12px 12px 4px 12px',
            padding: '10px 14px',
            backgroundColor: 'var(--bg-app)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid var(--border-light)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
              alt="Admin"
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.2 }}>{(currentUser && currentUser.name) || 'Admin'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{(currentUser && currentUser.role) || 'Admin'}</div>
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-muted)" />
        </div>
      )}

      {/* Sidebar Function List */}
      <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map((item) => {
          const IconComp = item.icon;
          const isActive = isItemActive(item);
          const isSubMenuOpen = openSubMenu === item.key;

          return (
            <div key={item.key} style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                onClick={() => handleParentNavClick(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? '#0d9488' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(13, 148, 136, 0.25)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <IconComp size={18} color={isActive ? '#ffffff' : 'var(--text-secondary)'} />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </div>

                {!isSidebarCollapsed && item.hasSub && (
                  isSubMenuOpen ? <ChevronDown size={16} color={isActive ? '#ffffff' : 'var(--text-muted)'} /> : <ChevronRight size={16} color="var(--text-muted)" />
                )}
              </button>

              {/* Sub-items list matching screenshot */}
              {!isSidebarCollapsed && item.subItems && isSubMenuOpen && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    paddingLeft: '32px',
                    marginTop: '4px',
                    gap: '2px'
                  }}
                >
                  {item.subItems.map((sub) => {
                    const isSubActive = activeTab === sub.key || (sub.key === 'classes-section' && activeTab === 'classes');
                    return (
                      <button
                        key={sub.key}
                        onClick={() => setActiveTab(sub.key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'transparent',
                          color: isSubActive ? '#0d9488' : 'var(--text-secondary)',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: isSubActive ? 700 : 500,
                          fontSize: '0.85rem',
                          textAlign: 'left',
                          width: '100%',
                          transition: 'color 0.2s ease'
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: isSubActive ? '#0d9488' : 'var(--text-muted)'
                          }}
                        />
                        <span>{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Extra Interactive Tools */}
        {!isSidebarCollapsed && (
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '1px',
              marginTop: '16px',
              marginBottom: '8px',
              paddingLeft: '12px'
            }}
          >
            INTERACTIVE TOOLS
          </div>
        )}

        <button
          onClick={() => setActiveTab('project')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeTab === 'project' ? 'var(--accent-primary-light)' : 'transparent',
            color: activeTab === 'project' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'project' ? 600 : 500,
            fontSize: '0.9rem',
            width: '100%',
            textAlign: 'left'
          }}
        >
          <FolderKanban size={18} />
          {!isSidebarCollapsed && <span>Campus Projects</span>}
        </button>

        <button
          onClick={() => setActiveTab('kanban')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeTab === 'kanban' ? 'var(--accent-primary-light)' : 'transparent',
            color: activeTab === 'kanban' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'kanban' ? 600 : 500,
            fontSize: '0.9rem',
            width: '100%',
            textAlign: 'left'
          }}
        >
          <Kanban size={18} />
          {!isSidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', width: '100%' }}>
              <span>Kanban Tasks</span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  marginLeft: 'auto'
                }}
              >
                Drag
              </span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
