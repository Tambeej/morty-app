/**
 * Authentication Context
 * Provides auth state and actions throughout the app
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../services/api';

// Auth State
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action Types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  RESTORE_SESSION: 'RESTORE_SESSION',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
};

/**
 * Auth Reducer
 */
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return { ...state, isLoading: true, error: null };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case AUTH_ACTIONS.RESTORE_SESSION:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

// Create Context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('morty_token');
    const userStr = localStorage.getItem('morty_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch({
          type: AUTH_ACTIONS.RESTORE_SESSION,
          payload: { user, token },
        });
      } catch {
        localStorage.removeItem('morty_token');
        localStorage.removeItem('morty_user');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  /**
   * Login action
   */
  const login = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const response = await apiLogin(credentials);
      const { token, refreshToken, user } = response.data;

      localStorage.setItem('morty_token', token);
      localStorage.setItem('morty_refresh_token', refreshToken);
      localStorage.setItem('morty_user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Login failed. Please try again.';
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: message });
      return { success: false, error: message };
    }
  }, []);

  /**
   * Register action
   */
  const register = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    try {
      const response = await apiRegister(userData);
      const { token, refreshToken, user } = response.data;

      localStorage.setItem('morty_token', token);
      localStorage.setItem('morty_refresh_token', refreshToken);
      localStorage.setItem('morty_user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Registration failed. Please try again.';
      dispatch({ type: AUTH_ACTIONS.REGISTER_FAILURE, payload: message });
      return { success: false, error: message };
    }
  }, []);

  /**
   * Logout action
   */
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore logout API errors
    } finally {
      localStorage.removeItem('morty_token');
      localStorage.removeItem('morty_refresh_token');
      localStorage.removeItem('morty_user');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth hook
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
