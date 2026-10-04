import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  Upload,
  Calendar,
  Eye,
  EyeOff,
  ArrowLeft,
  Save,
  UserCheck,
  ShieldCheck,
  Users
} from 'lucide-react';
import { Spinner } from '../ui/Spinner';
import { classService } from '../../services/classService';

export const TeacherForm = ({ onBack, onSaveTeacher, initialData = null, isEditMode = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  // Dynamic Subjects and Classes loaded from backend APIs
  const [subjectsList, setSubjectsList] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingDropdowns(true);

    Promise.all([
      classService.subjects.list().catch((err) => {
        console.warn('Failed to load subjects from API:', err);
        return [];
      }),
      classService.classes.list().catch((err) => {
        console.warn('Failed to load classes from API:', err);
        return [];
      })
    ])
      .then(([subRes, clsRes]) => {
        if (!isMounted) return;
        const subs = Array.isArray(subRes) ? subRes : (subRes?.data || []);
        const cls = Array.isArray(clsRes) ? clsRes : (clsRes?.data || []);
        setSubjectsList(subs);
        setClassesList(cls);
      })
      .catch((err) => {
        console.warn('Failed to load dropdown data from API:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingDropdowns(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const availableSubjects = useMemo(() => {
    const list = [];
    const seen = new Set();
    subjectsList.forEach((sub) => {
      const name = sub?.name?.trim();
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push({ id: sub.id, name, code: sub.code });
      }
    });
    return list;
  }, [subjectsList]);

  const availableClasses = useMemo(() => {
    const list = [];
    const seen = new Set();
    classesList.forEach((c) => {
      const className = c?.name?.trim() || '';
      const section = c?.section?.trim() || '';
      const label = section ? `${className} (${section})` : className;
      if (label && !seen.has(label.toLowerCase())) {
        seen.add(label.toLowerCase());
        list.push({ id: c.id, name: className, section, label });
      }
    });
    return list;
  }, [classesList]);

  const resolveInitialType = (data) => {
    if (!data) return 'Teacher';
    const rawType = (data.type || data.memberType || data.role || data.designation || '').toString().toLowerCase();
    if (rawType.includes('princip')) return 'Principal';
    if (rawType.includes('staff')) return 'Staff';
    return 'Teacher';
  };

  // Form State containing all fields (teacherId preserved in state for backend payload, removed from form inputs)
  const [formData, setFormData] = useState({
    // Account Type / Role
    type: resolveInitialType(initialData),
    department: initialData?.department || '',
    designation: initialData?.designation || '',

    // Personal Info
    teacherId: initialData?.employeeId || initialData?.id || '',
    fullName: initialData?.name || initialData?.fullName || '',
    subject: initialData?.subject && initialData?.subject !== 'All Subjects' ? initialData.subject : '',
    assignedClass: initialData?.assignedClass || initialData?.className || '',
    gender: initialData?.gender || 'Male',
    dob: initialData?.dob || '',
    fatherName: initialData?.fatherName || '',
    motherName: initialData?.motherName || '',
    maritalStatus: initialData?.maritalStatus || 'Married',
    contractType: initialData?.contractType || 'Contractual',
    shift: initialData?.shift || 'Day Shift',
    workLocation: initialData?.workLocation || '',
    joinDate: initialData?.joiningDate || initialData?.joinDate || '',
    phone: initialData?.phone && initialData.phone !== 'N/A' ? String(initialData.phone).replace(/\D/g, '').slice(0, 15) : '',
    email: initialData?.email && initialData.email !== 'N/A' ? initialData.email : '',
    experience: initialData?.experience || (initialData?.experienceYears ? `${initialData.experienceYears} Years` : ''),
    qualification: initialData?.qualification || '',
    teacherPhoto: null,

    // Medical Details
    bloodGroup: initialData?.bloodGroup || 'A+',
    height: initialData?.height || '',
    weight: initialData?.weight || '',

    // Bank Details
    bankAccountNumber: initialData?.bankAccountNumber ? String(initialData.bankAccountNumber).replace(/\D/g, '').slice(0, 25) : '',
    bankName: initialData?.bankName || '',
    ifscCode: initialData?.ifscCode || '',
    nationalIdNumber: initialData?.nationalIdNumber || '',

    // Upload Documents
    docName: '',
    uploadFile: null,

    // Previous School Details
    prevSchoolName: '',
    prevSchoolAddress: '',

    // Address
    currentAddress: initialData?.address || '',
    permanentAddress: '',

    // Teacher Details
    teacherBio: '',

    // Social Links
    facebookLink: '',
    linkedInLink: '',
    instagramLink: '',
    youTubeLink: '',

    // Login Details
    loginEmail: initialData?.email && initialData.email !== 'N/A' ? initialData.email : '',
    loginPassword: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        type: resolveInitialType(initialData),
        department: initialData.department || prev.department,
        designation: initialData.designation || prev.designation,
        teacherId: initialData.employeeId || initialData.id || prev.teacherId,
        fullName: initialData.name || initialData.fullName || prev.fullName,
        subject: initialData.subject && initialData.subject !== 'All Subjects' ? initialData.subject : prev.subject,
        assignedClass: initialData.assignedClass || initialData.className || prev.assignedClass,
        phone: initialData.phone && initialData.phone !== 'N/A' ? String(initialData.phone).replace(/\D/g, '').slice(0, 15) : prev.phone,
        email: initialData.email && initialData.email !== 'N/A' ? initialData.email : prev.email,
        qualification: initialData.qualification || prev.qualification,
        bankAccountNumber: initialData.bankAccountNumber ? String(initialData.bankAccountNumber).replace(/\D/g, '').slice(0, 25) : prev.bankAccountNumber,
        loginEmail: initialData.email && initialData.email !== 'N/A' ? initialData.email : prev.loginEmail
      }));
    }
  }, [initialData]);

  const handleTypeChange = (newType) => {
    setFormData((prev) => {
      const updated = { ...prev, type: newType };
      if (newType === 'Principal') {
        if (!prev.designation || prev.designation === 'Teacher' || prev.designation === 'Staff' || prev.designation === 'Administrative Staff') {
          updated.designation = 'Principal';
        }
        if (!prev.department || prev.department === 'Academic' || prev.department === 'General Faculty' || prev.department === 'Mathematics') {
          updated.department = 'Administration';
        }
        if (!prev.subject) {
          updated.subject = 'Administration';
        }
      } else if (newType === 'Staff') {
        if (!prev.designation || prev.designation === 'Teacher' || prev.designation === 'Principal') {
          updated.designation = 'Administrative Staff';
        }
        if (!prev.department || prev.department === 'Academic' || prev.department === 'General Faculty' || prev.department === 'Mathematics') {
          updated.department = 'Administration';
        }
        if (!prev.subject) {
          updated.subject = 'General';
        }
      } else {
        if (prev.designation === 'Principal' || prev.designation === 'Administrative Staff' || prev.designation === 'Staff') {
          updated.designation = 'Teacher';
        }
        if (prev.department === 'Administration') {
          updated.department = 'Academic';
        }
        if (prev.subject === 'Administration' || prev.subject === 'General') {
          updated.subject = '';
        }
      }
      return updated;
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'email' && (!prev.loginEmail || prev.loginEmail === prev.email)) {
        updated.loginEmail = value;
      }
      return updated;
    });
  };

  const handleNumericKeyDown = (e) => {
    if (
      !/[0-9]/.test(e.key) &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      e.preventDefault();
    }
  };

  const handlePhoneChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 15);
    handleChange('phone', numericValue);
  };

  const handleBankAccountChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 25);
    handleChange('bankAccountNumber', numericValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSaveTeacher || savingRef.current) {
      return;
    }
    savingRef.current = true;
    setIsSaving(true);
    try {
      await onSaveTeacher(formData);
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (initialData) {
      setFormData({
        type: resolveInitialType(initialData),
        department: initialData?.department || '',
        designation: initialData?.designation || '',
        teacherId: initialData.employeeId || initialData.id || '',
        fullName: initialData.name || initialData.fullName || '',
        subject: initialData.subject && initialData.subject !== 'All Subjects' ? initialData.subject : '',
        assignedClass: initialData.assignedClass || initialData.className || '',
        gender: initialData.gender || 'Male',
        dob: initialData.dob || '',
        fatherName: initialData.fatherName || '',
        motherName: initialData.motherName || '',
        maritalStatus: initialData.maritalStatus || 'Married',
        contractType: initialData.contractType || 'Contractual',
        shift: initialData.shift || 'Day Shift',
        workLocation: initialData.workLocation || '',
        joinDate: initialData.joiningDate || initialData.joinDate || '',
        phone: initialData.phone && initialData.phone !== 'N/A' ? String(initialData.phone).replace(/\D/g, '').slice(0, 15) : '',
        email: initialData.email && initialData.email !== 'N/A' ? initialData.email : '',
        experience: initialData.experience || (initialData?.experienceYears ? `${initialData.experienceYears} Years` : ''),
        qualification: initialData.qualification || '',
        teacherPhoto: null,
        bloodGroup: initialData.bloodGroup || 'A+',
        height: initialData.height || '',
        weight: initialData.weight || '',
        bankAccountNumber: initialData.bankAccountNumber ? String(initialData.bankAccountNumber).replace(/\D/g, '').slice(0, 25) : '',
        bankName: initialData.bankName || '',
        ifscCode: initialData.ifscCode || '',
        nationalIdNumber: initialData.nationalIdNumber || '',
        docName: '',
        uploadFile: null,
        prevSchoolName: '',
        prevSchoolAddress: '',
        currentAddress: initialData.address || '',
        permanentAddress: '',
        teacherBio: '',
        facebookLink: '',
        linkedInLink: '',
        instagramLink: '',
        youTubeLink: '',
        loginEmail: initialData.email && initialData.email !== 'N/A' ? initialData.email : '',
        loginPassword: ''
      });
    } else {
      setFormData({
        type: 'Teacher',
        department: '',
        designation: '',
        teacherId: '',
        fullName: '',
        subject: '',
        assignedClass: '',
        gender: 'Male',
        dob: '',
        fatherName: '',
        motherName: '',
        maritalStatus: 'Married',
        contractType: 'Contractual',
        shift: 'Day Shift',
        workLocation: '',
        joinDate: '',
        phone: '',
        email: '',
        experience: '',
        qualification: '',
        teacherPhoto: null,
        bloodGroup: 'A+',
        height: '',
        weight: '',
        bankAccountNumber: '',
        bankName: '',
        ifscCode: '',
        nationalIdNumber: '',
        docName: '',
        uploadFile: null,
        prevSchoolName: '',
        prevSchoolAddress: '',
        currentAddress: '',
        permanentAddress: '',
        teacherBio: '',
        facebookLink: '',
        linkedInLink: '',
        instagramLink: '',
        youTubeLink: '',
        loginEmail: '',
        loginPassword: ''
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Breadcrumb */}
      <div
        className="card animate-fade-in"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Dashboard / Faculty & Staff / <strong style={{ color: 'var(--text-primary)' }}>{isEditMode ? `Edit ${formData.type}` : `Add New ${formData.type}`}</strong>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {isEditMode ? `Edit ${formData.type} Profile (${initialData?.name || formData.fullName || formData.type})` : `Add New ${formData.type}`}
          </h2>
        </div>

        <button className="btn btn-secondary" onClick={onBack} style={{ padding: '8px 16px' }}>
          <ArrowLeft size={16} /> Back to Faculty Directory
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Account Type / Role Selection (Teacher, Principal, Staff) */}
        <div
          className="card animate-fade-in"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            border: '2px solid var(--border-color)',
            borderRadius: '12px',
            padding: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                Account Type (Role) <span style={{ color: '#ef4444' }}>*</span>
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Admin selects type: <strong>1. Teacher</strong> (faculty), <strong>2. Principal</strong> (school head), or <strong>3. Staff</strong> (administrative).
              </p>
            </div>

            <div style={{ minWidth: '190px' }}>
              <select
                id="member-type-select"
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                style={{
                  ...inputStyle,
                  fontWeight: 700,
                  borderColor: formData.type === 'Principal' ? '#8b5cf6' : formData.type === 'Staff' ? '#10b981' : '#3b82f6',
                  color: formData.type === 'Principal' ? '#7c3aed' : formData.type === 'Staff' ? '#059669' : '#2563eb'
                }}
              >
                <option value="Teacher">1. Teacher</option>
                <option value="Principal">2. Principal</option>
                <option value="Staff">3. Staff</option>
              </select>
            </div>
          </div>

          {/* 3 Interactive Cards for Visual Selection */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '12px'
            }}
          >
            {/* 1. Teacher */}
            <div
              id="type-card-teacher"
              onClick={() => handleTypeChange('Teacher')}
              style={{
                cursor: 'pointer',
                padding: '14px 16px',
                borderRadius: '10px',
                border: formData.type === 'Teacher' ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                backgroundColor: formData.type === 'Teacher' ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-app)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: formData.type === 'Teacher' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                  color: formData.type === 'Teacher' ? '#ffffff' : '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <UserCheck size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '0.95rem', color: formData.type === 'Teacher' ? '#1d4ed8' : 'var(--text-primary)' }}>
                    1. Teacher
                  </strong>
                  {formData.type === 'Teacher' && (
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#3b82f6', color: '#fff', fontWeight: 700 }}>
                      Selected
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Teaching faculty & subject assignments
                </div>
              </div>
            </div>

            {/* 2. Principal */}
            <div
              id="type-card-principal"
              onClick={() => handleTypeChange('Principal')}
              style={{
                cursor: 'pointer',
                padding: '14px 16px',
                borderRadius: '10px',
                border: formData.type === 'Principal' ? '2px solid #8b5cf6' : '1px solid var(--border-color)',
                backgroundColor: formData.type === 'Principal' ? 'rgba(139, 92, 246, 0.08)' : 'var(--bg-app)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: formData.type === 'Principal' ? '#8b5cf6' : 'rgba(139, 92, 246, 0.1)',
                  color: formData.type === 'Principal' ? '#ffffff' : '#8b5cf6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '0.95rem', color: formData.type === 'Principal' ? '#6d28d9' : 'var(--text-primary)' }}>
                    2. Principal
                  </strong>
                  {formData.type === 'Principal' && (
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#8b5cf6', color: '#fff', fontWeight: 700 }}>
                      Selected
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  School head & executive administration
                </div>
              </div>
            </div>

            {/* 3. Staff */}
            <div
              id="type-card-staff"
              onClick={() => handleTypeChange('Staff')}
              style={{
                cursor: 'pointer',
                padding: '14px 16px',
                borderRadius: '10px',
                border: formData.type === 'Staff' ? '2px solid #10b981' : '1px solid var(--border-color)',
                backgroundColor: formData.type === 'Staff' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-app)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: formData.type === 'Staff' ? '#10b981' : 'rgba(16, 185, 129, 0.1)',
                  color: formData.type === 'Staff' ? '#ffffff' : '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Users size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '0.95rem', color: formData.type === 'Staff' ? '#047857' : 'var(--text-primary)' }}>
                    3. Staff
                  </strong>
                  {formData.type === 'Staff' && (
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#10b981', color: '#fff', fontWeight: 700 }}>
                      Selected
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Administrative & operations personnel
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Personal Info */}
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            Personal Info ({formData.type})
          </h3>

          <div className="grid-responsive">
            {/* Row 1: Full Name, Designation, Department */}
            <div className="col-span-4">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Full Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Full Name"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div className="col-span-4">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Designation / Position
              </label>
              <input
                type="text"
                placeholder={formData.type === 'Principal' ? 'Principal' : (formData.type === 'Staff' ? 'Administrative Staff' : 'Teacher')}
                value={formData.designation}
                onChange={(e) => handleChange('designation', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-4">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Department
              </label>
              <input
                type="text"
                placeholder={formData.type === 'Teacher' ? 'Academic / Science / Arts' : 'Administration'}
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Row 2: Subject & Class */}
            <div className="col-span-6">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                {formData.type === 'Teacher' ? 'Subject Specialization' : 'Primary Domain / Subject'}
              </label>
              <select
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                style={inputStyle}
              >
                <option value="">{isLoadingDropdowns ? 'Loading subjects...' : 'Select Subject (Optional)'}</option>
                {formData.type !== 'Teacher' && <option value="Administration">Administration</option>}
                {formData.type !== 'Teacher' && <option value="General">General</option>}
                {availableSubjects.map((sub) => (
                  <option key={sub.id || sub.name} value={sub.name}>
                    {sub.name} {sub.code ? `(${sub.code})` : ''}
                  </option>
                ))}
                {formData.subject && !availableSubjects.some((s) => s.name === formData.subject) && (
                  <option value={formData.subject}>{formData.subject}</option>
                )}
              </select>
            </div>

            <div className="col-span-6">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                {formData.type === 'Teacher' ? 'Assigned Class' : 'Assigned Class / Division (Optional)'}
              </label>
              <select
                value={formData.assignedClass}
                onChange={(e) => handleChange('assignedClass', e.target.value)}
                style={inputStyle}
              >
                <option value="">{isLoadingDropdowns ? 'Loading classes...' : 'Select Class (Optional)'}</option>
                {availableClasses.map((cls) => (
                  <option key={cls.id || cls.label} value={cls.label}>
                    {cls.label}
                  </option>
                ))}
                {formData.assignedClass && !availableClasses.some((c) => c.label === formData.assignedClass) && (
                  <option value={formData.assignedClass}>{formData.assignedClass}</option>
                )}
              </select>
            </div>

            {/* Row 2 */}
            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                style={inputStyle}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Date Of Birth <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Fathers Name
              </label>
              <input
                type="text"
                placeholder="Enter Fathers Name"
                value={formData.fatherName}
                onChange={(e) => handleChange('fatherName', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Mothers Name
              </label>
              <input
                type="text"
                placeholder="Enter mothers Name"
                value={formData.motherName}
                onChange={(e) => handleChange('motherName', e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Row 3 */}
            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Merital Status
              </label>
              <select
                value={formData.maritalStatus}
                onChange={(e) => handleChange('maritalStatus', e.target.value)}
                style={inputStyle}
              >
                <option>Married</option>
                <option>Single</option>
                <option>Divorced</option>
              </select>
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Contract Type
              </label>
              <select
                value={formData.contractType}
                onChange={(e) => handleChange('contractType', e.target.value)}
                style={inputStyle}
              >
                <option>Contractual</option>
                <option>Permanent</option>
                <option>Part Time</option>
              </select>
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Shift
              </label>
              <select
                value={formData.shift}
                onChange={(e) => handleChange('shift', e.target.value)}
                style={inputStyle}
              >
                <option>Day Shift</option>
                <option>Morning Shift</option>
                <option>Evening Shift</option>
              </select>
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Work Location
              </label>
              <input
                type="text"
                placeholder="Enter work location"
                value={formData.workLocation}
                onChange={(e) => handleChange('workLocation', e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Row 4 */}
            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Join Date
              </label>
              <input
                type="date"
                value={formData.joinDate}
                onChange={(e) => handleChange('joinDate', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Phone Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter your Phone Number"
                value={formData.phone}
                onChange={handlePhoneChange}
                onKeyDown={handleNumericKeyDown}
                style={inputStyle}
                required
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Email <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                placeholder="Enter your Email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Experience <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Enter experience"
                value={formData.experience}
                onChange={(e) => handleChange('experience', e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Row 5 */}
            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Experience <span style={{ color: '#ef4444' }}>*</span> (Qualification)
              </label>
              <input
                type="text"
                placeholder="Enter Qualification"
                value={formData.qualification}
                onChange={(e) => handleChange('qualification', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-6">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                {formData.type} Photo <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <DropzoneArea placeholder="Drag & drop a file here or click" />
            </div>
          </div>
        </div>

        {/* Section 2: Medical Details */}
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            Medical Details
          </h3>

          <div className="grid-responsive">
            <div className="col-span-4">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => handleChange('bloodGroup', e.target.value)}
                style={inputStyle}
              >
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>O+</option>
                <option>O-</option>
                <option>AB+</option>
                <option>AB-</option>
              </select>
            </div>

            <div className="col-span-4">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Height
              </label>
              <input
                type="text"
                placeholder="Enter height"
                value={formData.height}
                onChange={(e) => handleChange('height', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-4">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Weight
              </label>
              <input
                type="text"
                placeholder="Enter Weight"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Bank Details */}
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            Bank Details
          </h3>

          <div className="grid-responsive">
            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Bank Account Number
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter bank account number"
                value={formData.bankAccountNumber}
                onChange={handleBankAccountChange}
                onKeyDown={handleNumericKeyDown}
                style={inputStyle}
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Bank Name
              </label>
              <input
                type="text"
                placeholder="Enter bank name"
                value={formData.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                IFSC Code
              </label>
              <input
                type="text"
                placeholder="Enter IFSC Code"
                value={formData.ifscCode}
                onChange={(e) => handleChange('ifscCode', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                National Identification Number
              </label>
              <input
                type="text"
                placeholder="Enter national identification number"
                value={formData.nationalIdNumber}
                onChange={(e) => handleChange('nationalIdNumber', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Upload Documents */}
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            Upload Documents
          </h3>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Doc Name
              </label>
              <input
                type="text"
                placeholder="Enter Doc Name"
                value={formData.docName}
                onChange={(e) => handleChange('docName', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Upload File
              </label>
              <DropzoneArea placeholder="Drag & drop a file here or click" />
            </div>
          </div>
        </div>

        {/* Section 5: Previous School Details & Address */}
        <div className="grid-responsive">
          <div className="col-span-6 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              Previous School Details
            </h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  School Name
                </label>
                <input
                  type="text"
                  placeholder="Enter School Name"
                  value={formData.prevSchoolName}
                  onChange={(e) => handleChange('prevSchoolName', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Enter Address"
                  value={formData.prevSchoolAddress}
                  onChange={(e) => handleChange('prevSchoolAddress', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div className="col-span-6 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              Address
            </h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Current Address
                </label>
                <input
                  type="text"
                  placeholder="Enter Current Address"
                  value={formData.currentAddress}
                  onChange={(e) => handleChange('currentAddress', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Permanent Address
                </label>
                <input
                  type="text"
                  placeholder="Enter Permanent Address"
                  value={formData.permanentAddress}
                  onChange={(e) => handleChange('permanentAddress', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Teacher Details */}
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            Teacher Details
          </h3>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              Teacher Details
            </label>
            <textarea
              placeholder="Enter details"
              rows={3}
              value={formData.teacherBio}
              onChange={(e) => handleChange('teacherBio', e.target.value)}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: '80px'
              }}
            />
          </div>
        </div>

        {/* Section 7: Social Links */}
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            Teacher Details (Social Handles)
          </h3>
          <div className="grid-responsive">
            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Facebook
              </label>
              <input
                type="text"
                placeholder="Enter your facebook link"
                value={formData.facebookLink}
                onChange={(e) => handleChange('facebookLink', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                LinkedIn
              </label>
              <input
                type="text"
                placeholder="Enter your LinkedIn link"
                value={formData.linkedInLink}
                onChange={(e) => handleChange('linkedInLink', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Instagram
              </label>
              <input
                type="text"
                placeholder="Enter your Instagram link"
                value={formData.instagramLink}
                onChange={(e) => handleChange('instagramLink', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                YouTube
              </label>
              <input
                type="text"
                placeholder="Enter your YouTube link"
                value={formData.youTubeLink}
                onChange={(e) => handleChange('youTubeLink', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Section 8: Login Details */}
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            Login Details
          </h3>
          <div className="grid-responsive">
            <div className="col-span-6">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Email <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                placeholder="Enter Email"
                value={formData.loginEmail}
                onChange={(e) => handleChange('loginEmail', e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div className="col-span-6">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.loginPassword}
                  onChange={(e) => handleChange('loginPassword', e.target.value)}
                  style={{ ...inputStyle, paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '12px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary"
            style={{
              padding: '12px 36px',
              color: '#ef4444',
              borderColor: '#ef4444',
              fontWeight: 700,
              fontSize: '0.95rem'
            }}
          >
            Reset
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSaving}
            style={{
              padding: '12px 40px',
              backgroundColor: '#0d9488',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.95rem',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isSaving ? (<><Spinner size={16} color="#ffffff" /> Saving...</>) : (isEditMode ? `Update ${formData.type} Details` : `Create ${formData.type}`)}
          </button>
        </div>
      </form>
    </div>
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
  fontFamily: 'var(--font-sans)',
  transition: 'border-color 0.2s ease'
};

// Dropzone File Component matching reference images
const DropzoneArea = ({ placeholder }) => {
  return (
    <div
      style={{
        border: '2px dashed var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '12px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        minHeight: '42px',
        transition: 'all 0.2s ease'
      }}
    >
      <Upload size={14} />
      <span>{placeholder}</span>
    </div>
  );
};
