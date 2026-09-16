import React, { useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { authStorage } from '../../services/api';
import { Spinner } from '../ui/Spinner';
import {
  Search,
  Bell,
  Palette,
  Sun,
  Moon,
  PanelLeft,
  Globe,
  LogOut,
  ChevronDown
} from 'lucide-react';

export const Header = ({ onLogout }) => {
  const {
    theme,
    toggleTheme,
    toggleSidebar,
    isSidebarCollapsed,
    setIsCustomizerOpen
  } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const loggingOutRef = useRef(false);
  const currentUser = authStorage.getUser();

  const handleLogout = async () => {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;
    setIsLoggingOut(true);
    setIsUserMenuOpen(false);
    try {
      await onLogout();
    } finally {
      loggingOutRef.current = false;
      setIsLoggingOut(false);
    }
  };

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
        <div style={{ position: 'relative', marginLeft: '8px' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            onClick={() => setIsUserMenuOpen((open) => !open)}
          >
            <div style={{ position: 'relative' }}>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="Profile"
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
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {(currentUser && currentUser.name) || 'Admin'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {(currentUser && currentUser.role) || 'Administrator'}
              </span>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>

          {isUserMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                width: '200px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                border: '1px solid var(--border-color)',
                zIndex: 200,
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{(currentUser && currentUser.name) || 'Admin'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(currentUser && currentUser.email) || 'admin@school.com'}</div>
              </div>
              {onLogout && (
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: 'transparent',
                    color: '#ef4444',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: isLoggingOut ? 'default' : 'pointer'
                  }}
                >
                  {isLoggingOut ? <Spinner size={16} color="#ef4444" /> : <LogOut size={16} />} {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
