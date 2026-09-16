import React, { useRef, useState, useEffect } from 'react';
import { Upload, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Spinner } from '../ui/Spinner';

export const GuardianForm = ({ onBack, onSaveGuardian, initialData = null, isEditMode = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  // Form State containing all fields from guardian screenshot
  const [formData, setFormData] = useState({
    guardianType: initialData?.relation || 'Father',
    guardianName: initialData?.name || '',
    instagram: initialData?.phone || '',
    occupation: initialData?.occupation || '',
    guardianAddress: initialData?.address || '',
    guardianPhoto: null,
    email: initialData?.email || '',
    password: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        guardianType: initialData.relation || prev.guardianType,
        guardianName: initialData.name || prev.guardianName,
        instagram: initialData.phone || prev.instagram,
        occupation: initialData.occupation || prev.occupation,
        guardianAddress: initialData.address || prev.guardianAddress,
        email: initialData.email || prev.email
      }));
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSaveGuardian || savingRef.current) {
      return;
    }
    savingRef.current = true;
    setIsSaving(true);
    try {
      await onSaveGuardian(formData);
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (initialData) {
      setFormData({
        guardianType: initialData.relation || 'Father',
        guardianName: initialData.name || '',
        instagram: initialData.phone || '',
        occupation: initialData.occupation || '',
        guardianAddress: initialData.address || '',
        guardianPhoto: null,
        email: initialData.email || '',
        password: ''
      });
    } else {
      setFormData({
        guardianType: 'Father',
        guardianName: '',
        instagram: '',
        occupation: '',
        guardianAddress: '',
        guardianPhoto: null,
        email: '',
        password: ''
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Breadcrumb */}
      <div
        className="card animate-fade-in"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Dashboard / <strong style={{ color: 'var(--text-primary)' }}>{isEditMode ? 'Edit Guardian' : 'Add New Guardian'}</strong>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {isEditMode ? `Edit Guardian Details (${initialData?.name || 'Guardian'})` : 'Add New Guardian'}
          </h2>
        </div>

        <button className="btn btn-secondary" onClick={onBack} style={{ padding: '8px 16px' }}>
          <ArrowLeft size={16} /> Back to Guardian Directory
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
            <div className="col-span-4">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Guardian Type
              </label>
              <select
                value={formData.guardianType}
                onChange={(e) => handleChange('guardianType', e.target.value)}
                style={inputStyle}
              >
                <option>Father</option>
                <option>Mother</option>
                <option>Brother</option>
                <option>Sister</option>
                <option>Other</option>
              </select>
            </div>

            <div className="col-span-4">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Guardian Name
              </label>
              <input
                type="text"
                placeholder="Enter guardian name"
                value={formData.guardianName}
                onChange={(e) => handleChange('guardianName', e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div className="col-span-4">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Instagram
              </label>
              <input
                type="text"
                placeholder="Enter phone number"
                value={formData.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Row 2 */}
            <div className="col-span-4">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Occupation
              </label>
              <input
                type="text"
                placeholder="Enter occupation"
                value={formData.occupation}
                onChange={(e) => handleChange('occupation', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-4">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Guardian Address
              </label>
              <input
                type="text"
                placeholder="Enter guardian address"
                value={formData.guardianAddress}
                onChange={(e) => handleChange('guardianAddress', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-span-4">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Teacher Photo <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <DropzoneArea placeholder="Darg & drop a file here or click" />
            </div>
          </div>
        </div>

        {/* Section 2: Login Details */}
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
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
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
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
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

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
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
            {isSaving ? (<><Spinner size={16} color="#ffffff" /> Saving...</>) : (isEditMode ? 'Update Guardian Details' : 'Save Changes')}
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

// Dropzone Area Component
const DropzoneArea = ({ placeholder }) => {
  return (
    <div
      style={{
        border: '2px dashed var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '10px',
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
