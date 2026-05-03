import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './styles/globals.css';
import './styles/wizard.css';
import './styles/portfolio.css';
import './styles/paywall.css';

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
const PaywallPage = lazy(() => import('./pages/PaywallPage'));
const PaywallSuccessPage = lazy(() => import('./pages/PaywallSuccessPage'));

import { WizardProvider } from './context/WizardContext';
import { Outlet } from 'react-router-dom';

function WizardLayout() {
  return (
      <WizardProvider>
        <Outlet />
      </WizardProvider>
  );
}

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
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>

            <Route element={<WizardLayout />}>
              <Route path="/wizard" element={<WizardPage />} />
              <Route path="/wizard/compare" element={<PortfolioComparePage />} />
            </Route>

            {/* Paywall routes - accessible after portfolio selection */}
            <Route path="/paywall" element={<PaywallPage />} />
            <Route path="/paywall/success" element={<PaywallSuccessPage />} />

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
    </AuthProvider>
  );
}


/**
 * Morty App - Main Application Component
 * Sets up routing, auth context, and toast notifications
 */
//
// import React, { Suspense, lazy } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import { ToastProvider } from './context/ToastContext';
// import ToastContainer from './components/common/Toast';
// import Spinner from './components/common/Spinner';
// import './styles/globals.css';
//
// // Lazy load pages for code splitting
// const LoginPage = lazy(() => import('./pages/LoginPage'));
// const RegisterPage = lazy(() => import('./pages/RegisterPage'));
// const DashboardPage = lazy(() => import('./pages/DashboardPage'));
// const FinancialProfilePage = lazy(() => import('./pages/FinancialProfilePage'));
// const UploadPage = lazy(() => import('./pages/UploadPage'));
// const AnalysisPage = lazy(() => import('./pages/AnalysisPage'));
//
// /**
//  * Full-page loading spinner
//  */
// const PageLoader = () => (
//     <div
//         className="min-h-screen bg-navy flex items-center justify-center"
//         role="status"
//         aria-label="Loading page"
//     >
//       <div className="flex flex-col items-center gap-4">
//         <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
//           <svg className="w-5 h-5 text-navy" fill="currentColor" viewBox="0 0 24 24">
//             <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
//           </svg>
//         </div>
//         <Spinner size="md" />
//       </div>
//     </div>
// );
//
// /**
//  * Protected Route - redirects to login if not authenticated
//  */
// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated, isLoading } = useAuth();
//
//   if (isLoading) {
//     return <PageLoader />;
//   }
//
//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }
//
//   return children;
// };
//
// /**
//  * Public Route - redirects to dashboard if already authenticated
//  */
// const PublicRoute = ({ children }) => {
//   const { isAuthenticated, isLoading } = useAuth();
//
//   if (isLoading) {
//     return <PageLoader />;
//   }
//
//   if (isAuthenticated) {
//     return <Navigate to="/dashboard" replace />;
//   }
//
//   return children;
// };
//
// /**
//  * App Routes
//  */
// const AppRoutes = () => (
//     <Suspense fallback={<PageLoader />}>
//       <Routes>
//         {/* Public Routes */}
//         <Route
//             path="/login"
//             element={
//               <PublicRoute>
//                 <LoginPage />
//               </PublicRoute>
//             }
//         />
//         <Route
//             path="/register"
//             element={
//               <PublicRoute>
//                 <RegisterPage />
//               </PublicRoute>
//             }
//         />
//
//         {/* Protected Routes */}
//         <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <DashboardPage />
//               </ProtectedRoute>
//             }
//         />
//         <Route
//             path="/profile"
//             element={
//               <ProtectedRoute>
//                 <FinancialProfilePage />
//               </ProtectedRoute>
//             }
//         />
//         <Route
//             path="/upload"
//             element={
//               <ProtectedRoute>
//                 <UploadPage />
//               </ProtectedRoute>
//             }
//         />
//         <Route
//             path="/analysis"
//             element={
//               <ProtectedRoute>
//                 <AnalysisPage />
//               </ProtectedRoute>
//             }
//         />
//         <Route
//             path="/analysis/:id"
//             element={
//               <ProtectedRoute>
//                 <AnalysisPage />
//               </ProtectedRoute>
//             }
//         />
//
//         {/* Default redirect */}
//         <Route path="/" element={<Navigate to="/dashboard" replace />} />
//         <Route path="*" element={<Navigate to="/dashboard" replace />} />
//       </Routes>
//     </Suspense>
// );
//
// /**
//  * Root App Component
//  */
// function App() {
//   return (
//       <Router>
//         <AuthProvider>
//           <ToastProvider>
//             <AppRoutes />
//             <ToastContainer />
//           </ToastProvider>
//         </AuthProvider>
//       </Router>
//   );
// }
//
// export default App;
