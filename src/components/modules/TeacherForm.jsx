import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  Upload,
  Calendar,
  Eye,
  EyeOff,
  ArrowLeft,
  Save
} from 'lucide-react';
import { Spinner } from '../ui/Spinner';
import { MultiSelectDropdown } from '../ui/MultiSelectDropdown';
import { classService } from '../../services/classService';

export const TeacherForm = ({ onBack, onSaveTeacher, initialData = null, isEditMode = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  // Dynamic Subjects, Classes, Departments, and Designations loaded from backend APIs
  const [subjectsList, setSubjectsList] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [designationsList, setDesignationsList] = useState([]);
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
      }),
      classService.departments.list().catch((err) => {
        console.warn('Failed to load departments from API:', err);
        return [];
      }),
      classService.designations.list().catch((err) => {
        console.warn('Failed to load designations from API:', err);
        return [];
      })
    ])
      .then(([subRes, clsRes, deptRes, desigRes]) => {
        if (!isMounted) return;
        const subs = Array.isArray(subRes) ? subRes : (subRes?.data || []);
        const cls = Array.isArray(clsRes) ? clsRes : (clsRes?.data || []);
        const depts = Array.isArray(deptRes) ? deptRes : (deptRes?.data || []);
        const desigs = Array.isArray(desigRes) ? desigRes : (desigRes?.data || []);
        setSubjectsList(subs);
        setClassesList(cls);
        setDepartmentsList(depts);
        setDesignationsList(desigs);
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

  // Form State containing all fields
  const [formData, setFormData] = useState({
    type: 'Teacher',
    department: initialData?.department || '',
    departmentId: initialData?.departmentId || '',
    designation: initialData?.designation || '',
    designationId: initialData?.designationId || '',

    // Personal Info
    teacherId: initialData?.employeeId || initialData?.id || '',
    fullName: initialData?.name || initialData?.fullName || '',
    subject: initialData?.subject && initialData?.subject !== 'All Subjects' ? initialData.subject : '',
    subjectIds: initialData?.subjectIds || [],
    assignedClass: initialData?.assignedClass || initialData?.className || '',
    assignedClassIds: initialData?.assignedClassIds || initialData?.classIds || [],
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
    docName: initialData?.docName || '',
    uploadFile: null,

    // Previous School Details
    prevSchoolName: initialData?.prevSchoolName || '',
    prevSchoolAddress: initialData?.prevSchoolAddress || '',

    // Address
    currentAddress: initialData?.currentAddress || initialData?.address || '',
    permanentAddress: initialData?.permanentAddress || '',

    // Teacher Details
    teacherBio: initialData?.teacherBio || '',

    // Login Details
    loginEmail: initialData?.email && initialData.email !== 'N/A' ? initialData.email : '',
    loginPassword: ''
  });

  useEffect(() => {
    if (initialData) {
      let resolvedSubjectIds = Array.isArray(initialData.subjectIds) ? initialData.subjectIds : [];
      if (!resolvedSubjectIds.length && Array.isArray(initialData.subjects)) {
        resolvedSubjectIds = initialData.subjects.map((s) => s?.id).filter(Boolean);
      }
      if (!resolvedSubjectIds.length && initialData.subject && availableSubjects.length > 0) {
        const subParts = initialData.subject.split(',').map((s) => s.trim().toLowerCase());
        resolvedSubjectIds = availableSubjects
          .filter((s) => subParts.includes((s.name || '').toLowerCase()))
          .map((s) => s.id);
      }

      let resolvedClassIds = Array.isArray(initialData.assignedClassIds)
        ? initialData.assignedClassIds
        : (Array.isArray(initialData.classIds) ? initialData.classIds : []);
      if (!resolvedClassIds.length && Array.isArray(initialData.assignedClasses)) {
        resolvedClassIds = initialData.assignedClasses.map((c) => c?.id).filter(Boolean);
      }
      if (!resolvedClassIds.length && (initialData.assignedClass || initialData.className) && availableClasses.length > 0) {
        const clsRaw = (initialData.assignedClass || initialData.className).toLowerCase();
        resolvedClassIds = availableClasses
          .filter((c) => clsRaw.includes((c.label || c.name || '').toLowerCase()))
          .map((c) => c.id);
      }

      setFormData((prev) => ({
        ...prev,
        type: initialData.type || prev.type || 'Teacher',
        department: initialData.department || prev.department,
        departmentId: initialData.departmentId || prev.departmentId,
        designation: initialData.designation || prev.designation,
        designationId: initialData.designationId || prev.designationId,
        teacherId: initialData.employeeId || initialData.id || prev.teacherId,
        fullName: initialData.name || initialData.fullName || prev.fullName,
        subject: initialData.subject && initialData.subject !== 'All Subjects' ? initialData.subject : prev.subject,
        subjectIds: resolvedSubjectIds.length ? resolvedSubjectIds : (prev.subjectIds || []),
        assignedClass: initialData.assignedClass || initialData.className || prev.assignedClass,
        assignedClassIds: resolvedClassIds.length ? resolvedClassIds : (prev.assignedClassIds || []),
        gender: initialData.gender || prev.gender,
        dob: initialData.dob || prev.dob,
        fatherName: initialData.fatherName || prev.fatherName,
        motherName: initialData.motherName || prev.motherName,
        maritalStatus: initialData.maritalStatus || prev.maritalStatus,
        contractType: initialData.contractType || prev.contractType,
        shift: initialData.shift || prev.shift,
        workLocation: initialData.workLocation || prev.workLocation,
        joinDate: initialData.joiningDate || initialData.joinDate || prev.joinDate,
        phone: initialData.phone && initialData.phone !== 'N/A' ? String(initialData.phone).replace(/\D/g, '').slice(0, 15) : prev.phone,
        email: initialData.email && initialData.email !== 'N/A' ? initialData.email : prev.email,
        experience: initialData.experience || (initialData?.experienceYears ? `${initialData.experienceYears} Years` : prev.experience),
        qualification: initialData.qualification || prev.qualification,
        bloodGroup: initialData.bloodGroup || prev.bloodGroup,
        height: initialData.height || prev.height,
        weight: initialData.weight || prev.weight,
        bankAccountNumber: initialData.bankAccountNumber ? String(initialData.bankAccountNumber).replace(/\D/g, '').slice(0, 25) : prev.bankAccountNumber,
        bankName: initialData.bankName || prev.bankName,
        ifscCode: initialData.ifscCode || prev.ifscCode,
        nationalIdNumber: initialData.nationalIdNumber || prev.nationalIdNumber,
        docName: initialData.docName || prev.docName,
        prevSchoolName: initialData.prevSchoolName || prev.prevSchoolName,
        prevSchoolAddress: initialData.prevSchoolAddress || prev.prevSchoolAddress,
        currentAddress: initialData.currentAddress || initialData.address || prev.currentAddress,
        permanentAddress: initialData.permanentAddress || prev.permanentAddress,
        teacherBio: initialData.teacherBio || prev.teacherBio,
        loginEmail: initialData.email && initialData.email !== 'N/A' ? initialData.email : prev.loginEmail
      }));
    }
  }, [initialData, availableSubjects, availableClasses]);

  // Sync departmentId if only department name was set
  useEffect(() => {
    if (departmentsList.length > 0 && formData.department && !formData.departmentId) {
      const matched = departmentsList.find((d) => (d.name || '').toLowerCase() === formData.department.toLowerCase());
      if (matched) {
        setFormData((prev) => ({ ...prev, departmentId: matched.id }));
      }
    }
  }, [departmentsList, formData.department, formData.departmentId]);

  // Sync designationId if only designation name was set
  useEffect(() => {
    if (designationsList.length > 0 && formData.designation && !formData.designationId) {
      const matched = designationsList.find((d) => (d.name || '').toLowerCase() === formData.designation.toLowerCase());
      if (matched) {
        setFormData((prev) => ({ ...prev, designationId: matched.id }));
      }
    }
  }, [designationsList, formData.designation, formData.designationId]);

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
      await onSaveTeacher({
        ...formData,
        joiningDate: formData.joinDate || formData.joiningDate || new Date().toISOString().split('T')[0],
        departmentId: formData.departmentId ? Number(formData.departmentId) : null,
        designationId: formData.designationId ? Number(formData.designationId) : null,
        subjectIds: formData.subjectIds || [],
        assignedClassIds: formData.assignedClassIds || [],
        classIds: formData.assignedClassIds || []
      });
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (initialData) {
      setFormData({
        type: 'Teacher',
        department: initialData?.department || '',
        departmentId: initialData?.departmentId || '',
        designation: initialData?.designation || '',
        designationId: initialData?.designationId || '',
        teacherId: initialData.employeeId || initialData.id || '',
        fullName: initialData.name || initialData.fullName || '',
        subject: initialData.subject && initialData.subject !== 'All Subjects' ? initialData.subject : '',
        subjectIds: initialData.subjectIds || [],
        assignedClass: initialData.assignedClass || initialData.className || '',
        assignedClassIds: initialData.assignedClassIds || initialData.classIds || [],
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
        docName: initialData.docName || '',
        uploadFile: null,
        prevSchoolName: initialData.prevSchoolName || '',
        prevSchoolAddress: initialData.prevSchoolAddress || '',
        currentAddress: initialData.currentAddress || initialData.address || '',
        permanentAddress: initialData.permanentAddress || '',
        teacherBio: initialData.teacherBio || '',
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
        departmentId: '',
        designation: '',
        designationId: '',
        teacherId: '',
        fullName: '',
        subject: '',
        subjectIds: [],
        assignedClass: '',
        assignedClassIds: [],
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
            Dashboard / Faculty & Teachers / <strong style={{ color: 'var(--text-primary)' }}>{isEditMode ? 'Edit Teacher' : 'Add New Teacher'}</strong>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {isEditMode ? `Edit Teacher Profile (${initialData?.name || formData.fullName || 'Teacher'})` : 'Add New Teacher'}
          </h2>
        </div>

        <button className="btn btn-secondary" onClick={onBack} style={{ padding: '8px 16px' }}>
          <ArrowLeft size={16} /> Back to Faculty Directory
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Section 1: Personal Info */}
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            Personal Info
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
                Designation <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                id="teacher-designation-select"
                value={formData.designationId || ''}
                onChange={(e) => {
                  const selId = e.target.value;
                  const sel = designationsList.find((d) => String(d.id) === String(selId));
                  setFormData((prev) => ({
                    ...prev,
                    designationId: selId ? Number(selId) : '',
                    designation: sel ? sel.name : ''
                  }));
                }}
                style={inputStyle}
                required
              >
                <option value="">{isLoadingDropdowns ? 'Loading designations...' : '-- Select Designation --'}</option>
                {designationsList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.category ? `• ${d.category}` : ''}
                  </option>
                ))}
                {formData.designation && !designationsList.some((d) => String(d.id) === String(formData.designationId)) && (
                  <option value={formData.designationId || ''}>{formData.designation}</option>
                )}
              </select>
            </div>

            <div className="col-span-4">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Department <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                id="teacher-department-select"
                value={formData.departmentId || ''}
                onChange={(e) => {
                  const selId = e.target.value;
                  const sel = departmentsList.find((d) => String(d.id) === String(selId));
                  setFormData((prev) => ({
                    ...prev,
                    departmentId: selId ? Number(selId) : '',
                    department: sel ? sel.name : ''
                  }));
                }}
                style={inputStyle}
                required
              >
                <option value="">{isLoadingDropdowns ? 'Loading departments...' : '-- Select Department --'}</option>
                {departmentsList.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} {dept.code ? `(${dept.code})` : ''}
                  </option>
                ))}
                {formData.department && !departmentsList.some((d) => String(d.id) === String(formData.departmentId)) && (
                  <option value={formData.departmentId || ''}>{formData.department}</option>
                )}
              </select>
            </div>

            {/* Row 2: Subject & Class (Multi-select) */}
            <div className="col-span-6">
              <MultiSelectDropdown
                label="Subject Specialization"
                placeholder="Select Subject Specialization..."
                options={availableSubjects.map((sub) => ({
                  id: sub.id,
                  label: sub.name,
                  code: sub.code,
                  name: sub.name
                }))}
                selectedIds={formData.subjectIds}
                onChange={(newIds, newItems) => {
                  const names = newItems.map((item) => item.name || item.label).join(', ');
                  setFormData((prev) => ({
                    ...prev,
                    subjectIds: newIds,
                    subject: names
                  }));
                }}
                isLoading={isLoadingDropdowns}
              />
            </div>

            <div className="col-span-6">
              <MultiSelectDropdown
                label="Assign Class"
                placeholder="Select Classes to Assign..."
                options={availableClasses.map((c) => ({
                  id: c.id,
                  label: c.label,
                  name: c.name,
                  section: c.section
                }))}
                selectedIds={formData.assignedClassIds}
                onChange={(newIds, newItems) => {
                  const labels = newItems.map((item) => item.label || item.name).join(', ');
                  setFormData((prev) => ({
                    ...prev,
                    assignedClassIds: newIds,
                    assignedClass: labels
                  }));
                }}
                isLoading={isLoadingDropdowns}
              />
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
