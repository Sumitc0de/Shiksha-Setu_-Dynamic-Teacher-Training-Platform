/**
 * Cover Page (Dashboard)
 * The landing page that feels like a book cover
 * Shows quick stats and invites users to "open the book"
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Building2,
  FileText,
  Sparkles,
  ArrowRight,
  Library,
  CheckCircle,
} from 'lucide-react';
import { PageTransition, FadeIn } from '../ui/PageTransition';
import { StatCard, Skeleton } from '../ui/SharedComponents';
import { getDashboardStats } from '../../services/api';

// Floating sparkle decoration
const FloatingSparkle = ({ delay = 0, x, y }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%` }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0],
      scale: [0.5, 1, 0.5],
      y: [0, -20, 0],
    }}
    transition={{
      duration: 3,
      delay,
      repeat: Infinity,
      repeatDelay: 2,
    }}
  >
    <Sparkles className="w-4 h-4 text-warm-400" style={{ color: 'var(--warm-400)' }} />
  </motion.div>
);

// Animated stat number
const AnimatedNumber = ({ value, loading }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    if (loading || value === undefined) return;
    
    let start = 0;
    const duration = 1000;
    const startTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      setDisplayValue(Math.round(value * eased));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [value, loading]);
  
  return displayValue;
};

export default function CoverPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookOpening, setIsBookOpening] = useState(true);
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadStats();
    // Book opening animation
    const timer = setTimeout(() => setIsBookOpening(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: Building2,
      title: 'Define Clusters',
      description: 'Create teacher context profiles',
      path: '/clusters',
      accent: 'setu',
    },
    {
      icon: FileText,
      title: user?.role === 'admin' ? 'Upload Manuals' : 'View Manuals',
      description: user?.role === 'admin' ? 'Add training PDFs to the system' : 'Browse available training manuals',
      path: '/manuals',
      accent: 'warm',
    },
    {
      icon: Sparkles,
      title: 'Generate Modules',
      description: 'Create AI-adapted content',
      path: '/generate',
      accent: 'teal',
    },
  ];

  const accentColors = {
    setu: { bg: 'var(--setu-50)', text: 'var(--setu-500)', border: 'var(--setu-200)', gradient: 'var(--gradient-setu)' },
    warm: { bg: 'var(--warm-50)', text: 'var(--warm-500)', border: 'var(--warm-200)', gradient: 'var(--gradient-warm-spark)' },
    teal: { bg: 'var(--teal-50)', text: 'var(--teal-500)', border: 'var(--teal-200)', gradient: 'var(--gradient-teal-spark)' },
  };

  // Book opening animation variants
  const bookCoverVariants = {
    closed: { 
      rotateY: 0,
      opacity: 1,
    },
    opening: { 
      rotateY: shouldReduceMotion ? 0 : -15,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
    },
    open: {
      rotateY: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    }
  };

  const contentRevealVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, delay: 0.3 }
    }
  };

  return (
    <PageTransition>
      <motion.div 
        className="page min-h-[calc(100vh-8rem)] relative overflow-hidden m-0"
        variants={shouldReduceMotion ? {} : bookCoverVariants}
        initial="closed"
        animate={isBookOpening ? "opening" : "open"}
        style={{ 
          perspective: '1500px',
          transformStyle: 'preserve-3d',
          marginTop: 0,
          paddingTop: '2rem',
        }}
      >
        {/* Decorative sparkles */}
        {!shouldReduceMotion && (
          <>
            <FloatingSparkle x={10} y={20} delay={0} />
            <FloatingSparkle x={85} y={15} delay={1} />
            <FloatingSparkle x={75} y={70} delay={2} />
            <FloatingSparkle x={15} y={65} delay={1.5} />
          </>
        )}
        
        {/* Cover Header */}
        <motion.div 
          className="text-center mb-12"
          variants={contentRevealVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Animated Logo */}
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 relative"
            style={{ 
              background: 'linear-gradient(135deg, var(--setu-100) 0%, var(--setu-200) 100%)',
              boxShadow: '0 4px 30px rgba(96, 165, 250, 0.3)'
            }}
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <BookOpen className="w-10 h-10" style={{ color: 'var(--setu-500)' }} />
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: '2px solid var(--setu-300)' }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          
          {/* Title with gradient */}
          <motion.h1 
            className="text-5xl md:text-6xl font-serif mb-4 tracking-tight"
            style={{ 
              background: 'linear-gradient(135deg, var(--ink-800) 0%, var(--setu-500) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Shiksha-Setu
          </motion.h1>
          
          <motion.p 
            className="text-xl max-w-lg mx-auto mb-2" 
            style={{ color: 'var(--warm-500)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            शिक्षा-सेतु
          </motion.p>
          
          <motion.p 
            className="text-lg max-w-xl mx-auto" 
            style={{ color: 'var(--ink-400)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Localized Teacher Training, Powered by AI
          </motion.p>

          <motion.div 
            className="mt-6 flex items-center justify-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <span 
              className="inline-block px-4 py-1.5 rounded-full text-sm"
              style={{ 
                background: 'var(--gradient-paper)',
                color: 'var(--ink-500)',
                border: '1px solid var(--paper-300)'
              }}
            >
              A bridge between state curricula and local teaching needs
            </span>
          </motion.div>
        </motion.div>

        {/* Stats Section with staggered animation */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Building2, value: stats?.totalClusters ?? 0, label: 'Clusters', color: 'setu' },
              { icon: FileText, value: stats?.totalManuals ?? 0, label: 'Manuals', color: 'warm' },
              { icon: Sparkles, value: stats?.totalModules ?? 0, label: 'Modules', color: 'teal' },
              { icon: CheckCircle, value: stats?.approvedModules ?? 0, label: 'Approved', color: 'success' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="card card-paper p-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -4, boxShadow: 'var(--shadow-paper-hover)' }}
              >
                <stat.icon 
                  className="w-5 h-5 mx-auto mb-2" 
                  style={{ color: `var(--${stat.color}-500)` }} 
                />
                <div className="text-2xl font-bold" style={{ color: 'var(--ink-700)' }}>
                  {loading ? (
                    <div className="skeleton h-6 w-12 mx-auto rounded" />
                  ) : (
                    <AnimatedNumber value={stat.value} loading={loading} />
                  )}
                </div>
                <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-400)' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-lg font-medium mb-4 text-center" style={{ color: 'var(--ink-600)' }}>
            Begin Your Journey
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {quickActions.map((action, index) => {
              const colors = accentColors[action.accent];
              return (
                <motion.button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="card card-paper p-6 text-left group relative overflow-hidden"
                  style={{
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                  }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  {/* Accent gradient stripe */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ background: colors.gradient }}
                  />
                  
                  <div className="flex items-start justify-between mb-3">
                    <motion.div
                      whileHover={{ rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <action.icon className="w-6 h-6" style={{ color: colors.text }} />
                    </motion.div>
                    <ArrowRight 
                      className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" 
                      style={{ color: colors.text }}
                    />
                  </div>
                  <h3 className="font-medium mb-1" style={{ color: 'var(--ink-700)' }}>{action.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--ink-500)' }}>{action.description}</p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Open Book CTA */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <motion.button
            onClick={() => navigate('/clusters')}
            className="btn btn-primary btn-lg group relative overflow-hidden"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
            <BookOpen className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Open the Book</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
          </motion.button>
          
          <motion.p 
            className="text-sm mt-4" 
            style={{ color: 'var(--ink-400)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            Turn to Page 1: Define your teacher clusters
          </motion.p>
        </motion.div>

        {/* Footer note */}
        <motion.div 
          className="mt-16 pt-8 text-center" 
          style={{ borderTop: '1px solid var(--paper-200)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <p className="text-xs" style={{ color: 'var(--ink-300)' }}>
            Designed for DIET and SCERT officials across India
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-300)' }}>
            Powered by RAG + Llama 3.3-70B
          </p>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
