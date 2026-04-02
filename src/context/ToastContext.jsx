/**
 * ToastContext - Unified toast notification system.
 * Provides addToast / removeToast via context.
 * Use the useToast() hook to access these functions.
 */
import React, { createContext, useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const ToastContext = createContext(null);

let toastIdCounter = 0;

/**
 * ToastProvider wraps the app and manages toast state.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /**
   * Add a new toast notification.
   * @param {string} message - The message to display.
   * @param {'success'|'error'|'info'|'warning'} type - Toast type.
   * @param {number} duration - Auto-dismiss duration in ms (default 4000).
   */
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  /**
   * Remove a toast by id.
   * @param {number} id
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * useToast hook - access addToast and removeToast.
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

/* ─── Toast Container ─────────────────────────────────────────── */

function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed top-4 right-4 z-50 flex flex-col gap-3"
      style={{ minWidth: '320px', maxWidth: '400px' }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

ToastContainer.propTypes = {
  toasts: PropTypes.array.isRequired,
  removeToast: PropTypes.func.isRequired,
};

/* ─── Individual Toast Item ───────────────────────────────────── */

const TOAST_STYLES = {
  success: {
    border: '1px solid #334155',
    borderLeft: '4px solid #10b981',
    icon: (
      <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    border: '1px solid #334155',
    borderLeft: '4px solid #ef4444',
    icon: (
      <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  warning: {
    border: '1px solid #334155',
    borderLeft: '4px solid #f59e0b',
    icon: (
      <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  info: {
    border: '1px solid #334155',
    borderLeft: '4px solid #3b82f6',
    icon: (
      <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

function ToastItem({ toast, onClose }) {
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg p-4 shadow-lg"
      style={{
        background: '#1e293b',
        border: style.border,
        borderLeft: style.borderLeft,
        borderRadius: '8px',
        animation: 'pageEnter 200ms ease-out',
      }}
    >
      {style.icon}
      <p className="flex-1 text-sm" style={{ color: '#f8fafc' }}>
        {toast.message}
      </p>
      <button
        onClick={onClose}
        aria-label="Close notification"
        className="flex-shrink-0 ml-2 transition-colors"
        style={{ color: '#64748b' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#f8fafc')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

ToastItem.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'info', 'warning']).isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ToastContext;
