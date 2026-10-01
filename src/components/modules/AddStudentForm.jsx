import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  Upload,
  Calendar,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  Save
} from 'lucide-react';
import { Spinner } from '../ui/Spinner';
import { classService } from '../../services/classService';

export const AddStudentForm = ({ onBack, onSaveStudent, initialData = null, isEditMode = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  // Dynamic Classes and Sections loaded from backend APIs
  const [classesList, setClassesList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingClasses(true);
    Promise.all([
      classService.classes.list().catch(() => []),
      classService.sections.list().catch(() => [])
    ])
      .then(([clsRes, secRes]) => {
        if (!isMounted) return;
        const cls = Array.isArray(clsRes) ? clsRes : (clsRes?.data || []);
        const secs = Array.isArray(secRes) ? secRes : (secRes?.data || []);
        setClassesList(cls);
        setSectionsList(secs);
      })
      .catch((err) => console.warn('Failed to load classes and sections from API:', err))
      .finally(() => {
        if (isMounted) setIsLoadingClasses(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const availableClasses = useMemo(() => {
    const list = [];
    const seen = new Set();
    classesList.forEach((c) => {
      const name = c.name?.trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        list.push({ id: c.id, name });
      }
    });
    return list;
  }, [classesList]);

  const availableSections = useMemo(() => {
    const list = [];
    const seen = new Set();
    sectionsList.forEach((s) => {
      const name = s.name?.trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        list.push({ id: s.id, name });
      }
    });
    return list;
  }, [sectionsList]);

  const initialClassName = initialData?.studentClass || initialData?.className || (initialData?.class ? initialData.class.split(' - ')[0] : '');
  const initialSection = initialData?.section || (initialData?.class && initialData.class.includes(' - ') ? initialData.class.split(' - ')[1] : '');

  // Form State initialized with clean, empty fields (no static mock text pre-filled)
  const [formData, setFormData] = useState({
    // Personal Info
    academicYear: initialData?.academicYear || '2025/2026',
    studentClass: initialClassName || '',
    section: initialSection || '',
    rollNumber: initialData?.rollNo || initialData?.rollNumber || '',
    admissionNo: initialData?.admissionNo || initialData?.id || '',
    fullName: initialData?.name || initialData?.fullName || '',
    category: initialData?.category || '',
    gender: initialData?.gender || 'Male',
    dob: initialData?.dob || initialData?.dateOfBirth || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    studentPhoto: initialData?.avatar || initialData?.studentPhoto || null,

    // Parent & Guardian Info
    fatherName: initialData?.fatherName || '',
    fatherPhone: initialData?.fatherPhone || '',
    fatherOccupation: initialData?.fatherOccupation || '',
    fatherPhoto: initialData?.fatherPhoto || null,
    motherName: initialData?.motherName || '',
    motherPhone: initialData?.motherPhone || '',
    motherOccupation: initialData?.motherOccupation || '',
    motherPhoto: initialData?.motherPhoto || null,

    // Select a Guardian
    guardianRelation: initialData?.guardianRelation || 'Father',
    guardianName: initialData?.guardianName || initialData?.guardian || '',
    guardianEmail: initialData?.guardianEmail || '',
    guardianPhone: initialData?.guardianPhone || '',
    guardianOccupation: initialData?.guardianOccupation || '',
    guardianAddress: initialData?.guardianAddress || '',
    guardianPhoto: initialData?.guardianPhoto || null,

    // Medical Details
    bloodGroup: initialData?.bloodGroup || 'A+',
    height: initialData?.height || '',
    weight: initialData?.weight || '',

    // Bank Details
    bankAccountNumber: initialData?.bankAccountNumber || '',
    bankName: initialData?.bankName || '',
    ifscCode: initialData?.ifscCode || '',
    nationalIdNumber: initialData?.nationalIdNumber || '',

    // Previous School Details
    prevSchoolName: initialData?.prevSchoolName || '',
    prevSchoolAddress: initialData?.prevSchoolAddress || '',

    // Address
    currentAddress: initialData?.currentAddress || '',
    permanentAddress: initialData?.permanentAddress || '',

    // Hostel Details
    hostelName: initialData?.hostelName || '',
    roomNo: initialData?.roomNo || '',

    // Upload Documents
    docName: initialData?.docName || '',
    docFile: initialData?.docFile || null,

    // Student Details
    studentNotes: initialData?.studentNotes || '',

    // Login Details
    loginEmail: initialData?.email || '',
    loginPassword: ''
  });

  useEffect(() => {
    if (initialData) {
      const cls = initialData.studentClass || initialData.className || (initialData.class ? initialData.class.split(' - ')[0] : '');
      const sec = initialData.section || (initialData.class && initialData.class.includes(' - ') ? initialData.class.split(' - ')[1] : '');
      setFormData((prev) => ({
        ...prev,
        fullName: initialData.name || initialData.fullName || prev.fullName,
        studentClass: cls || prev.studentClass,
        section: sec || prev.section,
        rollNumber: initialData.rollNo || initialData.rollNumber || prev.rollNumber,
        admissionNo: initialData.admissionNo || initialData.id || prev.admissionNo,
        phone: initialData.phone || prev.phone,
        email: initialData.email || prev.email,
        category: initialData.category || prev.category,
        gender: initialData.gender || prev.gender,
        dob: initialData.dob || initialData.dateOfBirth || prev.dob,
        studentPhoto: initialData.avatar || initialData.studentPhoto || prev.studentPhoto,
        fatherName: initialData.fatherName || prev.fatherName,
        fatherPhone: initialData.fatherPhone || prev.fatherPhone,
        fatherOccupation: initialData.fatherOccupation || prev.fatherOccupation,
        fatherPhoto: initialData.fatherPhoto || prev.fatherPhoto,
        motherName: initialData.motherName || prev.motherName,
        motherPhone: initialData.motherPhone || prev.motherPhone,
        motherOccupation: initialData.motherOccupation || prev.motherOccupation,
        motherPhoto: initialData.motherPhoto || prev.motherPhoto,
        guardianRelation: initialData.guardianRelation || prev.guardianRelation,
        guardianName: initialData.guardianName || initialData.guardian || prev.guardianName,
        guardianEmail: initialData.guardianEmail || prev.guardianEmail,
        guardianPhone: initialData.guardianPhone || prev.guardianPhone,
        guardianOccupation: initialData.guardianOccupation || prev.guardianOccupation,
        guardianAddress: initialData.guardianAddress || prev.guardianAddress,
        guardianPhoto: initialData.guardianPhoto || prev.guardianPhoto,
        bloodGroup: initialData.bloodGroup || prev.bloodGroup,
        height: initialData.height || prev.height,
        weight: initialData.weight || prev.weight,
        bankAccountNumber: initialData.bankAccountNumber || prev.bankAccountNumber,
        bankName: initialData.bankName || prev.bankName,
        ifscCode: initialData.ifscCode || prev.ifscCode,
        nationalIdNumber: initialData.nationalIdNumber || prev.nationalIdNumber,
        prevSchoolName: initialData.prevSchoolName || prev.prevSchoolName,
        prevSchoolAddress: initialData.prevSchoolAddress || prev.prevSchoolAddress,
        currentAddress: initialData.currentAddress || prev.currentAddress,
        permanentAddress: initialData.permanentAddress || prev.permanentAddress,
        hostelName: initialData.hostelName || prev.hostelName,
        roomNo: initialData.roomNo || prev.roomNo,
        docName: initialData.docName || prev.docName,
        docFile: initialData.docFile || prev.docFile,
        studentNotes: initialData.studentNotes || prev.studentNotes,
        loginEmail: initialData.email || prev.loginEmail,
        loginPassword: ''
      }));
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSaveStudent || savingRef.current) {
      return;
    }
    savingRef.current = true;
    setIsSaving(true);
    try {
      await onSaveStudent(formData);
    } finally {
      savingRef.current = false;
      setIsSaving(false);
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
            Dashboard / Student / <strong style={{ color: 'var(--text-primary)' }}>{isEditMode ? 'Edit Student' : 'Add New Student'}</strong>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {isEditMode ? `Edit Student Profile (${initialData?.name || 'Student'})` : 'Add New Student'}
          </h2>
        </div>

        <button className="btn btn-secondary" onClick={onBack} style={{ padding: '8px 16px' }}>
          <ArrowLeft size={16} /> Back to Student List
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Section 1: Personal Info */}
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            Personal Info
          </h3>

          <div className="grid-responsive">
            {/* Row 1 */}
            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Academic Year <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.academicYear}
                onChange={(e) => handleChange('academicYear', e.target.value)}
                style={inputStyle}
              >
                <option value="2025/2026">2025/2026</option>
                <option value="2026/2027">2026/2027</option>
                <option value="2027/2028">2027/2028</option>
              </select>
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Class <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.studentClass}
                onChange={(e) => handleChange('studentClass', e.target.value)}
                style={inputStyle}
                required
              >
                <option value="">Select Class {isLoadingClasses ? '(Loading...)' : ''}</option>
                {availableClasses.map((cls) => (
                  <option key={cls.id || cls.name} value={cls.name}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Section <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.section}
                onChange={(e) => handleChange('section', e.target.value)}
                style={inputStyle}
              >
                <option value="">Select Section {isLoadingClasses ? '(Loading...)' : ''}</option>
                {availableSections.map((sec) => (
                  <option key={sec.id || sec.name} value={sec.name}>
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Roll Number
              </label>
              <input
                type="text"
                placeholder="Enter your rollNumber"
                value={formData.rollNumber}
                onChange={(e) => handleChange('rollNumber', e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Row 2 */}
            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Admission No <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Enter admission number"
                value={formData.admissionNo}
                onChange={(e) => handleChange('admissionNo', e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Full Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Enter your Full Name"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Category <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Select a Category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                style={inputStyle}
              />
            </div>

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

            {/* Row 3 */}
            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Date Of Birth <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="dd/mm/yyyy"
                value={formData.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Phone Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Enter your Phone Number"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
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
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Student Photo
              </label>
              <DropzoneArea
                placeholder="Drag & drop student photo or click"
                onFileSelect={(dataUrl) => handleChange('studentPhoto', dataUrl)}
                preview={formData.studentPhoto}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Parent & Guardian Info */}
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            Parent & Guardian Info
          </h3>

          <div className="grid-responsive">
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
                Phone Number
              </label>
              <input
                type="text"
                placeholder="Enter Fathers Number"
                value={formData.fatherPhone}
                onChange={(e) => handleChange('fatherPhone', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Father Occupation
              </label>
              <input
                type="text"
                placeholder="Enter Father Occupation"
                value={formData.fatherOccupation}
                onChange={(e) => handleChange('fatherOccupation', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Fathers Photo
              </label>
              <DropzoneArea
                placeholder="Drag & drop fathers photo or click"
                onFileSelect={(dataUrl) => handleChange('fatherPhoto', dataUrl)}
                preview={formData.fatherPhoto}
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

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Phone Number
              </label>
              <input
                type="text"
                placeholder="Enter mothers Number"
                value={formData.motherPhone}
                onChange={(e) => handleChange('motherPhone', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Mother Occupation
              </label>
              <input
                type="text"
                placeholder="Enter Mother Occupation"
                value={formData.motherOccupation}
                onChange={(e) => handleChange('motherOccupation', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Mothers Photo
              </label>
              <DropzoneArea
                placeholder="Drag & drop mothers photo or click"
                onFileSelect={(dataUrl) => handleChange('motherPhoto', dataUrl)}
                preview={formData.motherPhoto}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Select a Guardian */}
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Select a Guardian</h3>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', fontWeight: 600 }}>
              {['Father', 'Mother', 'Others'].map((rel) => (
                <label key={rel} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="guardianRelation"
                    value={rel}
                    checked={formData.guardianRelation === rel}
                    onChange={(e) => handleChange('guardianRelation', e.target.value)}
                  />
                  {rel}
                </label>
              ))}
            </div>
          </div>

          <div className="grid-responsive">
            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Guardian Name
              </label>
              <input
                type="text"
                placeholder="Enter Guardian Name"
                value={formData.guardianName}
                onChange={(e) => handleChange('guardianName', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Guardian Email
              </label>
              <input
                type="email"
                placeholder="Enter Guardian Email"
                value={formData.guardianEmail}
                onChange={(e) => handleChange('guardianEmail', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Phone Number
              </label>
              <input
                type="text"
                placeholder="Enter Guardian Number"
                value={formData.guardianPhone}
                onChange={(e) => handleChange('guardianPhone', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Guardian Occupation
              </label>
              <input
                type="text"
                placeholder="Enter Guardian Occupation"
                value={formData.guardianOccupation}
                onChange={(e) => handleChange('guardianOccupation', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-9">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Guardian Address
              </label>
              <input
                type="text"
                placeholder="Enter Guardian Address"
                value={formData.guardianAddress}
                onChange={(e) => handleChange('guardianAddress', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-3">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Guardian Photo
              </label>
              <DropzoneArea
                placeholder="Drag & drop guardian photo or click"
                onFileSelect={(dataUrl) => handleChange('guardianPhoto', dataUrl)}
                preview={formData.guardianPhoto}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Medical Details */}
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

        {/* Section 5: Bank Details */}
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
                placeholder="Enter bank account number"
                value={formData.bankAccountNumber}
                onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
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

        {/* Section 6: Previous School Details & Address */}
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

        {/* Section 7: Hostel Details & Upload Documents */}
        <div className="grid-responsive">
          <div className="col-span-6 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              Hostel Details
            </h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Hostel
                </label>
                <input
                  type="text"
                  placeholder="Enter Hostel"
                  value={formData.hostelName}
                  onChange={(e) => handleChange('hostelName', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Room No
                </label>
                <input
                  type="text"
                  placeholder="Enter Room No"
                  value={formData.roomNo}
                  onChange={(e) => handleChange('roomNo', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div className="col-span-6 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  Document File
                </label>
                <DropzoneArea
                  placeholder="Drag & drop document file or click"
                  onFileSelect={(dataUrl) => handleChange('docFile', dataUrl)}
                  preview={formData.docFile}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 8: Student Details */}
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            Student Details
          </h3>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              Details
            </label>
            <textarea
              placeholder="Enter details"
              rows={3}
              value={formData.studentNotes}
              onChange={(e) => handleChange('studentNotes', e.target.value)}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: '80px'
              }}
            />
          </div>
        </div>

        {/* Section 9: Login Details */}
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
            onClick={onBack}
            className="btn btn-secondary"
            style={{
              padding: '12px 36px',
              color: '#ef4444',
              borderColor: '#ef4444',
              fontWeight: 700,
              fontSize: '0.95rem'
            }}
          >
            Cancel
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
            {isSaving ? (<><Spinner size={16} color="#ffffff" /> Saving...</>) : (isEditMode ? 'Update Student Details' : 'Save Changes')}
          </button>
        </div>
      </form>
    </div>
  );
};

// Common Input Style Utility
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

// Drag & Drop File Zone Component matching reference image
const DropzoneArea = ({ placeholder, onFileSelect, preview }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        onFileSelect(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      style={{
        border: '2px dashed var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 12px',
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
        transition: 'all 0.2s ease',
        overflow: 'hidden'
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*,.pdf,.doc,.docx"
      />
      {preview ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src={preview}
            alt="Preview"
            style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>File Selected (Click to change)</span>
        </div>
      ) : (
        <>
          <Upload size={14} />
          <span>{placeholder}</span>
        </>
      )}
    </div>
  );
};
