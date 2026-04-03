/**
 * Toast Notification Component
 *
 * Exports:
 *   - default: ToastContainer (renders all active toasts)
 *   - ToastProvider: re-exported from ToastContext for test convenience
 *
 * Tests import ToastProvider from this file:
 *   import { ToastProvider } from '../components/common/Toast';
 */

import React from 'react';
import { useToast, ToastProvider } from '../../context/ToastContext';

// Re-export ToastProvider so tests can import it from this file
export { ToastProvider };

/**
 * Individual Toast Item
 */
const ToastItem = ({ toast, onRemove }) => {
  const icons = {
    success: (
      <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  };

  const borderColors = {
    success: 'border-l-success',
    error: 'border-l-error',
    info: 'border-l-blue-400',
    warning: 'border-l-warning',
  };

  return (
    <div
      className={`
        flex items-start gap-3 w-80 bg-navy-surface border border-border
        border-l-4 ${borderColors[toast.type] || borderColors.info} rounded-lg p-4 shadow-lg
        animate-fade-in
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type] || icons.info}</div>
      <p className="flex-1 text-sm text-[#f8fafc]">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-[#64748b] hover:text-[#94a3b8] transition-colors"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

/**
 * Toast Container — renders all active toasts in the top-right corner.
 * Consumes ToastContext to display and dismiss toasts.
 */
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
