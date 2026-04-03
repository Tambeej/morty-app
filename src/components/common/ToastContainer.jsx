/**
 * ToastContainer component
 * Renders all active toast notifications in the top-right corner.
 * Consumes ToastContext to display and dismiss toasts.
 */
import React from 'react';
import { useToast } from '../../context/ToastContext.jsx';

/**
 * Individual Toast item
 */
const Toast = ({ toast, onRemove }) => {
  const { id, message, type } = toast;

  const typeStyles = {
    success: {
      borderLeft: '4px solid #10b981',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            fill="#10b981"
          />
        </svg>
      ),
    },
    error: {
      borderLeft: '4px solid #ef4444',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            fill="#ef4444"
          />
        </svg>
      ),
    },
    warning: {
      borderLeft: '4px solid #f59e0b',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            fill="#f59e0b"
          />
        </svg>
      ),
    },
    info: {
      borderLeft: '4px solid #3b82f6',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            fill="#3b82f6"
          />
        </svg>
      ),
    },
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        background: '#1e293b',
        border: '1px solid #334155',
        borderLeft: style.borderLeft,
        borderRadius: '8px',
        padding: '16px',
        width: '320px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        animation: 'slideInRight 200ms ease-out',
      }}
    >
      <span style={{ flexShrink: 0, marginTop: '1px' }}>{style.icon}</span>
      <p
        style={{
          flex: 1,
          margin: 0,
          color: '#f8fafc',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          fontFamily: 'Inter, system-ui',
        }}
      >
        {message}
      </p>
      <button
        onClick={() => onRemove(id)}
        aria-label="Dismiss notification"
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#64748b',
          padding: '2px',
          lineHeight: 1,
          transition: 'color 150ms',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#f8fafc')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
        </svg>
      </button>
    </div>
  );
};

/**
 * ToastContainer - Renders all toasts in a fixed overlay
 */
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div
        aria-label="Notifications"
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <Toast toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </>
  );
};

export default ToastContainer;
