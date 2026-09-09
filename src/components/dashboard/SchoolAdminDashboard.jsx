import React from 'react';
import Chart from 'react-apexcharts';
import {
  GraduationCap,
  Users,
  UserCheck,
  CalendarCheck,
  DollarSign,
  Receipt,
  Plus,
  ArrowUpRight,
  MoreHorizontal,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  BookOpen,
  Bus,
  Search,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const SchoolAdminDashboard = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Fee Collection vs Expenses Area Chart Options
  const feeChartOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      background: 'transparent'
    },
    colors: ['#2563eb', '#10b981'],
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      labels: {
        style: { colors: isDark ? '#9ca3af' : '#64748b', fontFamily: 'Plus Jakarta Sans' }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: isDark ? '#9ca3af' : '#64748b', fontFamily: 'Plus Jakarta Sans' },
        formatter: (val) => `$${val}k`
      }
    },
    grid: {
      borderColor: isDark ? '#374151' : '#f1f5f9',
      strokeDashArray: 4
    },
    legend: { show: false },
    tooltip: { theme: isDark ? 'dark' : 'light' }
  };

  const feeChartSeries = [
    { name: 'Fees Collected', data: [110, 145, 128, 160, 152, 148.5] },
    { name: 'Operational Expenses', data: [85, 92, 88, 98, 95, 91] }
  ];

  // Grade Attendance Column Chart Options
  const attendanceChartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent'
    },
    plotOptions: {
      bar: {
        columnWidth: '45%',
        borderRadius: 6,
        distributed: true
      }
    },
    colors: ['#2563eb', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#6366f1', '#a855f7', '#f43f5e', '#10b981'],
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Gr 1', 'Gr 2', 'Gr 3', 'Gr 4', 'Gr 5', 'Gr 6', 'Gr 7', 'Gr 8', 'Gr 9', 'Gr 10', 'Gr 11', 'Gr 12'],
      labels: {
        style: { colors: isDark ? '#9ca3af' : '#64748b', fontFamily: 'Plus Jakarta Sans', fontSize: '11px' }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      max: 100,
      labels: {
        style: { colors: isDark ? '#9ca3af' : '#64748b', fontFamily: 'Plus Jakarta Sans' },
        formatter: (val) => `${val}%`
      }
    },
    grid: {
      borderColor: isDark ? '#374151' : '#f1f5f9',
      strokeDashArray: 4
    },
    legend: { show: false },
    tooltip: { theme: isDark ? 'dark' : 'light' }
  };

  const attendanceChartSeries = [
    { name: 'Attendance Rate', data: [98, 96, 97, 95, 96, 94, 95, 93, 97, 98, 95, 96] }
  ];

  // Demographics Donut Chart Options
  const demographicsOptions = {
    chart: { type: 'donut' },
    colors: ['#3b82f6', '#ec4899', '#f59e0b'],
    labels: ['Boys', 'Girls', 'Special Programs'],
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        donut: {
          size: '76%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Students',
              color: isDark ? '#9ca3af' : '#64748b',
              fontSize: '12px',
              formatter: () => '2,840'
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 800,
              color: isDark ? '#f9fafb' : '#1e293b'
            }
          }
        }
      }
    }
  };

  const demographicsSeries = [1480, 1260, 100];

  // Sample Fee Receipts Data
  const recentFeeReceipts = [
    {
      receiptNo: 'REC-2026-0891',
      student: 'Alexander Wright',
      rollNo: '2024-0412',
      grade: 'Grade 10-A',
      amount: '$1,250.00',
      mode: 'Online (Stripe)',
      date: 'Today, 14:32',
      status: 'Paid'
    },
    {
      receiptNo: 'REC-2026-0890',
      student: 'Sophia Martinez',
      rollNo: '2024-0318',
      grade: 'Grade 8-B',
      amount: '$980.00',
      mode: 'Bank Transfer',
      date: 'Today, 11:15',
      status: 'Paid'
    },
    {
      receiptNo: 'REC-2026-0889',
      student: 'Liam Hemsworth',
      rollNo: '2024-0511',
      grade: 'Grade 12-C',
      amount: '$1,400.00',
      mode: 'Cash Receipt',
      date: 'Yesterday',
      status: 'Pending'
    },
    {
      receiptNo: 'REC-2026-0888',
      student: 'Emma Watson',
      rollNo: '2024-0199',
      grade: 'Grade 6-A',
      amount: '$850.00',
      mode: 'Cheque (#40192)',
      date: 'Yesterday',
      status: 'Paid'
    },
    {
      receiptNo: 'REC-2026-0887',
      student: 'Ethan Carter',
      rollNo: '2024-0672',
      grade: 'Grade 11-B',
      amount: '$1,350.00',
      mode: 'Online (UPI)',
      date: '04 Sep 2026',
      status: 'Overdue'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner & Quick Actions */}
      <div
        className="card animate-fade-in"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          background: isDark
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)',
          borderColor: isDark ? '#374151' : '#bfdbfe',
          padding: '24px 28px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              Academic Year 2026–2027
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Term 1 | Sunday, Sep 06, 2026
            </span>
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
            Good morning, Principal Dr. Arthur Vance! 🎓
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Here is your daily school management operational summary, attendance metrics, and fee collection overview.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
            <Plus size={16} /> Add Student
          </button>

          <button className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
            <CalendarCheck size={16} /> Record Attendance
          </button>

          <button className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
            <Receipt size={16} /> Collect Fee
          </button>

          <button className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
            <Bell size={16} /> Post Notice
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics Row */}
      <div className="grid-responsive">
        {/* Metric 1: Total Students */}
        <div className="col-span-3 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--accent-primary-light)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <GraduationCap size={24} />
            </div>
            <span className="badge badge-success">+120 new</span>
          </div>

          <div>
            <span style={{ fontSize: '1.9rem', fontWeight: 800 }}>2,840</span>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Total Enrolled Students</div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
            1,480 Boys | 1,260 Girls | 100 Special Prog.
          </div>
        </div>

        {/* Metric 2: Teachers & Staff */}
        <div className="col-span-3 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-info-bg)',
                color: 'var(--color-info)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <UserCheck size={24} />
            </div>
            <span className="badge badge-info">178 Present</span>
          </div>

          <div>
            <span style={{ fontSize: '1.9rem', fontWeight: 800 }}>185</span>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Teachers & Staff Members</div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
            120 Faculty Teachers | 65 Support Staff
          </div>
        </div>

        {/* Metric 3: Today's Attendance */}
        <div className="col-span-3 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CalendarCheck size={24} />
            </div>
            <span className="badge badge-success">+1.2% vs yesterday</span>
          </div>

          <div>
            <span style={{ fontSize: '1.9rem', fontWeight: 800 }}>96.4%</span>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Today's Student Attendance</div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
            2,738 Present | 102 Absent / Leave
          </div>
        </div>

        {/* Metric 4: Fee Collections */}
        <div className="col-span-3 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-warning-bg)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <DollarSign size={24} />
            </div>
            <span className="badge badge-warning">88.5% Target</span>
          </div>

          <div>
            <span style={{ fontSize: '1.9rem', fontWeight: 800 }}>$148,500</span>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Monthly Fees Collected</div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
            $19,200 Outstanding Overdue
          </div>
        </div>
      </div>

      {/* Middle Row: Financial ApexArea Chart & Grade Attendance Bar Chart */}
      <div className="grid-responsive">
        {/* Fee Collection & Expenses Chart (Span 7) */}
        <div className="col-span-7 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>School Financial Overview</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Monthly fee collection revenue vs operational expenses
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
                  Fees Collected
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  Expenses
                </span>
              </div>
            </div>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            <Chart options={feeChartOptions} series={feeChartSeries} type="area" height="100%" />
          </div>
        </div>

        {/* Grade Attendance Column Chart (Span 5) */}
        <div className="col-span-5 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Attendance by Grade</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Classwise attendance rates (Grades 1 - 12)</p>
            </div>
            <button className="btn-icon">
              <MoreHorizontal size={18} />
            </button>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            <Chart options={attendanceChartOptions} series={attendanceChartSeries} type="bar" height="100%" />
          </div>
        </div>
      </div>

      {/* Third Row: Recent Fee Transactions & Demographics / Notices */}
      <div className="grid-responsive">
        {/* Left Span 8: Recent Fee Transactions Table */}
        <div className="col-span-8 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Recent Fee Transactions</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Live student tuition receipt log</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search receipt, student..."
                  style={{
                    padding: '6px 12px 6px 32px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-app)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
              </div>
              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                View All Receipts
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Receipt No</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Student Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Grade / Class</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Payment Method</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentFeeReceipts.map((rec, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{rec.receiptNo}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{rec.student}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Roll No: {rec.rollNo}</div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>{rec.grade}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{rec.amount}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{rec.mode}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        className={`badge ${
                          rec.status === 'Paid'
                            ? 'badge-success'
                            : rec.status === 'Pending'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Span 4: Student Demographics & School Notice Board */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Demographics Donut Chart */}
          <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Student Demographics</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gender & Program Distribution</p>
              </div>
              <button className="btn-icon">
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Chart options={demographicsOptions} series={demographicsSeries} type="donut" height="180" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                Boys (52%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ec4899' }} />
                Girls (44%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                Special (4%)
              </span>
            </div>
          </div>

          {/* School Notice Board / Circulars */}
          <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>School Notice Board</h3>
              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                + New Notice
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { title: 'Mid-Term Exam Timetable Announced', tag: 'Exams', date: '05 Sep', type: 'warning' },
                { title: 'Annual Sports Day Registrations Open', tag: 'Events', date: '04 Sep', type: 'info' },
                { title: 'Parent-Teacher Meeting (PTM) Scheduled', tag: 'PTM', date: '02 Sep', type: 'success' }
              ].map((n, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-app)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge badge-${n.type}`}>{n.tag}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.date}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
