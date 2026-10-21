import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  RotateCcw,
  Search,
  Check,
  X,
  Gauge,
  Lightbulb,
  Crosshair,
  Smartphone,
  Eye,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { transportService } from '../../../services/transportService';

const ICON_OPTIONS = [
  { key: 'speed', label: 'Brakes & Steering', icon: Gauge },
  { key: 'light', label: 'Lights & Mirrors', icon: Lightbulb },
  { key: 'tire', label: 'Tires & Fluids', icon: Sliders },
  { key: 'medical', label: 'First Aid & Extinguisher', icon: Crosshair },
  { key: 'gps', label: 'GPS & Location', icon: Smartphone },
  { key: 'check', label: 'General Inspection', icon: CheckCircle2 }
];

const getIconComponent = (key) => {
  switch (key) {
    case 'speed':
      return Gauge;
    case 'light':
      return Lightbulb;
    case 'tire':
      return Sliders;
    case 'medical':
      return Crosshair;
    case 'gps':
      return Smartphone;
    default:
      return CheckCircle2;
  }
};

export const SafetyChecklistTab = ({
  checklist = [],
  onRefresh,
  showToast = () => {},
  schoolId = 'SCH-001'
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, MANDATORY, OPTIONAL, ACTIVE
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    iconKey: 'check',
    required: true,
    active: true,
    sortOrder: 1
  });

  // Filtered Checklist
  const filteredList = useMemo(() => {
    return checklist.filter((item) => {
      const matchSearch =
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      const isReq = item.required ?? item.isRequired;
      const isAct = item.active ?? item.isActive;

      if (filter === 'MANDATORY') return isReq;
      if (filter === 'OPTIONAL') return !isReq;
      if (filter === 'ACTIVE') return isAct;
      return true;
    });
  }, [checklist, search, filter]);

  // Statistics
  const totalCount = checklist.length;
  const mandatoryCount = checklist.filter((i) => i.required ?? i.isRequired).length;
  const optionalCount = totalCount - mandatoryCount;
  const activeCount = checklist.filter((i) => i.active ?? i.isActive).length;

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setForm({
      title: '',
      description: '',
      iconKey: 'check',
      required: true,
      active: true,
      sortOrder: totalCount + 1
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title || '',
      description: item.description || '',
      iconKey: item.iconKey || 'check',
      required: item.required ?? item.isRequired ?? true,
      active: item.active ?? item.isActive ?? true,
      sortOrder: item.sortOrder || 1
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('Please enter an inspection title', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem) {
        await transportService.updateSafetyChecklistItem(editingItem.id, form, schoolId);
        showToast('Safety checklist item updated successfully', 'success');
      } else {
        await transportService.createSafetyChecklistItem(form, schoolId);
        showToast('Safety checklist item added successfully', 'success');
      }
      setShowModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to save checklist item', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete checklist item "${item.title}"?`)) return;
    try {
      await transportService.deleteSafetyChecklistItem(item.id, schoolId);
      showToast('Checklist item deleted', 'info');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to delete checklist item', 'error');
    }
  };

  const handleToggleRequired = async (item) => {
    const currentReq = item.required ?? item.isRequired ?? true;
    const newReq = !currentReq;
    setTogglingId(item.id);
    try {
      await transportService.updateSafetyChecklistItem(
        item.id,
        {
          title: item.title,
          description: item.description,
          iconKey: item.iconKey,
          required: newReq,
          active: item.active ?? item.isActive ?? true,
          sortOrder: item.sortOrder
        },
        schoolId
      );
      showToast(
        `"${item.title}" is now ${newReq ? 'MANDATORY (Compulsory for Drivers)' : 'OPTIONAL'}`,
        'success'
      );
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update requirement status', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleActive = async (item) => {
    const currentAct = item.active ?? item.isActive ?? true;
    const newAct = !currentAct;
    setTogglingId(item.id);
    try {
      await transportService.updateSafetyChecklistItem(
        item.id,
        {
          title: item.title,
          description: item.description,
          iconKey: item.iconKey,
          required: item.required ?? item.isRequired ?? true,
          active: newAct,
          sortOrder: item.sortOrder
        },
        schoolId
      );
      showToast(`"${item.title}" is now ${newAct ? 'ACTIVE' : 'INACTIVE'}`, 'info');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update active status', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleResetDefaults = async () => {
    if (
      !window.confirm(
        'Reset safety checklist to standard 5 safety items? Any custom items will be replaced.'
      )
    ) {
      return;
    }
    setIsResetting(true);
    try {
      await transportService.resetSafetyChecklist(schoolId);
      showToast('Safety checklist reset to standard 5 items', 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to reset checklist', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          background: 'var(--bg-card, #ffffff)',
          padding: '20px 24px',
          borderRadius: 'var(--radius-lg, 14px)',
          border: '1px solid var(--border-color, #e2e8f0)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)'
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Vehicle Safety Inspection Checklist
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Configure daily inspection items for all school drivers. Compulsory checks must be verified before starting a trip.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleResetDefaults}
            disabled={isResetting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #cbd5e1)',
              background: 'var(--bg-card, #ffffff)',
              color: 'var(--text-secondary, #475569)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Reset to 5 standard inspection checks"
          >
            <RotateCcw size={15} className={isResetting ? 'spin' : ''} />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={onRefresh}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #cbd5e1)',
              background: 'var(--bg-card, #ffffff)',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} />
          </button>

          <button
            onClick={handleOpenAddModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(13, 148, 136, 0.3)'
            }}
          >
            <Plus size={16} />
            <span>Add Checklist Item</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            background: 'var(--bg-card, #ffffff)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Checks</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {totalCount}
            </div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(13, 148, 136, 0.1)',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div
          style={{
            padding: '16px 20px',
            background: 'var(--bg-card, #ffffff)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={13} />
              <span>Mandatory Checks (Required)</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>
              {mandatoryCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Compulsory to start trip</div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShieldCheck size={22} />
          </div>
        </div>

        <div
          style={{
            padding: '16px 20px',
            background: 'var(--bg-card, #ffffff)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Optional Checks</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#475569', marginTop: '4px' }}>
              {optionalCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Non-blocking recommendations</div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(100, 116, 139, 0.1)',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Info size={22} />
          </div>
        </div>

        <div
          style={{
            padding: '16px 20px',
            background: 'var(--bg-card, #ffffff)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>Active on Mobile</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
              {activeCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Shown on all drivers' screens</div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(22, 163, 74, 0.1)',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Smartphone size={22} />
          </div>
        </div>
      </div>

      {/* Main Grid: Management Table + Live Mobile Preview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)',
          gap: '24px',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Management Table */}
        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            borderRadius: 'var(--radius-lg, 14px)',
            border: '1px solid var(--border-color, #e2e8f0)',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          {/* Filter Bar */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
              <Search size={16} color="var(--text-secondary)" />
              <input
                type="text"
                placeholder="Search checklist items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  fontSize: '0.86rem',
                  background: 'var(--bg-app, #f8fafc)',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { key: 'ALL', label: 'All Checks' },
                { key: 'MANDATORY', label: 'Mandatory' },
                { key: 'OPTIONAL', label: 'Optional' },
                { key: 'ACTIVE', label: 'Active' }
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: filter === f.key ? 700 : 500,
                    background: filter === f.key ? '#0d9488' : 'var(--bg-app, #f1f5f9)',
                    color: filter === f.key ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Items List */}
          {filteredList.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={40} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>No safety checklist items found</div>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                Add inspection items using the button above or reset to standard 5 checks.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredList.map((item, idx) => {
                const isReq = item.required ?? item.isRequired ?? true;
                const isAct = item.active ?? item.isActive ?? true;
                const IconComp = getIconComponent(item.iconKey);
                const isToggling = togglingId === item.id;

                return (
                  <div
                    key={item.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      borderBottom: '1px solid var(--border-color, #f1f5f9)',
                      background: !isAct ? 'rgba(241, 245, 249, 0.5)' : '#ffffff',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: isReq ? 'rgba(239, 68, 68, 0.1)' : 'rgba(13, 148, 136, 0.1)',
                          color: isReq ? '#dc2626' : '#0d9488',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <IconComp size={20} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {item.title}
                          </span>

                          {/* Mandatory vs Optional Badge */}
                          <span
                            onClick={() => handleToggleRequired(item)}
                            title="Click to toggle Mandatory / Optional"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              background: isReq ? 'rgba(239, 68, 68, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                              color: isReq ? '#dc2626' : '#64748b',
                              border: `1px solid ${isReq ? 'rgba(239, 68, 68, 0.3)' : 'rgba(100, 116, 139, 0.2)'}`
                            }}
                          >
                            {isReq ? '★ Mandatory (Required)' : 'Optional'}
                          </span>

                          {!isAct && (
                            <span
                              style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                background: '#f1f5f9',
                                color: '#94a3b8'
                              }}
                            >
                              Disabled
                            </span>
                          )}
                        </div>

                        {item.description && (
                          <p
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--text-secondary)',
                              margin: '4px 0 0 0',
                              lineHeight: 1.35
                            }}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick Toggles and Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, marginLeft: '12px' }}>
                      {/* Mandatory Quick Toggle */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                        <label
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: isReq ? '#dc2626' : 'var(--text-secondary)'
                          }}
                        >
                          Required?
                        </label>
                        <button
                          onClick={() => handleToggleRequired(item)}
                          disabled={isToggling}
                          style={{
                            width: '42px',
                            height: '22px',
                            borderRadius: '12px',
                            background: isReq ? '#dc2626' : '#cbd5e1',
                            border: 'none',
                            position: 'relative',
                            cursor: 'pointer',
                            padding: '2px',
                            transition: 'background 0.2s'
                          }}
                        >
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: '#ffffff',
                              transform: isReq ? 'translateX(20px)' : 'translateX(0)',
                              transition: 'transform 0.2s',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }}
                          />
                        </button>
                      </div>

                      {/* Active Quick Toggle */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                        <label
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: isAct ? '#16a34a' : 'var(--text-secondary)'
                          }}
                        >
                          Active
                        </label>
                        <button
                          onClick={() => handleToggleActive(item)}
                          disabled={isToggling}
                          style={{
                            width: '42px',
                            height: '22px',
                            borderRadius: '12px',
                            background: isAct ? '#16a34a' : '#cbd5e1',
                            border: 'none',
                            position: 'relative',
                            cursor: 'pointer',
                            padding: '2px',
                            transition: 'background 0.2s'
                          }}
                        >
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: '#ffffff',
                              transform: isAct ? 'translateX(20px)' : 'translateX(0)',
                              transition: 'transform 0.2s',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }}
                          />
                        </button>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          style={{
                            padding: '7px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color, #cbd5e1)',
                            background: '#ffffff',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer'
                          }}
                          title="Edit checklist item"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          style={{
                            padding: '7px',
                            borderRadius: '6px',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            background: '#fff5f5',
                            color: '#ef4444',
                            cursor: 'pointer'
                          }}
                          title="Delete checklist item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Driver Mobile App Live Preview */}
        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            borderRadius: 'var(--radius-lg, 14px)',
            border: '1px solid var(--border-color, #e2e8f0)',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            position: 'sticky',
            top: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Eye size={18} color="#0d9488" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Driver App Live Preview
            </h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
            This preview simulates the actual driver home screen. Drivers must verify all mandatory items before starting their trip.
          </p>

          {/* Phone Shell */}
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '24px',
              border: '6px solid #1e293b',
              padding: '16px 14px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {/* Phone Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '6px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a' }}>Driver Companion</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Safe Route Navigator</div>
            </div>

            {/* Today Assigned Duty Card Mock */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>Today's Assigned Duty</span>
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '8px',
                    background: '#ecfdf5',
                    color: '#059669'
                  }}
                >
                  MORNING
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.62rem' }}>Vehicle</div>
                  <div style={{ fontWeight: 800, color: '#1e293b' }}>DEL76768</div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.62rem' }}>Departure</div>
                  <div style={{ fontWeight: 800, color: '#0d9488' }}>07:15 AM</div>
                </div>
              </div>
              <div style={{ marginTop: '6px', fontSize: '0.68rem', color: '#475569', fontWeight: 600 }}>
                Route 1 - North Campus Loop
              </div>
            </div>

            {/* Vehicle Safety Checklist Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>Vehicle Safety Checklist</div>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '10px',
                  background: '#fef3c7',
                  color: '#d97706'
                }}
              >
                {mandatoryCount} Required Checks
              </span>
            </div>

            {/* Checklist items list */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '260px',
                overflowY: 'auto'
              }}
            >
              {checklist.filter((i) => i.active ?? i.isActive).length === 0 ? (
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', padding: '12px' }}>
                  No active safety items.
                </div>
              ) : (
                checklist
                  .filter((i) => i.active ?? i.isActive)
                  .map((item, idx) => {
                    const isReq = item.required ?? item.isRequired;
                    const IconComp = getIconComponent(item.iconKey);
                    return (
                      <div
                        key={item.id || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          padding: '6px 4px',
                          borderBottom: idx < checklist.length - 1 ? '1px solid #f1f5f9' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              background: 'rgba(13, 148, 136, 0.1)',
                              color: '#0d9488',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <IconComp size={13} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                color: '#1e293b',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {item.title}
                            </div>
                            <div style={{ fontSize: '0.62rem', color: isReq ? '#dc2626' : '#64748b' }}>
                              {isReq ? '★ Mandatory' : 'Optional'}
                            </div>
                          </div>
                        </div>

                        {/* Checkbox preview */}
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: `2px solid ${isReq ? '#dc2626' : '#cbd5e1'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#ffffff'
                          }}
                        >
                          {isReq && <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: 900 }}>*</span>}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Start Trip Button Mock */}
            <div
              style={{
                background: '#0d9488',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '10px',
                textAlign: 'center',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>Verify Required Checks to Start</span>
            </div>

            {/* Driver License Card Mock */}
            <div
              style={{
                background: 'rgba(13, 148, 136, 0.08)',
                border: '1px solid rgba(13, 148, 136, 0.25)',
                borderRadius: '8px',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShieldCheck size={16} color="#0d9488" />
              <div style={{ fontSize: '0.65rem', color: '#334155' }}>
                <div style={{ fontWeight: 700 }}>Driver License Verified: DL-DRI-7398</div>
                <div style={{ color: '#64748b' }}>Valid through 2031-10-21</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Checklist Item Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(13, 148, 136, 0.1)',
                    color: '#0d9488',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  {editingItem ? 'Edit Safety Checklist Item' : 'Add Vehicle Safety Check'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Title */}
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Inspection Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Brakes, Steering & Horn OK"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem'
                  }}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Inspection Description / Subtitle
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Hydraulics, brake pedal firmness & horn functional"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Icon Style
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {ICON_OPTIONS.map((opt) => {
                    const IconC = opt.icon;
                    const isSelected = form.iconKey === opt.key;
                    return (
                      <button
                        type="button"
                        key={opt.key}
                        onClick={() => setForm({ ...form, iconKey: opt.key })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: `1px solid ${isSelected ? '#0d9488' : '#e2e8f0'}`,
                          background: isSelected ? 'rgba(13, 148, 136, 0.08)' : '#ffffff',
                          color: isSelected ? '#0d9488' : '#64748b',
                          cursor: 'pointer',
                          fontSize: '0.76rem',
                          fontWeight: isSelected ? 700 : 500
                        }}
                      >
                        <IconC size={15} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Required & Active Toggles */}
              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: '10px',
                  padding: '14px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Mandatory / Required Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b' }}>
                      Mandatory Check (Required = true)
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Driver cannot start a trip until this check is completed.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.required}
                    onChange={(e) => setForm({ ...form, required: e.target.checked })}
                    style={{ width: '20px', height: '20px', accentColor: '#dc2626', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ height: '1px', background: '#e2e8f0' }} />

                {/* Active Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b' }}>
                      Active (Visible to drivers)
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Enable or disable this inspection item.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    style={{ width: '20px', height: '20px', accentColor: '#0d9488', cursor: 'pointer' }}
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#64748b',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0d9488',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isSaving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyChecklistTab;
