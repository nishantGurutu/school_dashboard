import React, { useState, useRef } from 'react';
import Chart from 'react-apexcharts';
import {
  FileText,
  CheckSquare,
  Hourglass,
  ChevronDown,
  ChevronLeft,
  GripHorizontal
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ProjectDashboard = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Dates definition for September (01 T to 16 W)
  const dates = [
    { day: '01', letter: 'T' },
    { day: '02', letter: 'W' },
    { day: '03', letter: 'T' },
    { day: '04', letter: 'F' },
    { day: '05', letter: 'S' },
    { day: '06', letter: 'S' },
    { day: '07', letter: 'M' },
    { day: '08', letter: 'T' },
    { day: '09', letter: 'W' },
    { day: '10', letter: 'T' },
    { day: '11', letter: 'F' },
    { day: '12', letter: 'S' },
    { day: '13', letter: 'S' },
    { day: '14', letter: 'M' },
    { day: '15', letter: 'T' },
    { day: '16', letter: 'W' }
  ];

  // Initial Draggable Timeline Tasks Data matching user screenshot exactly
  const initialProjectsData = [
    {
      id: 'proj-1',
      name: 'Design new app',
      indicatorColor: '#2563eb', // Blue
      theme: 'blue',
      tasks: [
        { id: 't-1', name: 'Research User Needs', startCol: 0, span: 9 },
        { id: 't-2', name: 'Create Wireframe Layouts', startCol: 11, span: 5 }
      ]
    },
    {
      id: 'proj-2',
      name: 'New dashboard',
      indicatorColor: '#2563eb', // Blue
      theme: 'blue',
      tasks: [
        { id: 't-3', name: 'Finish designing', startCol: 0, span: 4 },
        { id: 't-4', name: 'System Deployment', startCol: 5, span: 11 }
      ]
    },
    {
      id: 'proj-3',
      name: 'Falcon Development',
      indicatorColor: '#f97316', // Orange
      theme: 'orange',
      tasks: [
        { id: 't-5', name: 'Analyze Competitor Apps', startCol: 0, span: 7 },
        { id: 't-6', name: 'Design Database Schema', startCol: 10, span: 6 }
      ]
    },
    {
      id: 'proj-4',
      name: 'Phoenix Travel App',
      indicatorColor: '#10b981', // Green
      theme: 'green',
      tasks: [
        { id: 't-7', name: 'Develop Bac..', startCol: 0, span: 3 },
        { id: 't-8', name: 'Gather User Requirements', startCol: 3, span: 13 }
      ]
    },
    {
      id: 'proj-5',
      name: 'Design Finance App',
      indicatorColor: '#10b981', // Green
      theme: 'green',
      tasks: [
        { id: 't-9', name: 'Implement Authentication and Authorization', startCol: 0, span: 16 }
      ]
    },
    {
      id: 'proj-6',
      name: 'Update Figma File',
      indicatorColor: '#10b981', // Green
      theme: 'green',
      tasks: [
        { id: 't-10', name: 'Develop Initial Prototype', startCol: 0, span: 4 },
        { id: 't-11', name: 'Identify Elements to be Updated', startCol: 6, span: 6 },
        { id: 't-12', name: 'Create Detailed Project Plan', startCol: 13, span: 3 }
      ]
    }
  ];

  const [projects, setProjects] = useState(initialProjectsData);

  // Drag State Management for Timeline Boxes
  const [draggingTask, setDraggingTask] = useState(null); // { projId, taskId, offsetX, initialStartCol }
  const timelineGridRef = useRef(null);

  // Helper for Task Box Colors
  const getTaskStyles = (themeType) => {
    switch (themeType) {
      case 'blue':
        return {
          bg: isDark ? 'rgba(59, 130, 246, 0.25)' : '#dbeafe',
          text: isDark ? '#93c5fd' : '#1e40af',
          border: isDark ? 'rgba(59, 130, 246, 0.4)' : '#bfdbfe'
        };
      case 'orange':
        return {
          bg: isDark ? 'rgba(249, 115, 22, 0.25)' : '#ffedd5',
          text: isDark ? '#fdba74' : '#9a3412',
          border: isDark ? 'rgba(249, 115, 22, 0.4)' : '#fed7aa'
        };
      case 'green':
        return {
          bg: isDark ? 'rgba(16, 185, 129, 0.25)' : '#d1fae5',
          text: isDark ? '#6ee7b7' : '#065f46',
          border: isDark ? 'rgba(16, 185, 129, 0.4)' : '#a7f3d0'
        };
      default:
        return {
          bg: '#dbeafe',
          text: '#1e40af',
          border: '#bfdbfe'
        };
    }
  };

  // Drag Handlers for Timeline Boxes
  const handleDragStart = (e, projId, task) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ projId, taskId: task.id }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTask({ projId, taskId: task.id });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnCell = (projId, colIndex) => {
    if (!draggingTask) return;

    setProjects((prevProjects) => {
      return prevProjects.map((p) => {
        // Remove task from old project if moved
        const filteredTasks = p.tasks.filter((t) => t.id !== draggingTask.taskId);

        if (p.id === projId) {
          // Find original task
          let taskToMove = null;
          prevProjects.forEach((oldP) => {
            const found = oldP.tasks.find((t) => t.id === draggingTask.taskId);
            if (found) taskToMove = { ...found };
          });

          if (taskToMove) {
            // Keep inside bounds
            const newStartCol = Math.max(0, Math.min(dates.length - taskToMove.span, colIndex));
            taskToMove.startCol = newStartCol;
            return {
              ...p,
              tasks: [...filteredTasks, taskToMove]
            };
          }
        }
        return { ...p, tasks: filteredTasks };
      });
    });

    setDraggingTask(null);
  };

  // Project Deadlines Donut Gauge Chart Options
  const deadlinesGaugeOptions = {
    chart: { type: 'donut' },
    colors: ['#10b981', '#3b82f6', '#f97316'],
    labels: ['Before deadline', 'On deadline', 'After deadline'],
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { width: 4, colors: [isDark ? '#1f2937' : '#ffffff'] },
    plotOptions: {
      pie: {
        donut: {
          size: '80%',
          labels: {
            show: true,
            total: {
              show: true,
              label: '',
              formatter: () => '23'
            },
            value: {
              show: true,
              fontSize: '32px',
              fontWeight: 800,
              color: isDark ? '#f9fafb' : '#1e293b'
            }
          }
        }
      }
    }
  };
  const deadlinesGaugeSeries = [3, 14, 6];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top 3 Summary Cards */}
      <div className="grid-responsive">
        {/* Card 1: Running */}
        <div className="col-span-4 card animate-fade-in" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--accent-primary-light)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileText size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Running : <span style={{ fontSize: '1.35rem' }}>7</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '0.8rem' }}>
                <span
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  2 less
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>than last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Completed */}
        <div className="col-span-4 card animate-fade-in" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CheckSquare size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Completed : <span style={{ fontSize: '1.35rem' }}>24</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '0.8rem' }}>
                <span
                  style={{
                    backgroundColor: 'var(--color-success-bg)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    color: 'var(--color-success)'
                  }}
                >
                  5 more
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>than last week</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Due Soon */}
        <div className="col-span-4 card animate-fade-in" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-warning-bg)',
                color: '#f97316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Hourglass size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Due Soon : <span style={{ fontSize: '1.35rem' }}>23</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Deadline:</span>
                <span style={{ fontWeight: 700, color: '#f97316' }}>03 Mar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: Project Timeline + Deadlines Right Sidebar */}
      <div className="grid-responsive">
        {/* Left Span 8: Project Timeline with Interactive Draggable Colorful Boxes */}
        <div className="col-span-8 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
          {/* Timeline Title & Month Picker */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Project timeline</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Status of completion for all projects
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              September <ChevronDown size={16} />
            </div>
          </div>

          {/* Interactive Timeline Grid Table */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ minWidth: '850px', display: 'flex', flexDirection: 'column' }}>
              {/* Header Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-app)',
                  borderBottom: '1px solid var(--border-color)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)'
                }}
              >
                {/* Left Column Label */}
                <div
                  style={{
                    width: '210px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRight: '1px solid var(--border-color)',
                    flexShrink: 0
                  }}
                >
                  <span>All Projects</span>
                  <button className="btn-icon" style={{ width: '22px', height: '22px' }}>
                    <ChevronLeft size={14} />
                  </button>
                </div>

                {/* September Header & Date Columns Header */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '6px 16px', fontSize: '0.75rem', fontWeight: 700, borderBottom: '1px solid var(--border-light)' }}>
                    September
                  </div>
                  <div style={{ display: 'flex', width: '100%' }}>
                    {dates.map((d, idx) => (
                      <div
                        key={idx}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          textAlign: 'center',
                          borderRight: idx < dates.length - 1 ? '1px solid var(--border-light)' : 'none',
                          fontSize: '0.75rem'
                        }}
                      >
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.day}</span>{' '}
                        <span style={{ color: 'var(--text-muted)' }}>{d.letter}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Project Rows & Draggable Colorful Task Boxes */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {projects.map((project) => (
                  <div
                    key={project.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border-light)',
                      height: '56px',
                      position: 'relative'
                    }}
                  >
                    {/* Left Project Name */}
                    <div
                      style={{
                        width: '210px',
                        padding: '0 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        borderRight: '1px solid var(--border-color)',
                        height: '100%',
                        flexShrink: 0
                      }}
                    >
                      <span
                        style={{
                          width: '3px',
                          height: '24px',
                          borderRadius: '2px',
                          backgroundColor: project.indicatorColor
                        }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {project.name}
                      </span>
                    </div>

                    {/* Timeline Grid Cells */}
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        height: '100%',
                        position: 'relative'
                      }}
                      ref={timelineGridRef}
                    >
                      {/* Grid Columns for Drop Targets */}
                      {dates.map((_, colIdx) => (
                        <div
                          key={colIdx}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDropOnCell(project.id, colIdx)}
                          style={{
                            flex: 1,
                            height: '100%',
                            borderRight: colIdx < dates.length - 1 ? '1px solid var(--border-light)' : 'none'
                          }}
                        />
                      ))}

                      {/* Render Draggable Task Boxes */}
                      {project.tasks.map((task) => {
                        const styleObj = getTaskStyles(project.theme);
                        const leftPercent = (task.startCol / dates.length) * 100;
                        const widthPercent = (task.span / dates.length) * 100;

                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, project.id, task)}
                            style={{
                              position: 'absolute',
                              left: `${leftPercent}%`,
                              width: `calc(${widthPercent}% - 6px)`,
                              top: '8px',
                              bottom: '8px',
                              marginLeft: '3px',
                              backgroundColor: styleObj.bg,
                              color: styleObj.text,
                              border: `1px solid ${styleObj.border}`,
                              borderRadius: '6px',
                              padding: '0 12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'grab',
                              userSelect: 'none',
                              zIndex: 10,
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                              transition: 'box-shadow 0.15s ease, transform 0.15s ease',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)';
                              e.currentTarget.style.transform = 'none';
                            }}
                            title="Drag horizontally to move task along timeline"
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.name}</span>
                            <GripHorizontal size={14} style={{ opacity: 0.5, flexShrink: 0, marginLeft: '6px' }} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Span 4: Project Deadlines Sidebar */}
        <div className="col-span-4 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Project deadlines</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Status of completion for all tasks</p>
          </div>

          {/* Donut Gauge Chart */}
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Chart options={deadlinesGaugeOptions} series={deadlinesGaugeSeries} type="donut" height="200" />
          </div>

          {/* 3 Status Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Card 1: Complete before deadline */}
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                borderLeft: '4px solid #10b981',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                Complete before deadline: <span style={{ fontSize: '1rem' }}>3</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                <span
                  style={{
                    backgroundColor: 'var(--color-warning-bg)',
                    color: '#f59e0b',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}
                >
                  0%
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>than previous 3 projects</span>
              </div>
            </div>

            {/* Card 2: Complete on deadline */}
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                borderLeft: '4px solid #3b82f6',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                Complete on deadline: <span style={{ fontSize: '1rem' }}>14</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                <span
                  style={{
                    backgroundColor: 'var(--color-danger-bg)',
                    color: '#ef4444',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}
                >
                  -18%
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>than previous 17 projects</span>
              </div>
            </div>

            {/* Card 3: Complete after deadline */}
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                borderLeft: '4px solid #f97316',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                Complete after deadline: <span style={{ fontSize: '1rem' }}>6</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                <span
                  style={{
                    backgroundColor: 'var(--color-success-bg)',
                    color: '#10b981',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}
                >
                  +20%
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>than previous 5 projects</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
