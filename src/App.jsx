import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/globals.css';
import './styles/wizard.css';

// Lazy-loaded pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const FinancialProfilePage = lazy(() => import('./pages/FinancialProfilePage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'));
const AnalysisListPage = lazy(() => import('./pages/AnalysisListPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const WizardPage = lazy(() => import('./pages/WizardPage'));
const PortfolioComparePage = lazy(() => import('./pages/PortfolioComparePage'));

// Full-page loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center animate-pulse">
          <span className="text-white font-bold">M</span>
        </div>
        <p className="text-text3 text-sm">טוען...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public wizard routes - no auth required */}
          <Route path="/wizard" element={<WizardPage />} />
          <Route path="/wizard/compare" element={<PortfolioComparePage />} />

          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected app routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<FinancialProfilePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/analysis" element={<AnalysisListPage />} />
          <Route path="/analysis/:id" element={<AnalysisPage />} />
          <Route path="/help" element={<HelpPage />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/wizard" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
