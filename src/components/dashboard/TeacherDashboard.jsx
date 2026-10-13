import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { authStorage } from '../../services/api';

const actions = [
  ['homework', 'Assignments', 'Publish homework for students.'],
  ['classes-timetable', 'My timetable', 'View your teaching schedule.'],
  ['attendance-student', 'Student attendance', 'Record daily student attendance.'],
  ['curriculum', 'Lessons & study materials', 'Manage chapters, topics and learning notes.'],
  ['examinations-result', 'Exam results', 'Enter student marks and review results.'],
  ['leaves-request', 'Leave requests', 'View and manage leave requests.'],
  ['notice', 'Announcements', 'Read school notices.'],
];

export function TeacherDashboard() {
  const { setActiveTab } = useTheme();
  return <section>
    <h1>Welcome, {authStorage.getUser()?.name || 'Teacher'}</h1>
    <p>Your classroom workspace</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginTop: 24 }}>
      {actions.map(([key, title, description]) => <button key={key} onClick={() => setActiveTab(key)} style={{ textAlign: 'left', padding: 24, borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer' }}>
        <h2 style={{ fontSize: 18 }}>{title}</h2><p>{description}</p>
      </button>)}
    </div>
  </section>;
}

