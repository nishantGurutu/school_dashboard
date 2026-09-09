import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  GraduationCap,
  CalendarCheck,
  Receipt,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  Heart,
  CreditCard,
  Building,
  Printer,
  Edit,
  Award,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const StudentDetailsView = ({ student, onBack, onEdit }) => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'attendance' | 'fees' | 'exams'
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!student) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Card / Hero Profile Banner */}
      <div className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        {/* Cover Background */}
        <div
          style={{
            height: '140px',
            background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 50%, #2563eb 100%)',
            position: 'relative'
          }}
        />

        {/* Profile Details Header */}
        <div style={{ padding: '0 28px 24px 28px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginTop: '-50px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
              <img
                src={student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={student.name}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid var(--bg-card)',
                  boxShadow: 'var(--shadow-md)'
                }}
              />
              <div style={{ marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{student.name}</h2>
                  <span className="badge badge-success">{student.status || 'Active'}</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Roll No: <strong style={{ fontFamily: 'var(--font-mono)' }}>{student.rollNo}</strong> | Admission ID: <strong style={{ fontFamily: 'var(--font-mono)' }}>{student.id}</strong> | {student.class}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '6px' }}>
              <button className="btn btn-secondary" onClick={onBack} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <ArrowLeft size={16} /> Back
              </button>
              <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <Printer size={16} /> Print ID Card
              </button>
              <button className="btn btn-primary" onClick={onEdit} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <Edit size={16} /> Edit Profile
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              borderBottom: '1px solid var(--border-light)',
              marginTop: '24px',
              fontSize: '0.9rem',
              fontWeight: 700
            }}
          >
            {[
              { key: 'profile', label: 'Profile Details', icon: User },
              { key: 'attendance', label: 'Attendance Record', icon: CalendarCheck },
              { key: 'fees', label: 'Fees & Invoices', icon: Receipt },
              { key: 'exams', label: 'Exams & Marks', icon: BookOpen }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 4px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: isActive ? '3px solid #0d9488' : '3px solid transparent',
                    color: isActive ? '#0d9488' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: isActive ? 800 : 600,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <TabIcon size={18} /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab 1: Profile & Personal Details */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="grid-responsive">
            {/* Personal Details */}
            <div className="col-span-6 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                Personal Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Full Name:</span> <strong style={{ display: 'block' }}>{student.name}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Gender:</span> <strong style={{ display: 'block' }}>{student.gender || 'Male'}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Date of Birth:</span> <strong style={{ display: 'block' }}>{student.dob || '12 May 2010'}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Academic Year:</span> <strong style={{ display: 'block' }}>2025–2026</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Phone Number:</span> <strong style={{ display: 'block' }}>{student.phone}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Email Address:</span> <strong style={{ display: 'block' }}>{student.email || 'student@aurora.edu'}</strong></div>
              </div>
            </div>

            {/* Guardian Information */}
            <div className="col-span-6 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                Parent & Guardian Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Father / Guardian Name:</span> <strong style={{ display: 'block' }}>{student.guardian || 'Robert Wright'}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Occupation:</span> <strong style={{ display: 'block' }}>Senior Software Engineer</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Guardian Phone:</span> <strong style={{ display: 'block' }}>{student.phone}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Guardian Email:</span> <strong style={{ display: 'block' }}>r.wright@gmail.com</strong></div>
                <div style={{ gridColumn: 'span 2' }}><span style={{ color: 'var(--text-secondary)' }}>Home Address:</span> <strong style={{ display: 'block' }}>742 Evergreen Terrace, Springfield, OR 97477</strong></div>
              </div>
            </div>
          </div>

          <div className="grid-responsive">
            {/* Medical Details */}
            <div className="col-span-4 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                Medical Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Blood Group:</span> <span className="badge badge-danger">A+</span></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Height:</span> <strong>165 cm</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Weight:</span> <strong>55 kg</strong></div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="col-span-4 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                Bank & National ID
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Bank Name:</span> <strong>National Bank</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Account No:</span> <strong style={{ fontFamily: 'var(--font-mono)' }}>987654321012</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>IFSC Code:</span> <strong style={{ fontFamily: 'var(--font-mono)' }}>NBIN000412</strong></div>
              </div>
            </div>

            {/* Hostel & Transport */}
            <div className="col-span-4 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                Hostel & Facilities
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Hostel Name:</span> <strong>Block A - Senior Boys</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Room Number:</span> <strong>Room 204</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>School Bus Route:</span> <strong>Route 12 (North Campus)</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance Record */}
      {activeTab === 'attendance' && (
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Attendance Performance Summary</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Detailed attendance records for Academic Year 2025-2026</p>
            </div>
            <span className="badge badge-success" style={{ fontSize: '1rem', padding: '6px 16px' }}>
              Overall Attendance: {student.attendance || '98.5%'}
            </span>
          </div>

          <div className="grid-responsive">
            <div className="col-span-4 card" style={{ backgroundColor: 'var(--bg-app)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Working Days</div>
              <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>145 Days</span>
            </div>

            <div className="col-span-4 card" style={{ backgroundColor: 'var(--bg-app)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Days Present</div>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>142 Days</span>
            </div>

            <div className="col-span-4 card" style={{ backgroundColor: 'var(--bg-app)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Days Absent / On Leave</div>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444' }}>3 Days</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Fees & Billing */}
      {activeTab === 'fees' && (
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Tuition Fees & Receipts History</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Payment history and invoice receipts</p>
            </div>
            <span className="badge badge-success" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
              Fees Cleared
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Receipt No</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Term / Item</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Amount Paid</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Payment Method</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>REC-2026-0891</td>
                <td style={{ padding: '14px 16px', fontWeight: 600 }}>Term 1 Tuition Fee</td>
                <td style={{ padding: '14px 16px', fontWeight: 700 }}>$1,250.00</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>Online (Stripe)</td>
                <td style={{ padding: '14px 16px' }}><span className="badge badge-success">Paid</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Exams & Marks */}
      {activeTab === 'exams' && (
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Term 1 Examination Report Card</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Class Rank: <strong>1st Place</strong> | Total Marks: <strong>488 / 500 (97.6%)</strong></p>
            </div>
            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Printer size={16} /> Download Report Card
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Subject Code</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Subject Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Max Marks</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Marks Obtained</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {[
                { code: 'MATH-101', name: 'Mathematics & Calculus', max: 100, obt: 98, grade: 'A+' },
                { code: 'PHYS-102', name: 'Physics & Lab', max: 100, obt: 96, grade: 'A+' },
                { code: 'CS-103', name: 'Computer Science', max: 100, obt: 99, grade: 'A+' },
                { code: 'ENG-104', name: 'English Literature', max: 100, obt: 95, grade: 'A+' }
              ].map((sub) => (
                <tr key={sub.code} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)' }}>{sub.code}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700 }}>{sub.name}</td>
                  <td style={{ padding: '14px 16px' }}>{sub.max}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--accent-primary)' }}>{sub.obt}</td>
                  <td style={{ padding: '14px 16px' }}><span className="badge badge-success">{sub.grade}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
