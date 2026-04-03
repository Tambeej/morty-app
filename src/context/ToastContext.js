/**
 * Toast Notification Context
 *
 * Provides toast notifications throughout the app.
 * Aligned with Firestore migration — no data shape changes needed.
 *
 * Exposes:
 *   toasts         — array of active toast objects
 *   addToast       — low-level: addToast(message, type, duration)
 *   removeToast    — remove by id
 *   showSuccess    — convenience: showSuccess(message, duration?)
 *   showError      — convenience: showError(message, duration?)
 *   showInfo       — convenience: showInfo(message, duration?)
 *   showWarning    — convenience: showWarning(message, duration?)
 *   toast          — legacy object: { success, error, info, warning }
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

/**
 * ToastProvider — wraps the app and manages toast notification state.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /**
   * Add a toast notification.
   * @param {string} message - The message to display.
   * @param {'success'|'error'|'info'|'warning'} type - Toast type.
   * @param {number} duration - Auto-dismiss duration in ms (0 = no auto-dismiss).
   * @returns {number} Toast ID
   */
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  /**
   * Remove a toast by ID.
   * @param {number} id
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Convenience methods ───────────────────────────────────────────────────

  /**
   * Show a success toast.
   * @param {string} message
   * @param {number} [duration=4000]
   * @returns {number} Toast ID
   */
  const showSuccess = useCallback(
    (message, duration = 4000) => addToast(message, 'success', duration),
    [addToast]
  );

  /**
   * Show an error toast.
   * @param {string} message
   * @param {number} [duration=4000]
   * @returns {number} Toast ID
   */
  const showError = useCallback(
    (message, duration = 4000) => addToast(message, 'error', duration),
    [addToast]
  );

  /**
   * Show an info toast.
   * @param {string} message
   * @param {number} [duration=4000]
   * @returns {number} Toast ID
   */
  const showInfo = useCallback(
    (message, duration = 4000) => addToast(message, 'info', duration),
    [addToast]
  );

  /**
   * Show a warning toast.
   * @param {string} message
   * @param {number} [duration=4000]
   * @returns {number} Toast ID
   */
  const showWarning = useCallback(
    (message, duration = 4000) => addToast(message, 'warning', duration),
    [addToast]
  );

  // ── Legacy toast object (backward-compat) ─────────────────────────────────
  const toast = {
    success: showSuccess,
    error: showError,
    info: showInfo,
    warning: showWarning,
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        toast,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

/**
 * useToast hook — access toast state and actions.
 * Must be used inside <ToastProvider>.
 *
 * @returns {{
 *   toasts: Array<{id: number, message: string, type: string, duration: number}>,
 *   addToast: function,
 *   removeToast: function,
 *   showSuccess: function,
 *   showError: function,
 *   showInfo: function,
 *   showWarning: function,
 *   toast: object,
 * }}
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
