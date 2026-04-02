import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * Toast notification system.
 * Provides a context for showing toast messages from anywhere in the app.
 */
const ToastContext = createContext(null);

const TOAST_DURATION = 4000;

/**
 * Individual Toast notification component.
 */
const ToastItem = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const variants = {
    success: {
      borderColor: 'border-l-success',
      icon: (
        <svg className="h-5 w-5 text-success flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    error: {
      borderColor: 'border-l-error',
      icon: (
        <svg className="h-5 w-5 text-error flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    info: {
      borderColor: 'border-l-blue-500',
      icon: (
        <svg className="h-5 w-5 text-blue-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  };

  const variant = variants[toast.type] || variants.info;

  return (
    <div
      className={`flex items-start gap-3 w-80 bg-navy-surface border border-border border-l-4 ${variant.borderColor} rounded-lg p-4 shadow-lg animate-fade-in`}
      role="alert"
      aria-live="polite"
    >
      {variant.icon}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-text-primary mb-0.5">{toast.title}</p>
        )}
        <p className="text-sm text-text-secondary">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-text-muted hover:text-text-secondary transition-colors flex-shrink-0"
        aria-label="Dismiss notification"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

/**
 * ToastProvider - Wraps the app to provide toast functionality.
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ type = 'info', title, message }) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    return id;
  }, []);

  const success = useCallback(
    (message, title) => showToast({ type: 'success', title, message }),
    [showToast]
  );

  const error = useCallback(
    (message, title) => showToast({ type: 'error', title, message }),
    [showToast]
  );

  const info = useCallback(
    (message, title) => showToast({ type: 'info', title, message }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, dismiss }}>
      {children}
      {/* Toast container - top-right */}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-3"
        aria-label="Notifications"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/**
 * useToast - Hook for showing toast notifications.
 * @returns {{ success, error, info, showToast, dismiss }}
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastItem;
