import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'project' | 'kanban'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.('(max-width: 900px)').matches);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [accentColor, setAccentColor] = useState('#2563eb');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(max-width: 900px)');
    const update = () => { setIsMobile(media.matches); setIsMobileSidebarOpen(false); };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isMobile || !isMobileSidebarOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const escape = event => { if (event.key === 'Escape') closeMobileSidebar(); };
    window.addEventListener('keydown', escape);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', escape); };
  }, [isMobile, isMobileSidebarOpen]);

  const toggleSidebar = () => {
    if (isMobile) { setIsMobileSidebarOpen(open => !open); return; }
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        activeTab,
        setActiveTab,
        isSidebarCollapsed,
        isMobile, isMobileSidebarOpen, closeMobileSidebar,
        toggleSidebar,
        isCustomizerOpen,
        setIsCustomizerOpen,
        accentColor,
        setAccentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
