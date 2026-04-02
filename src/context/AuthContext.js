/**
 * Authentication Context
 * Provides auth state and actions throughout the application.
 * Handles login, register, logout, and session restoration.
 */
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { login, register, logout, getMe } from '../services/authService';
import { getStoredToken, getStoredUser, setStoredUser, clearStoredTokens, isAuthenticated } from '../utils/storage';
import { extractApiError } from '../utils/validators';

// ─── State Shape ────────────────────────────────────────────────────────────
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // true on initial load while restoring session
  error: null,
};

// ─── Action Types ────────────────────────────────────────────────────────────
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };
    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case AUTH_ACTIONS.UPDATE_USER:
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

// ─── Context ─────────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

/**
 * AuthProvider component
 * Wraps the app and provides auth state + actions via context.
 */
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      if (!isAuthenticated()) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      // Try to restore from localStorage first for instant UI
      const storedUser = getStoredUser();
      if (storedUser) {
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: storedUser });
      }

      // Then verify with server
      try {
        const user = await getMe();
        setStoredUser(user);
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
      } catch (err) {
        // Token invalid or expired — clear and show login
        clearStoredTokens();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    restoreSession();
  }, []);

  // Listen for forced logout events (from API interceptor)
  useEffect(() => {
    const handleForcedLogout = () => {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    };
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const loginUser = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    try {
      const { user } = await login(credentials);
      setStoredUser(user);
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
      return { success: true };
    } catch (err) {
      const message = extractApiError(err, 'Login failed. Please check your credentials.');
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  }, []);

  const registerUser = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    try {
      const { user } = await register(userData);
      setStoredUser(user);
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
      return { success: true };
    } catch (err) {
      const message = extractApiError(err, 'Registration failed. Please try again.');
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  }, []);

  const logoutUser = useCallback(async () => {
    try {
      await logout();
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  const updateUser = useCallback((updates) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: updates });
  }, []);

  const value = {
    ...state,
    loginUser,
    registerUser,
    logoutUser,
    clearError,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth hook — access auth context
 * @returns {Object} Auth state and actions
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
