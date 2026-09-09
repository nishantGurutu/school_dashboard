import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Search,
  Bell,
  Palette,
  Sun,
  Moon,
  PanelLeft,
  Globe
} from 'lucide-react';

export const Header = () => {
  const {
    theme,
    toggleTheme,
    toggleSidebar,
    isSidebarCollapsed,
    setIsCustomizerOpen
  } = useTheme();

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: isSidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-header)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Search & Sidebar Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '480px' }}>
        <button className="btn-icon" onClick={toggleSidebar} title="Toggle Sidebar">
          <PanelLeft size={20} />
        </button>

        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            placeholder="Search student, teacher, receipt, or roll no..."
            style={{
              width: '100%',
              padding: '10px 16px 10px 42px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid transparent',
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent-primary)';
              e.target.style.backgroundColor = 'var(--bg-card)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'transparent';
              e.target.style.backgroundColor = 'var(--bg-app)';
            }}
          />
        </div>
      </div>

      {/* Right Icons & User Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Language selector */}
        <button className="btn-icon" title="Language: English">
          <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>🇬🇧</span>
        </button>

        {/* Theme mode toggle */}
        <button className="btn-icon" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Customizer Drawer button */}
        <button className="btn-icon" onClick={() => setIsCustomizerOpen(true)} title="Theme Customizer">
          <Palette size={20} />
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button className="btn-icon" title="Notifications">
            <Bell size={20} />
          </button>
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              border: '2px solid var(--bg-card)'
            }}
          />
        </div>

        {/* User Profile Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginLeft: '8px' }}>
          <div style={{ position: 'relative' }}>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              alt="Captain Profile"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--accent-primary-light)'
              }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: '1px',
                right: '1px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                border: '2px solid var(--bg-card)'
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
