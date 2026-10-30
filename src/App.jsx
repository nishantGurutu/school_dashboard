import { ChatModule } from './components/modules/ChatModule';
import { ChatSessionProvider } from './context/ChatSessionContext';
import { SettingsModule } from './components/modules/SettingsModule';
import { StudentReportsModule } from './components/modules/StudentReportsModule';
import { PortalModule } from './components/modules/PortalModule';
import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { authStorage } from './services/api';
import { canAccess, roleFor } from './config/roleAccess';
import { AccountantDashboard } from './components/dashboard/AccountantDashboard';
import { TeacherDashboard } from './components/dashboard/TeacherDashboard';
import { HomeworkModule } from './components/modules/HomeworkModule';
import { authService } from './services/authService';

import { SchoolAdminDashboard } from './components/dashboard/SchoolAdminDashboard';
import { ProjectDashboard } from './components/dashboard/ProjectDashboard';
import { KanbanBoard } from './components/kanban/KanbanBoard';

import { StudentsModule } from './components/modules/StudentsModule';
import { TeachersModule } from './components/modules/TeachersModule';
import { GuardianModule } from './components/modules/GuardianModule';
import { ClassesModule } from './components/modules/ClassesModule';
import { ExaminationsModule } from './components/modules/ExaminationsModule';
import { FeesCollectionModule } from './components/modules/FeesCollectionModule';
import { AttendanceModule } from './components/modules/AttendanceModule';
import { LeavesModule } from './components/modules/LeavesModule';
import { CertificateModule } from './components/modules/CertificateModule';
import { LibraryModule } from './components/modules/LibraryModule';
import { AccountsModule } from './components/modules/AccountsModule';
import { HrmModule } from './components/modules/HrmModule';
import { DesignationModule } from './components/modules/DesignationModule';
import { NoticeBoardModule } from './components/modules/NoticeBoardModule';
import { HolidaysModule } from './components/modules/HolidaysModule';
import { TimetableModule } from './components/modules/TimetableModule';
import { BannersModule } from './components/modules/BannersModule';
import { GalleryModule } from './components/modules/GalleryModule';
import { TeacherCurriculumModule } from './components/modules/TeacherCurriculumModule';
import { TransportModule } from './components/modules/TransportModule';

import { ThemeCustomizerModal } from './components/customizer/ThemeCustomizerModal';
import { LoginScreen } from './components/auth/LoginScreen';

const MainLayout = ({ onLogout }) => {
  const { activeTab, setActiveTab, isSidebarCollapsed } = useTheme();

  useEffect(() => {
    setActiveTab('dashboard');
  }, [setActiveTab]);

  const renderModule = () => {
    if (!canAccess(authStorage.getUser(), activeTab)) return <p role="alert">You do not have access to this module.</p>;
    switch (activeTab) {
      case 'chat': return <ChatModule />;
      case 'settings': return <SettingsModule />;
      case 'dashboard':
        return roleFor(authStorage.getUser()) === 'ACCOUNTANT' ? <AccountantDashboard />
          : roleFor(authStorage.getUser()) === 'TEACHER' ? <TeacherDashboard /> : <SchoolAdminDashboard />;
      case 'portal':
        return <PortalModule />;
      case 'homework':
        return <HomeworkModule />;
      case 'students':
        return <StudentsModule />;
      case 'teachers':
      case 'staff':
        return <TeachersModule />;
      case 'guardian':
        return <GuardianModule />;
      case 'classes-timetable':
      case 'academic-timetable':
      case 'timetable':
        return <TimetableModule />;
      case 'curriculum':
      case 'teacher-curriculum':
      case 'curriculum-notes':
        return <TeacherCurriculumModule />;
      case 'classes':
      case 'classes-department':
      case 'classes-departments':
      case 'classes-designation':
      case 'classes-designations':
      case 'department':
      case 'departments':
      case 'classes-section':
      case 'classes-subjects':
      case 'classes-list':
      case 'classes-room':
        return <ClassesModule />;
      case 'examinations-reports':
        return <StudentReportsModule />;
      case 'examinations':
      case 'examinations-exam':
      case 'examinations-schedule':
      case 'examinations-result':
        return <ExaminationsModule />;
      case 'fees':
      case 'fees-collect':
      case 'fees-type':
      case 'fees-group':
      case 'fees-discount':
        return <FeesCollectionModule />;
      case 'attendance':
      case 'attendance-student':
      case 'attendance-teacher':
      case 'attendance-employee':
        return <AttendanceModule />;
      case 'holidays':
        return <HolidaysModule />;
      case 'leaves':
      case 'leaves-type':
      case 'leaves-request':
        return <LeavesModule />;
      case 'certificate':
        return <CertificateModule />;
      case 'library':
      case 'library-books':
      case 'library-members':
      case 'library-details':
      case 'library-issue-return':
        return <LibraryModule />;
      case 'accounts':
      case 'accounts-income-head':
      case 'accounts-income-list':
      case 'accounts-expense-head':
      case 'accounts-expense-list':
      case 'accounts-transaction':
        return <AccountsModule />;
      case 'hrm':
      case 'hrm-staff':
        return <HrmModule />;
      case 'hrm-designation':
      case 'designation':
      case 'designations':
        return <DesignationModule />;
      case 'notice':
        return <NoticeBoardModule />;
      case 'banners':
        return <BannersModule />;
      case 'gallery':
        return <GalleryModule />;
      case 'transport':
      case 'transport-overview':
      case 'transport-buses':
      case 'transport-drivers':
      case 'transport-routes':
      case 'transport-assignments':
      case 'transport-safety-checklist':
      case 'transport-students':
      case 'transport-fees':
      case 'transport-live':
      case 'transport-reports':
      case 'transport-alerts':
        return <TransportModule />;
      case 'project':
        return <ProjectDashboard />;
      case 'kanban':
        return <KanbanBoard />;
      default:
        return <SchoolAdminDashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div
        className="main-content"
        style={{
          marginLeft: isSidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'
        }}
      >
        <Header onLogout={onLogout} />
        <main className="page-body">
          {renderModule()}
        </main>
      </div>
      <ThemeCustomizerModal />
    </div>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const accessToken = authStorage.getAccessToken();
    return Boolean(accessToken);
  });

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => setIsAuthenticated(false);
    window.addEventListener('auth:expired', handleSessionExpired);
    return () => window.removeEventListener('auth:expired', handleSessionExpired);
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        {isAuthenticated ? <ChatSessionProvider><MainLayout onLogout={handleLogout} /></ChatSessionProvider> : <LoginScreen onLogin={() => setIsAuthenticated(true)} />}
      </ToastProvider>
    </ThemeProvider>
  );
}


