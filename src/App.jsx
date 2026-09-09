import React from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

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
import { NoticeBoardModule } from './components/modules/NoticeBoardModule';

import { ThemeCustomizerModal } from './components/customizer/ThemeCustomizerModal';

const MainLayout = () => {
  const { activeTab, isSidebarCollapsed } = useTheme();

  const renderModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SchoolAdminDashboard />;
      case 'students':
        return <StudentsModule />;
      case 'teachers':
        return <TeachersModule />;
      case 'guardian':
        return <GuardianModule />;
      case 'classes':
      case 'classes-section':
      case 'classes-subjects':
      case 'classes-list':
      case 'classes-room':
        return <ClassesModule />;
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
        return <AccountsModule />;
      case 'hrm':
        return <HrmModule />;
      case 'notice':
        return <NoticeBoardModule />;
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
        <Header />
        <main className="page-body">
          {renderModule()}
        </main>
      </div>
      <ThemeCustomizerModal />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <MainLayout />
    </ThemeProvider>
  );
}
