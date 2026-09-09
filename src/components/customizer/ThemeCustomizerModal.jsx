import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { X, Sun, Moon, Check } from 'lucide-react';

export const ThemeCustomizerModal = () => {
  const {
    isCustomizerOpen,
    setIsCustomizerOpen,
    theme,
    setTheme,
    accentColor,
    setAccentColor
  } = useTheme();

  if (!isCustomizerOpen) return null;

  const accentOptions = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={() => setIsCustomizerOpen(false)}
    >
      <div
        style={{
          width: '360px',
          height: '100%',
          backgroundColor: 'var(--bg-card)',
          borderLeft: '1px solid var(--border-color)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: 'var(--shadow-lg)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Theme Customizer</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Customize UI appearance & style</p>
          </div>
          <button className="btn-icon" onClick={() => setIsCustomizerOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Theme Mode Option */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>Theme Mode</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={() => setTheme('light')}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${theme === 'light' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              <Sun size={24} color="#f59e0b" /> Light Mode
            </button>

            <button
              onClick={() => setTheme('dark')}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${theme === 'dark' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              <Moon size={24} color="#3b82f6" /> Dark Mode
            </button>
          </div>
        </div>

        {/* Primary Accent Color Options */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>Accent Color</h4>
          <div style={{ display: 'flex', gap: '12px' }}>
            {accentOptions.map((col) => (
              <button
                key={col}
                onClick={() => {
                  setAccentColor(col);
                  document.documentElement.style.setProperty('--accent-primary', col);
                }}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: col,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                {accentColor === col && <Check size={18} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
