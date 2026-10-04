import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Check, ChevronDown, X, Search } from 'lucide-react';

export const MultiSelectDropdown = ({
  label,
  placeholder = 'Select items...',
  options = [],
  selectedIds = [],
  onChange,
  required = false,
  isLoading = false,
  emptyText = 'No items available',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const q = searchTerm.toLowerCase();
    return options.filter((opt) => {
      const matchLabel = (opt.label || opt.name || '').toLowerCase().includes(q);
      const matchSubtitle = (opt.subtitle || opt.code || opt.section || '').toLowerCase().includes(q);
      return matchLabel || matchSubtitle;
    });
  }, [options, searchTerm]);

  // Selected option objects
  const selectedOptions = useMemo(() => {
    const idSet = new Set(selectedIds.map(String));
    return options.filter((opt) => idSet.has(String(opt.id)));
  }, [options, selectedIds]);

  const toggleOption = (id) => {
    const idStr = String(id);
    const isSelected = selectedIds.some((selId) => String(selId) === idStr);
    let updated;
    if (isSelected) {
      updated = selectedIds.filter((selId) => String(selId) !== idStr);
    } else {
      updated = [...selectedIds, id];
    }
    const updatedItems = options.filter((opt) => updated.some((sId) => String(sId) === String(opt.id)));
    if (onChange) {
      onChange(updated, updatedItems);
    }
  };

  const removeOption = (id, e) => {
    e.stopPropagation();
    const idStr = String(id);
    const updated = selectedIds.filter((selId) => String(selId) !== idStr);
    const updatedItems = options.filter((opt) => updated.some((sId) => String(sId) === String(opt.id)));
    if (onChange) {
      onChange(updated, updatedItems);
    }
  };

  const handleSelectAll = (e) => {
    e.stopPropagation();
    const allIds = options.map((opt) => opt.id);
    if (onChange) {
      onChange(allIds, options);
    }
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange([], []);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      {/* Main clickable input box */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          minHeight: '42px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-md, 8px)',
          border: isOpen ? '1px solid #0d9488' : '1px solid var(--border-color, #e2e8f0)',
          backgroundColor: 'var(--bg-app, #ffffff)',
          color: 'var(--text-primary, #1e293b)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? '0 0 0 2px rgba(13, 148, 136, 0.2)' : 'none'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', flex: 1 }}>
          {selectedOptions.length === 0 ? (
            <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.875rem' }}>
              {isLoading ? 'Loading...' : placeholder}
            </span>
          ) : (
            selectedOptions.map((opt) => (
              <span
                key={opt.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(13, 148, 136, 0.12)',
                  color: '#0d9488',
                  border: '1px solid rgba(13, 148, 136, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '16px',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}
              >
                <span>{opt.label || opt.name}</span>
                <span
                  onClick={(e) => removeOption(opt.id, e)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    padding: '1px',
                    marginLeft: '2px'
                  }}
                  title="Remove"
                >
                  <X size={12} />
                </span>
              </span>
            ))
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted, #64748b)' }}>
          {selectedOptions.length > 0 && (
            <span
              onClick={handleClearAll}
              style={{
                fontSize: '0.75rem',
                color: '#ef4444',
                cursor: 'pointer',
                fontWeight: 600,
                padding: '2px 4px'
              }}
              title="Clear all"
            >
              Clear
            </span>
          )}
          <ChevronDown
            size={16}
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: 'var(--radius-md, 8px)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 100,
            overflow: 'hidden',
            maxHeight: '300px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Search box & Action bar */}
          <div
            style={{
              padding: '8px 10px',
              borderBottom: '1px solid var(--border-light, #f1f5f9)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              backgroundColor: 'var(--bg-app, #f8fafc)'
            }}
          >
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '9px',
                  color: 'var(--text-muted, #94a3b8)'
                }}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 30px',
                  fontSize: '0.8rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  color: 'var(--text-primary, #0f172a)',
                  outline: 'none'
                }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary, #64748b)' }}>
                {selectedIds.length} of {options.length} selected
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0d9488',
                    cursor: 'pointer',
                    fontWeight: 600,
                    padding: 0
                  }}
                >
                  Select All
                </button>
                <span style={{ color: 'var(--border-color, #cbd5e1)' }}>|</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted, #64748b)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    padding: 0
                  }}
                >
                  Deselect All
                </button>
              </div>
            </div>
          </div>

          {/* Options List */}
          <div style={{ overflowY: 'auto', maxHeight: '220px', padding: '4px' }}>
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: '16px',
                  textAlign: 'center',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted, #94a3b8)'
                }}
              >
                {isLoading ? 'Loading options...' : emptyText}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedIds.some((selId) => String(selId) === String(opt.id));
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'rgba(13, 148, 136, 0.08)' : 'transparent',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-hover, #f1f5f9)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '4px',
                          border: isSelected ? '1px solid #0d9488' : '1px solid var(--border-color, #cbd5e1)',
                          backgroundColor: isSelected ? '#0d9488' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? '#0d9488' : 'var(--text-primary, #1e293b)'
                          }}
                        >
                          {opt.label || opt.name}
                        </div>
                        {opt.subtitle && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>
                            {opt.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    {opt.code && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-app, #f1f5f9)',
                          color: 'var(--text-secondary, #64748b)',
                          fontWeight: 600
                        }}
                      >
                        {opt.code}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
