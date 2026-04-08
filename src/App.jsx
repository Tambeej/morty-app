import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';
import Spinner from './components/common/Spinner.jsx';

// Lazy-loaded pages
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const FinancialProfilePage = lazy(() => import('./pages/FinancialProfilePage.jsx'));
const UploadPage = lazy(() => import('./pages/UploadPage.jsx'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage.jsx'));

/**
 * Full-page loading fallback shown during lazy-load
 */
function PageLoader() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

/**
 * Root application component.
 * Provides auth context, routing, and global toast notifications.
 */
export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
  
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<FinancialProfilePage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/analysis/:id" element={<AnalysisPage />} />
            </Route>
  
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </AuthProvider>
  );
}
