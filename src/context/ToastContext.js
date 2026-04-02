/**
 * Toast Notification Context
 * Provides a global toast notification system.
 * Toasts auto-dismiss after 4 seconds and can be manually closed.
 */
import React, { createContext, useContext, useReducer, useCallback } from 'react';

// ─── State Shape ────────────────────────────────────────────────────────────
const initialState = {
  toasts: [],
};

// ─── Action Types ────────────────────────────────────────────────────────────
const TOAST_ACTIONS = {
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
const toastReducer = (state, action) => {
  switch (action.type) {
    case TOAST_ACTIONS.ADD_TOAST:
      return { toasts: [...state.toasts, action.payload] };
    case TOAST_ACTIONS.REMOVE_TOAST:
      return { toasts: state.toasts.filter((t) => t.id !== action.payload) };
    default:
      return state;
  }
};

// ─── Context ─────────────────────────────────────────────────────────────────
export const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, initialState);

  const removeToast = useCallback((id) => {
    dispatch({ type: TOAST_ACTIONS.REMOVE_TOAST, payload: id });
  }, []);

  /**
   * Show a toast notification
   * @param {string} message - Toast message
   * @param {'success'|'error'|'info'|'warning'} [type='info'] - Toast type
   * @param {number} [duration=4000] - Auto-dismiss duration in ms (0 = no auto-dismiss)
   */
  const showToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const toast = { id, message, type, duration };
      dispatch({ type: TOAST_ACTIONS.ADD_TOAST, payload: toast });

      if (duration > 0) {
        setTimeout(() => {
          dispatch({ type: TOAST_ACTIONS.REMOVE_TOAST, payload: id });
        }, duration);
      }

      return id;
    },
    []
  );

  const showSuccess = useCallback(
    (message, duration) => showToast(message, 'success', duration),
    [showToast]
  );

  const showError = useCallback(
    (message, duration) => showToast(message, 'error', duration),
    [showToast]
  );

  const showInfo = useCallback(
    (message, duration) => showToast(message, 'info', duration),
    [showToast]
  );

  const showWarning = useCallback(
    (message, duration) => showToast(message, 'warning', duration),
    [showToast]
  );

  const value = {
    toasts: state.toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeToast,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
