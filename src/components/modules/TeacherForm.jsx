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
import { staffService } from '../../services/staffService';

/**
 * Automatically determine role, userType, and type from department and designation
 */
export const computeRoleAndType = (department = '', designation = '') => {
  const d = (designation || '').toLowerCase().trim();
  const dept = (department || '').toLowerCase().trim();

  // 1. Principal / Headmaster / Director / School Leadership
  if (
    d.includes('principal') ||
    d.includes('headmaster') ||
    d.includes('headmistress') ||
    d.includes('director') ||
    dept.includes('leadership')
  ) {
    return { role: 'PRINCIPAL', type: 'Principal', userType: 'PRINCIPAL' };
  }

  // 2. Accountant / Finance / Cashier
  if (
    d.includes('account') ||
    d.includes('cashier') ||
    d.includes('finance') ||
    d.includes('bursar') ||
    dept.includes('account') ||
    dept.includes('finance')
  ) {
    return { role: 'ACCOUNTANT', type: 'Accountant', userType: 'ACCOUNTANT' };
  }

  // 3. Librarian / Library
  if (d.includes('librar') || dept.includes('librar')) {
    return { role: 'LIBRARIAN', type: 'Librarian', userType: 'LIBRARIAN' };
  }

  // 4. Driver / Transport
  if (d.includes('driver') || d.includes('conductor') || dept.includes('transport') || dept.includes('driver')) {
    return { role: 'DRIVER', type: 'Driver', userType: 'DRIVER' };
  }

  // 5. Teachers / Faculty / Academic
  if (
    d.includes('teacher') ||
    d.includes('faculty') ||
    d.includes('pgt') ||
    d.includes('tgt') ||
    d.includes('prt') ||
    d.includes('professor') ||
    d.includes('lecturer') ||
    d.includes('instructor') ||
    dept.includes('teach') ||
    dept.includes('acad')
  ) {
    return { role: 'TEACHER', type: 'Teacher', userType: 'TEACHER' };
  }

  // 6. Support / Non-Teaching Staff / Admin
  if (
    dept.includes('admin') ||
    dept.includes('support') ||
    dept.includes('office') ||
    dept.includes('maint') ||
    d.includes('staff') ||
    d.includes('peon') ||
    d.includes('guard') ||
    d.includes('reception') ||
    d.includes('clerk') ||
    d.includes('admin')
  ) {
    return { role: 'STAFF', type: 'Staff', userType: 'STAFF' };
  }

  // Fallback based on department presence
  if (dept && !dept.includes('teach') && !dept.includes('acad')) {
    return { role: 'STAFF', type: 'Staff', userType: 'STAFF' };
  }

  return { role: 'TEACHER', type: 'Teacher', userType: 'TEACHER' };
};

export const TeacherForm = ({ onBack, onSaveTeacher, initialData = null, isEditMode = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  const [availableBuses, setAvailableBuses] = useState([]);
  const [busLoading, setBusLoading] = useState(false);
  const [busError, setBusError] = useState('');
  const [saveError, setSaveError] = useState('');

  // Dynamic Subjects, Classes, Departments, and Designations loaded from backend APIs
  const [subjectsList, setSubjectsList] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [designationsList, setDesignationsList] = useState([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
  const [isLoadingDesignations, setIsLoadingDesignations] = useState(false);

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
      })
    ])
      .then(([subRes, clsRes, deptRes]) => {
        if (!isMounted) return;
        const subs = Array.isArray(subRes) ? subRes : (subRes?.data || []);
        const cls = Array.isArray(clsRes) ? clsRes : (clsRes?.data || []);
        const depts = Array.isArray(deptRes) ? deptRes : (deptRes?.data || []);
        setSubjectsList(subs);
        setClassesList(cls);
        setDepartmentsList(depts);
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

  const initialResolved = computeRoleAndType(
    initialData?.department || '',
    initialData?.designation || ''
  );
  const initRole = (initialData?.role || initialData?.userType || initialResolved.role || 'TEACHER').toUpperCase();
  const initType = initialData?.type || (
    initRole === 'PRINCIPAL' ? 'Principal' :
    initRole === 'ACCOUNTANT' ? 'Accountant' :
    initRole === 'LIBRARIAN' ? 'Librarian' :
    initRole === 'DRIVER' ? 'Driver' :
    initRole === 'STAFF' ? 'Staff' : 'Teacher'
  );

  // Form State containing all fields
  const [formData, setFormData] = useState({
    busId: '',
    type: initType,
    userType: initRole,
    role: initRole,
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

      const resolvedRoleType = computeRoleAndType(
        initialData.department || '',
        initialData.designation || ''
      );
      const targetRole = (initialData.role || initialData.userType || resolvedRoleType.role || 'TEACHER').toUpperCase();
      const targetType = initialData.type || (
        targetRole === 'PRINCIPAL' ? 'Principal' :
        targetRole === 'ACCOUNTANT' ? 'Accountant' :
        targetRole === 'LIBRARIAN' ? 'Librarian' :
        targetRole === 'DRIVER' ? 'Driver' :
        targetRole === 'STAFF' ? 'Staff' : 'Teacher'
      );

      setFormData((prev) => ({
        ...prev,
        type: targetType,
        userType: targetRole,
        role: targetRole,
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

  const isDriver = String(formData.role || formData.userType || '').toUpperCase() === 'DRIVER';
  useEffect(() => {
    let cancelled = false;
    setAvailableBuses([]);
    setBusError('');
    setFormData(previous => ({ ...previous, busId: '' }));
    if (!isDriver) { setBusLoading(false); return; }
    let refreshing = false;
    const load = async () => {
      if (refreshing || cancelled) return;
      refreshing = true;
      setBusLoading(true);
      try {
        const buses = await staffService.availableBuses();
        if (cancelled) return;
        setAvailableBuses(buses);
        setBusError('');
        setFormData(previous => !previous.busId || buses.some(bus => String(bus.id) === String(previous.busId))
          ? previous : { ...previous, busId: '' });
      } catch (error) {
        if (!cancelled) { setAvailableBuses([]); setBusError(error.message || 'Could not load available buses. Please retry.'); }
      } finally { refreshing = false; if (!cancelled) setBusLoading(false); }
    };
    load();
    window.addEventListener('focus', load);
    const timer = setInterval(() => { if (document.visibilityState === 'visible') load(); }, 15000);
    return () => { cancelled = true; clearInterval(timer); window.removeEventListener('focus', load); };
  }, [isDriver, initialData?.id]);

  // Sync departmentId if only department name was set
  useEffect(() => {
    if (departmentsList.length > 0 && formData.department && !formData.departmentId) {
      const matched = departmentsList.find((d) => (d.name || '').toLowerCase() === formData.department.toLowerCase());
      if (matched) {
        setFormData((prev) => ({ ...prev, departmentId: matched.id }));
      }
    }
  }, [departmentsList, formData.department, formData.departmentId]);

  // Dynamically load designations by selected department ID
  useEffect(() => {
    let isMounted = true;
    if (!formData.departmentId) {
      setDesignationsList([]);
      setIsLoadingDesignations(false);
      return;
    }

    setIsLoadingDesignations(true);
    classService.designations
      .byDepartment(formData.departmentId)
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : (res?.data || res?.content || []);
        setDesignationsList(list);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Failed to load designations for department:', err);
        setDesignationsList([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingDesignations(false);
      });

    return () => {
      isMounted = false;
    };
  }, [formData.departmentId]);

  // Sync designationId if only designation name was set
  useEffect(() => {
    if (designationsList.length > 0 && formData.designation && !formData.designationId) {
      const matched = designationsList.find((d) => (d.name || '').toLowerCase() === formData.designation.toLowerCase());
      if (matched) {
        setFormData((prev) => ({ ...prev, designationId: matched.id }));
      }
    }
  }, [designationsList, formData.designation, formData.designationId]);

  // Only Teaching / Academics or School Leadership departments have Subject Specialization and Assign Class
  const isAcademicOrLeadershipDept = useMemo(() => {
    const selectedDeptObj = departmentsList.find(
      (d) => String(d.id) === String(formData.departmentId)
    );
    const resolvedName = (selectedDeptObj?.name || formData.department || '').toLowerCase().trim();
    const resolvedCode = (selectedDeptObj?.code || '').toLowerCase().trim();

    return (
      resolvedName.includes('teach') ||
      resolvedName.includes('acad') ||
      resolvedName.includes('leadership') ||
      resolvedCode.includes('acad') ||
      resolvedCode.includes('teach') ||
      resolvedCode.includes('lead')
    );
  }, [formData.department, formData.departmentId, departmentsList]);

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
    setSaveError('');
    if (isDriver && (busLoading || busError || (!isEditMode && !formData.busId)
      || (formData.busId && !availableBuses.some(bus => String(bus.id) === String(formData.busId))))) {
      setSaveError(busError || 'Select an available bus for this driver.');
      return;
    }
    savingRef.current = true;
    setIsSaving(true);
    try {
      if (isDriver && formData.busId) {
        const buses = await staffService.availableBuses();
        setAvailableBuses(buses);
        if (!buses.some(bus => String(bus.id) === String(formData.busId))) {
          setFormData(previous => ({ ...previous, busId: '' }));
          setSaveError('This bus has already been assigned. Select an available bus.');
          return;
        }
      }
      const resolvedRole = (formData.role || formData.userType || 'TEACHER').toUpperCase();
      const resolvedType = formData.type || (
        resolvedRole === 'PRINCIPAL' ? 'Principal' :
        resolvedRole === 'ACCOUNTANT' ? 'Accountant' :
        resolvedRole === 'LIBRARIAN' ? 'Librarian' :
        resolvedRole === 'DRIVER' ? 'Driver' :
        resolvedRole === 'STAFF' ? 'Staff' : 'Teacher'
      );

      await onSaveTeacher({
        ...formData,
        type: resolvedType,
        userType: resolvedRole,
        role: resolvedRole,
        busId: isDriver && formData.busId ? Number(formData.busId) : null,
        joiningDate: formData.joinDate || formData.joiningDate || new Date().toISOString().split('T')[0],
        departmentId: formData.departmentId ? Number(formData.departmentId) : null,
        designationId: formData.designationId ? Number(formData.designationId) : null,
        subjectIds: isAcademicOrLeadershipDept ? (formData.subjectIds || []) : [],
        assignedClassIds: isAcademicOrLeadershipDept ? (formData.assignedClassIds || []) : [],
        classIds: isAcademicOrLeadershipDept ? (formData.assignedClassIds || []) : [],
        subject: isAcademicOrLeadershipDept ? formData.subject : '',
        assignedClass: isAcademicOrLeadershipDept ? formData.assignedClass : ''
      });
    } catch (error) {
      setSaveError(error.message || 'Could not save staff. Please retry.');
      if (isDriver) {
        try {
          const refreshed = await staffService.availableBuses();
          const buses = Array.isArray(refreshed) ? refreshed : [];
          setAvailableBuses(buses);
          setFormData(previous => buses.some(bus => String(bus.id) === String(previous.busId)) ? previous : { ...previous, busId: '' });
        } catch (refreshError) {
          setBusError(refreshError.message || 'Could not refresh available buses. Reopen this form to retry.');
        }
      }
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (initialData) {
      const resolvedRoleType = computeRoleAndType(initialData.department || '', initialData.designation || '');
      const targetRole = (initialData.role || initialData.userType || resolvedRoleType.role || 'TEACHER').toUpperCase();
      const targetType = initialData.type || (
        targetRole === 'PRINCIPAL' ? 'Principal' :
        targetRole === 'ACCOUNTANT' ? 'Accountant' :
        targetRole === 'LIBRARIAN' ? 'Librarian' :
        targetRole === 'DRIVER' ? 'Driver' :
        targetRole === 'STAFF' ? 'Staff' : 'Teacher'
      );

      setFormData({
        type: targetType,
        userType: targetRole,
        role: targetRole,
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
        userType: 'TEACHER',
        role: 'TEACHER',
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
            Dashboard / Staff / <strong style={{ color: 'var(--text-primary)' }}>{isEditMode ? 'Edit Staff Profile' : 'Add New Staff'}</strong>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {isEditMode ? `Edit Staff Profile (${initialData?.name || formData.fullName || 'Staff'})` : 'Add New Staff'}
          </h2>
        </div>

        <button className="btn btn-secondary" onClick={onBack} style={{ padding: '8px 16px' }}>
          <ArrowLeft size={16} /> Back to Staff Directory
        </button>
      </div>

      {saveError && <div role="alert" style={{ color: '#ef4444' }}>{saveError}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Section 1: Personal Info */}
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            Personal Info
          </h3>

          <div className="grid-responsive">
            {/* Row 1: Full Name, Department, Designation, and Role */}
            <div className="col-span-3">
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

            {/* Department (First) */}
            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Department <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                id="teacher-department-select"
                value={formData.departmentId || ''}
                onChange={(e) => {
                  const selId = e.target.value;
                  const sel = departmentsList.find((d) => String(d.id) === String(selId));
                  const deptName = sel ? sel.name : '';
                  const deptCode = sel ? sel.code : '';
                  const isAcad = (
                    deptName.toLowerCase().includes('teach') ||
                    deptName.toLowerCase().includes('acad') ||
                    deptName.toLowerCase().includes('leadership') ||
                    deptCode.toLowerCase().includes('acad') ||
                    deptCode.toLowerCase().includes('teach') ||
                    deptCode.toLowerCase().includes('lead')
                  );
                  const resolved = computeRoleAndType(deptName, formData.designation);

                  setFormData((prev) => ({
                    ...prev,
                    departmentId: selId ? Number(selId) : '',
                    department: deptName,
                    // Reset designation when department changes so only valid designations for this department are selected
                    designationId: '',
                    designation: '',
                    role: resolved.role,
                    userType: resolved.userType,
                    type: resolved.type,
                    // Clear subject & assigned classes if switched to non-academic department
                    ...(isAcad ? {} : { subjectIds: [], subject: '', assignedClassIds: [], assignedClass: '' })
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

            {/* Designation (Second - dependent on selected Department) */}
            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Designation <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                id="teacher-designation-select"
                value={formData.designationId || ''}
                disabled={!formData.departmentId || isLoadingDesignations}
                onChange={(e) => {
                  const selId = e.target.value;
                  const sel = designationsList.find((d) => String(d.id) === String(selId));
                  const desigName = sel ? sel.name : '';
                  const resolved = computeRoleAndType(formData.department, desigName);
                  setFormData((prev) => ({
                    ...prev,
                    designationId: selId ? Number(selId) : '',
                    designation: desigName,
                    role: resolved.role,
                    userType: resolved.userType,
                    type: resolved.type
                  }));
                }}
                style={{
                  ...inputStyle,
                  cursor: !formData.departmentId ? 'not-allowed' : 'pointer',
                  backgroundColor: !formData.departmentId ? 'var(--bg-app)' : 'var(--bg-card)',
                  opacity: !formData.departmentId ? 0.75 : 1
                }}
                required
              >
                {!formData.departmentId ? (
                  <option value="">-- Please Select Department First --</option>
                ) : isLoadingDesignations ? (
                  <option value="">Loading designations...</option>
                ) : designationsList.length === 0 ? (
                  <option value="">-- No designations in this department --</option>
                ) : (
                  <option value="">-- Select Designation --</option>
                )}
                {designationsList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.code ? `(${d.code})` : ''}
                  </option>
                ))}
                {formData.designation && !designationsList.some((d) => String(d.id) === String(formData.designationId)) && (
                  <option value={formData.designationId || ''}>{formData.designation}</option>
                )}
              </select>
              {!formData.departmentId ? (
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Please select a department first to load its designations.
                </div>
              ) : designationsList.length === 0 && !isLoadingDesignations ? (
                <div style={{ fontSize: '0.74rem', color: '#eab308', marginTop: '4px' }}>
                  No designations found under this department.
                </div>
              ) : null}
            </div>

            {/* System Role / UserType (Auto-resolved from Department & Designation) */}
            <div className="col-span-3">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                <span>Role / UserType <span style={{ color: '#ef4444' }}>*</span></span>
                <span style={{ fontSize: '0.70rem', color: '#0d9488', fontWeight: 700, background: 'rgba(13, 148, 136, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                  Auto-detected
                </span>
              </label>
              <select
                id="teacher-role-select"
                value={formData.role || formData.userType || 'TEACHER'}
                onChange={(e) => {
                  const selectedRole = e.target.value;
                  const normalizedType =
                    selectedRole === 'PRINCIPAL' ? 'Principal' :
                    selectedRole === 'ACCOUNTANT' ? 'Accountant' :
                    selectedRole === 'LIBRARIAN' ? 'Librarian' :
                    selectedRole === 'DRIVER' ? 'Driver' :
                    selectedRole === 'STAFF' ? 'Staff' : 'Teacher';
                  setFormData((prev) => ({
                    ...prev,
                    role: selectedRole,
                    userType: selectedRole,
                    type: normalizedType
                  }));
                }}
                style={inputStyle}
                required
              >
                <option value="TEACHER">TEACHER (Teacher / Faculty)</option>
                <option value="PRINCIPAL">PRINCIPAL (Principal / Leadership)</option>
                <option value="STAFF">STAFF (Non-teaching / Office Staff)</option>
                <option value="ACCOUNTANT">ACCOUNTANT (Finance / Accounts)</option>
                <option value="LIBRARIAN">LIBRARIAN (Library Staff)</option>
                <option value="DRIVER">DRIVER (Transport Driver)</option>
              </select>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Role: <strong>{formData.role || formData.userType || 'TEACHER'}</strong> (Type: {formData.type || 'Staff'})
              </div>
            </div>

            {isDriver && (
              <div className="col-span-3">
                <label htmlFor="teacher-driver-bus" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                  Assign Bus {!isEditMode && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                <select id="teacher-driver-bus" value={formData.busId || ''}
                  onChange={event => handleChange('busId', event.target.value)}
                  required={!isEditMode} disabled={busLoading || !!busError} style={inputStyle}>
                  <option value="">{busLoading ? 'Loading available buses…' : isEditMode ? 'Keep current bus assignment' : '-- Select available bus --'}</option>
                  {availableBuses.map(bus => <option key={bus.id} value={bus.id}>{bus.busNumber} ({bus.registrationNumber})</option>)}
                </select>
                {busError && <p role="alert" style={{ color: '#ef4444' }}>{busError}</p>}
                {!busLoading && !busError && availableBuses.length === 0 && <p style={{ fontSize: '0.8rem' }}>No unassigned active buses available. Add a bus in Transport first.</p>}
                <small>Only active buses not assigned to another driver are listed.</small>
              </div>
            )}

            {/* Row 2: Subject & Class (Multi-select) - Only shown for Teaching/Academics or School Leadership */}
            {isAcademicOrLeadershipDept && (
              <>
                <div className="col-span-6 animate-fade-in">
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

                <div className="col-span-6 animate-fade-in">
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
              </>
            )}

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
            disabled={isSaving || (isDriver && (busLoading || !!busError || (!isEditMode && !formData.busId)))}
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
