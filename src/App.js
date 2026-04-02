/**
 * App.js - Root application component
 * Sets up routing, context providers, and global layout.
 * All context providers are nested here to provide global state.
 */
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { FinancialProvider } from './context/FinancialContext';
import { OffersProvider } from './context/OffersContext';
import { AnalysisProvider } from './context/AnalysisContext';
import { DashboardProvider } from './context/DashboardContext';
import ToastContainer from './components/common/ToastContainer';
import Spinner from './components/common/Spinner';

// Lazy-load pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const FinancialProfilePage = lazy(() => import('./pages/FinancialProfilePage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'));

/**
 * Full-page loading spinner shown during lazy-load
 */
const PageLoader = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#0f172a',
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <Spinner size={48} />
      <p style={{ color: '#94a3b8', marginTop: '16px', fontFamily: 'Inter, system-ui' }}>
        Loading Morty...
      </p>
    </div>
  </div>
);

/**
 * ProtectedRoute - Redirects to login if not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

/**
 * PublicRoute - Redirects to dashboard if already authenticated
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

/**
 * AppRoutes - Defines all application routes
 */
const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <FinancialProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analysis/:id"
        element={
          <ProtectedRoute>
            <AnalysisPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analysis"
        element={
          <ProtectedRoute>
            <AnalysisPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>
);

/**
 * AuthenticatedProviders - Providers that require auth context
 * Nested inside AuthProvider so they can access auth state.
 */
const AuthenticatedProviders = ({ children }) => (
  <FinancialProvider>
    <OffersProvider>
      <AnalysisProvider>
        <DashboardProvider>{children}</DashboardProvider>
      </AnalysisProvider>
    </OffersProvider>
  </FinancialProvider>
);

/**
 * App - Root component
 * Provider order: Toast → Auth → Data providers → Router → Routes
 */
const App = () => (
  <ToastProvider>
    <AuthProvider>
      <AuthenticatedProviders>
        <Router>
          <AppRoutes />
          <ToastContainer />
        </Router>
      </AuthenticatedProviders>
    </AuthProvider>
  </ToastProvider>
);

export default App;
