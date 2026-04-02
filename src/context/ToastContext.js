/**
 * ToastContext.js
 * Provides a global toast notification system.
 *
 * Exposes:
 *   addToast(message, type?)  — add a toast ('success' | 'error' | 'info' | 'warning')
 *   removeToast(id)           — manually dismiss a toast
 *
 * The ToastProvider also renders the toast UI directly so consumers only need
 * to wrap their tree once.
 */
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const ToastContext = createContext(null);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Toast item component
// ---------------------------------------------------------------------------
const ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#10b981" />
      <path d="M6 10l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#ef4444" />
      <path d="M7 7l6 6M13 7l-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#f59e0b" />
      <path d="M10 6v5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="14" r="1" fill="#fff" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#3b82f6" />
      <path d="M10 9v5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r="1" fill="#fff" />
    </svg>
  ),
};

const BORDER_COLORS = {
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

function ToastItem({ toast, onRemove }) {
  const borderColor = BORDER_COLORS[toast.type] || BORDER_COLORS.info;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        background: '#1e293b',
        border: '1px solid #334155',
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '14px 16px',
        width: '320px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        animation: 'toastIn 200ms ease-out',
        position: 'relative',
      }}
    >
      <span style={{ flexShrink: 0, marginTop: '1px' }}>{ICONS[toast.type] || ICONS.info}</span>
      <span
        style={{
          flex: 1,
          color: '#f8fafc',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          wordBreak: 'break-word',
        }}
      >
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#64748b',
          padding: '0',
          lineHeight: 1,
          flexShrink: 0,
          fontSize: '1rem',
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timerRefs = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timerRefs.current[id]) {
      clearTimeout(timerRefs.current[id]);
      delete timerRefs.current[id];
    }
  }, []);

  /**
   * Add a toast notification.
   * @param {string} message - The message to display.
   * @param {'success'|'error'|'info'|'warning'} [type='info'] - Toast type.
   * @param {number} [duration=4000] - Auto-dismiss delay in ms (0 = no auto-dismiss).
   */
  const addToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        timerRefs.current[id] = setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Toast container — rendered at root level so it floats above everything */}
      <div
        aria-label="Notifications"
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
        }}
      >
        <style>{`
          @keyframes toastIn {
            from { opacity: 0; transform: translateX(24px); }
            to   { opacity: 1; transform: translateX(0); }
          }
        `}</style>
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastContext;
