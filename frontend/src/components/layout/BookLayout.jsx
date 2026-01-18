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
} from 'lucide-react';
import { checkHealth } from '../../services/api';
import * as api from '../../services/api';

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
  const [apiStatus, setApiStatus] = useState('checking');
  const location = useLocation();

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
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--paper-100)' }}>
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(20, 18, 16, 0.3)' }}
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - styled like a book spine */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 transform transition-transform duration-300 ease-out
          lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ 
          background: 'linear-gradient(135deg, var(--paper-50) 0%, rgba(251, 248, 241, 0.98) 100%)',
          borderRight: '1px solid var(--paper-200)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.03)',
        }}
      >
        {/* Book spine accent */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: 'var(--gradient-setu)' }}
        />
        
        <div className="h-full flex flex-col">
          {/* Logo/Title with pulse animation */}
          <div className="p-6 relative" style={{ borderBottom: '1px solid var(--paper-200)' }}>
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
                <BookOpen className="w-5 h-5 text-white" />
                {/* Subtle glow */}
                <div 
                  className="absolute inset-0 rounded-lg opacity-50"
                  style={{ 
                    boxShadow: '0 0 20px var(--setu-400)',
                    pointerEvents: 'none',
                  }}
                />
              </motion.div>
              <div>
                <h1 
                  className="font-serif text-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--ink-800) 0%, var(--setu-700) 100%)',
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
          <nav className="flex-1 p-4 space-y-1">
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
                        style={{ color: isActive ? `var(--${item.accent}-600)` : undefined }}
                      />
                      <span className="flex-1">{item.label}</span>
                      {item.pageNum && (
                        <span 
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ 
                            color: isActive ? `var(--${item.accent}-600)` : 'var(--ink-300)',
                            background: isActive ? `var(--${item.accent}-50)` : 'transparent',
                          }}
                        >
                          p.{item.pageNum}
                        </span>
                      )}
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
            {/* Logout Button */}
            <motion.button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-red-50 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Logout</span>
            </motion.button>

            {/* API Status with animation */}
            <motion.div 
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'var(--paper-100)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className={`w-2 h-2 rounded-full`}
                style={{
                  backgroundColor: apiStatus === 'connected'
                    ? 'var(--success-500)'
                    : apiStatus === 'disconnected'
                    ? 'var(--danger-500)'
                    : 'var(--warm-400)'
                }}
                animate={apiStatus === 'checking' ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              <span className="text-xs" style={{ color: 'var(--ink-400)' }}>
                {apiStatus === 'connected'
                  ? 'API Connected'
                  : apiStatus === 'disconnected'
                  ? 'API Disconnected'
                  : 'Checking...'}
              </span>
            </motion.div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile header with glass effect */}
        <header 
          className="lg:hidden sticky top-0 z-30 px-4 py-3 backdrop-blur-md"
          style={{ 
            backgroundColor: 'rgba(251, 248, 241, 0.9)',
            borderBottom: '1px solid var(--paper-200)',
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
                background: 'linear-gradient(135deg, var(--ink-800) 0%, var(--setu-700) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Shiksha-Setu
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
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
