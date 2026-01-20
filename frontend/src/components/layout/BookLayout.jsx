/**
 * Book Layout - Main wrapper for the application
 * Creates a book-like reading experience with sidebar navigation
 * Enhanced with premium animations and visual polish
 */

import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Building2,
  FileText,
  Sparkles,
  Library,
  Languages,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import { checkHealth } from '../../services/api';
import * as api from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

const navigation = [
  { path: '/', label: 'Cover', icon: BookOpen, pageNum: null, accent: 'setu' },
  { path: '/clusters', label: 'Clusters', icon: Building2, pageNum: '1', accent: 'setu' },
  { path: '/manuals', label: 'Manuals', icon: FileText, pageNum: '2', accent: 'warm' },
  { path: '/generate', label: 'Generate', icon: Sparkles, pageNum: '3', accent: 'teal' },
  { path: '/library', label: 'Library', icon: Library, pageNum: '4', accent: 'success' },
  { path: '/translate', label: 'Translate', icon: Languages, pageNum: '5', accent: 'indigo' },
];

export default function BookLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const location = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();

  // Check API health
  useEffect(() => {
    const checkApi = async () => {
      try {
        await checkHealth();
        setApiStatus('connected');
      } catch (e) {
        setApiStatus('disconnected');
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    api.auth.logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--paper-200)' }}>
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Fixed position, non-scrollable */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-64 transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ 
          background: 'linear-gradient(180deg, var(--paper-50) 0%, var(--paper-100) 100%)',
          borderRight: '1px solid var(--border-color)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.2)',
          height: '100vh',
          overflowY: 'hidden',
        }}
      >
        {/* Accent edge */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: 'var(--gradient-setu)' }}
        />
        
        <div className="h-full flex flex-col overflow-hidden">
          {/* Logo/Title with glow animation */}
          <div className="p-6 relative" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="w-10 h-10 rounded-lg flex items-center justify-center relative"
                style={{ background: 'var(--gradient-setu)' }}
                whileHover={{ scale: 1.05, rotate: 3 }}
              >
                <BookOpen className="w-5 h-5" style={{ color: 'var(--paper-300)' }} />
                {/* Glow effect */}
                <div 
                  className="absolute inset-0 rounded-lg opacity-60"
                  style={{ 
                    boxShadow: '0 0 25px var(--setu-500)',
                    pointerEvents: 'none',
                  }}
                />
              </motion.div>
              <div>
                <h1 
                  className="font-serif text-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--ink-800) 0%, var(--setu-500) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Shiksha-Setu
                </h1>
                <p className="text-xs" style={{ color: 'var(--ink-400)' }}>Teacher Training Platform</p>
              </div>
            </motion.div>
          </div>

          {/* Navigation with enhanced active states */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            <p className="text-xs uppercase tracking-wider mb-3 px-3" style={{ color: 'var(--ink-300)' }}>
              Table of Contents
            </p>
            {navigation.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-link group relative ${isActive ? 'active' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator bar */}
                    {isActive && (
                      <motion.div
                        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r"
                        style={{ background: `var(--${item.accent}-500)` }}
                        layoutId="activeNav"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    <motion.div
                      whileHover={{ scale: 1.02, x: 2 }}
                      className="flex items-center gap-3 w-full"
                    >
                      <item.icon 
                        className="w-5 h-5 nav-icon transition-colors" 
                        style={{ color: isActive ? `var(--${item.accent}-500)` : undefined }}
                      />
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight 
                        className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" 
                        style={{ color: 'var(--ink-300)' }} 
                      />
                    </motion.div>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer section */}
          <div className="p-4 space-y-3" style={{ borderTop: '1px solid var(--paper-200)' }}>
            {/* Settings Section */}
            <div className="relative">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-opacity-50"
                style={{ 
                  backgroundColor: settingsOpen ? 'var(--paper-100)' : 'transparent',
                  color: 'var(--ink-400)',
                }}
              >
                <Settings className="w-5 h-5" />
                <span className="flex-1 text-left">Settings</span>
                <ChevronRight 
                  className={`w-4 h-4 transition-transform duration-200 ${settingsOpen ? 'rotate-90' : ''}`}
                  style={{ color: 'var(--ink-300)' }}
                />
              </button>
              
              {/* Settings Dropdown */}
              <AnimatePresence>
                {settingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--paper-100)' }}>
                      {/* Theme Toggle */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isDark ? (
                            <Moon className="w-4 h-4" style={{ color: 'var(--setu-500)' }} />
                          ) : (
                            <Sun className="w-4 h-4" style={{ color: 'var(--warm-500)' }} />
                          )}
                          <span className="text-sm" style={{ color: 'var(--ink-500)' }}>
                            {isDark ? 'Dark Mode' : 'Light Mode'}
                          </span>
                        </div>
                        <button
                          onClick={toggleTheme}
                          className="relative w-12 h-6 rounded-full transition-colors duration-300"
                          style={{
                            backgroundColor: isDark ? 'var(--setu-500)' : 'var(--ink-200)',
                          }}
                          aria-label="Toggle theme"
                        >
                          <motion.div
                            className="absolute top-1 w-4 h-4 rounded-full"
                            style={{ backgroundColor: 'white' }}
                            animate={{ left: isDark ? '26px' : '4px' }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                      
                      {/* Theme Description */}
                      <p className="mt-2 text-xs" style={{ color: 'var(--ink-400)' }}>
                        {isDark 
                          ? 'Switch to light mode for a classic paper look'
                          : 'Switch to dark mode for reduced eye strain'
                        }
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-opacity-50"
              style={{ 
                backgroundColor: 'transparent',
                color: 'var(--ink-400)',
              }}
            >
              <LogOut className="w-5 h-5" />
              <span className="flex-1 text-left">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content - offset for fixed sidebar */}
      <main className="flex-1 min-w-0 lg:ml-64">
        {/* Mobile header with glass effect */}
        <header 
          className="lg:hidden sticky top-0 z-30 px-4 py-3 backdrop-blur-md"
          style={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div className="flex items-center justify-between">
            <motion.button
              onClick={() => setSidebarOpen(true)}
              className="btn btn-ghost btn-icon"
              aria-label="Open menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="w-5 h-5" />
            </motion.button>
            <h1 
              className="font-serif text-lg"
              style={{ 
                background: 'linear-gradient(135deg, var(--ink-800) 0%, var(--setu-500) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Shiksha-Setu
            </h1>
            {/* Mobile Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="btn btn-ghost btn-icon"
              aria-label="Toggle theme"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDark ? (
                <Sun className="w-5 h-5" style={{ color: 'var(--warm-500)' }} />
              ) : (
                <Moon className="w-5 h-5" style={{ color: 'var(--setu-500)' }} />
              )}
            </motion.button>
          </div>
        </header>

        {/* Page content with smooth transitions */}
        <div className="book-container">
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
