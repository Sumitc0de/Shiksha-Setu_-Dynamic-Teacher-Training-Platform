/**
 * Shiksha-Setu Main Application
 * A book-like experience for teacher training management
 */

import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import BookLayout from './components/layout/BookLayout';
import { LoadingSpinner } from './components/ui/SharedComponents';

// Lazy load pages for performance
const LandingPage = lazy(() => import('./components/pages/LandingPage'));
const LoginPage = lazy(() => import('./components/pages/LoginPage'));
const AdminDashboard = lazy(() => import('./components/pages/AdminDashboard'));
const PrincipalDashboard = lazy(() => import('./components/pages/PrincipalDashboard'));
const CoverPage = lazy(() => import('./components/pages/CoverPage'));
const ClustersPage = lazy(() => import('./components/pages/ClustersPage'));
const ManualsPage = lazy(() => import('./components/pages/ManualsPage'));
const GeneratorPage = lazy(() => import('./components/pages/GeneratorPage'));
const LibraryPage = lazy(() => import('./components/pages/LibraryPage'));
const TranslationPage = lazy(() => import('./components/pages/TranslationPage'));

// Page loading fallback
function PageLoader() {
  return (
    <div className="page min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner className="mx-auto mb-4 text-setu-500" size="lg" />
        <p className="text-ink-400">Loading page...</p>
      </div>
    </div>
  );
}

// Animated routes wrapper
function AnimatedRoutes({ user, onLogout, onLoginSuccess }) {
  const location = useLocation();

  // Protected route component
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/landing" replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return children;
  };

  // Redirect to appropriate dashboard based on role
  const DashboardRedirect = () => {
    if (!user) return <Navigate to="/landing" replace />;
    
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'principal':
        return <Navigate to="/principal" replace />;
      case 'teacher':
        return <CoverPage />;
      default:
        return <Navigate to="/landing" replace />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* Landing page - shown to non-authenticated users */}
          <Route 
            path="/" 
            element={
              user ? <DashboardRedirect /> : <LandingPage />
            } 
          />
          <Route 
            path="/landing" 
            element={
              user ? <DashboardRedirect /> : <LandingPage />
            } 
          />
          <Route 
            path="/login" 
            element={
              user ? <DashboardRedirect /> : <LoginPage onLoginSuccess={onLoginSuccess} />
            } 
          />
          
          {/* Role-specific dashboards */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard user={user} onLogout={onLogout} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/principal" 
            element={
              <ProtectedRoute allowedRoles={['principal']}>
                <PrincipalDashboard user={user} onLogout={onLogout} />
              </ProtectedRoute>
            } 
          />
          
          {/* Teacher routes (default app flow) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/clusters" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <ClustersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manuals" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <ManualsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/generate" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <GeneratorPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/library" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <LibraryPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/translate" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TranslationPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (response) => {
    setUser(response.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/landing';
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        {user && user.role === 'teacher' ? (
          <BookLayout>
            <AnimatedRoutes user={user} onLogout={handleLogout} onLoginSuccess={handleLoginSuccess} />
          </BookLayout>
        ) : (
          <AnimatedRoutes user={user} onLogout={handleLogout} onLoginSuccess={handleLoginSuccess} />
        )}
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
