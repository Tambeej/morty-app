/**
 * AuthContext — canonical authentication context for Morty.
 *
 * Uses authService for all API calls, which handles:
 *   - Firestore user shape: { id: string, email, phone, verified }
 *   - Backend envelope: { data: { token, refreshToken, user } }
 *   - Token storage via storage utilities
 *
 * Exposes:
 *   user, token, isAuthenticated, isLoading, error,
 *   loginUser, registerUser, logoutUser, googleLoginUser, clearError
 *
 * Also exposes legacy aliases: login, register, logout, googleLogin, loading
 * for backward compatibility with existing components.
 *
 * Logout flow:
 *   logoutUser() → authService.logout() which:
 *     1. Calls firebase.auth().signOut() to clear Google OAuth session
 *     2. POSTs refresh token to /auth/logout to invalidate server-side
 *     3. Clears all tokens from localStorage
 *   Then dispatches LOGOUT action to reset AuthContext state.
 */
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  googleLogin as authGoogleLogin,
  normalizeUser,
} from '../services/authService';
import {
  getStoredToken,
  getStoredUser,
  clearStoredTokens,
} from '../utils/storage';

/** @type {React.Context} */
const AuthContext = createContext(null);

// ── State shape ──────────────────────────────────────────────────────────────
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// ── Action types ─────────────────────────────────────────────────────────────
const AUTH_ACTIONS = {
  AUTH_START: 'AUTH_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  LOGOUT: 'LOGOUT',
  RESTORE_SESSION: 'RESTORE_SESSION',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
};

// ── Reducer ───────────────────────────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.AUTH_START:
      return { ...state, isLoading: true, error: null };

    case AUTH_ACTIONS.AUTH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case AUTH_ACTIONS.AUTH_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return { ...initialState, isLoading: false };

    case AUTH_ACTIONS.RESTORE_SESSION:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

/**
 * AuthProvider wraps the app and provides authentication state.
 *
 * On mount, restores session from localStorage (token + normalized user).
 * All auth operations go through authService which handles Firestore shapes.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ── Restore session from localStorage on mount ──────────────────────────
  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    if (storedToken && storedUser) {
      const normalizedUser = normalizeUser(storedUser);
      dispatch({
        type: AUTH_ACTIONS.RESTORE_SESSION,
        payload: { user: normalizedUser, token: storedToken },
      });
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  /**
   * Log in with email and password.
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
   */
  const loginUser = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START });
    try {
      const { token, user } = await authLogin(credentials);
      dispatch({
        type: AUTH_ACTIONS.AUTH_SUCCESS,
        payload: { user, token },
      });
      return { success: true, user };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'שגיאה בהתחברות. נסה שוב.';
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: message });
      return { success: false, error: message };
    }
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  /**
   * Register a new account.
   * @param {{ email: string, password: string, phone?: string }} userData
   * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
   */
  const registerUser = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START });
    try {
      const { token, user } = await authRegister(userData);
      dispatch({
        type: AUTH_ACTIONS.AUTH_SUCCESS,
        payload: { user, token },
      });
      return { success: true, user };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'שגיאה בהרשמה. נסה שוב.';
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: message });
      return { success: false, error: message };
    }
  }, []);

  // ── Google Login ──────────────────────────────────────────────────────────
  /**
   * Sign in / sign up with Google via Firebase popup.
   *
   * Delegates to authService.googleLogin() which:
   *   1. Opens the Firebase Google sign-in popup.
   *   2. Exchanges the Firebase ID token for Morty custom JWTs.
   *   3. Stores tokens and user in localStorage.
   *
   * @returns {Promise<null | { success: boolean, user?: object, error?: string }>}
   */
  const googleLoginUser = useCallback(async () => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START });
    try {
      const result = await authGoogleLogin();

      // User dismissed the popup — treat as a silent no-op.
      if (result === null) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return null;
      }

      const { token, user } = result;
      dispatch({
        type: AUTH_ACTIONS.AUTH_SUCCESS,
        payload: { user, token },
      });
      return { success: true, user };
    } catch (err) {
      const message =
        err?.code === 'auth/popup-blocked'
          ? 'Enable popups for this site to use Google sign-in'
          : err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            'Google sign-in failed. Please try again.';
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: message });
      return { success: false, error: message };
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  /**
   * Log out and clear all stored credentials.
   *
   * Delegates to authService.logout() which performs a full sign-out:
   *   1. Firebase signOut() — clears Google OAuth session (safe no-op for
   *      email/password users with no Firebase session).
   *   2. Backend POST /auth/logout — invalidates the refresh token server-side.
   *   3. localStorage cleanup — clears all tokens regardless of API result.
   *
   * After authService.logout() completes (or fails), the LOGOUT action is
   * dispatched to reset AuthContext state to the initial unauthenticated state.
   *
   * @returns {Promise<void>}
   */
  const logoutUser = useCallback(async () => {
    try {
      await authLogout();
    } catch (err) {
      // authLogout handles errors internally and always clears tokens.
      // This catch is a safety net for unexpected throws.
      console.warn('[AuthContext] logoutUser caught unexpected error:', err?.message || err);
      clearStoredTokens();
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  // ── Clear error ───────────────────────────────────────────────────────────
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // ── Legacy aliases (backward-compat for components using login/logout) ────
  /**
   * Legacy login alias. Accepts (email, password) or ({ email, password }).
   * @param {string|object} emailOrCredentials
   * @param {string} [password]
   */
  const login = useCallback(
    async (emailOrCredentials, password) => {
      const credentials =
        typeof emailOrCredentials === 'string'
          ? { email: emailOrCredentials, password }
          : emailOrCredentials;
      return loginUser(credentials);
    },
    [loginUser]
  );

  /** Legacy register alias */
  const register = useCallback(
    (userData) => registerUser(userData),
    [registerUser]
  );

  /** Legacy logout alias */
  const logout = useCallback(() => logoutUser(), [logoutUser]);

  /**
   * Legacy googleLogin alias — same as googleLoginUser.
   * Exposed so components can destructure `googleLogin` from useAuth().
   */
  const googleLogin = useCallback(() => googleLoginUser(), [googleLoginUser]);

  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    loading: state.isLoading, // backward-compat alias
    error: state.error,
    // Actions (new names)
    loginUser,
    registerUser,
    googleLoginUser,
    logoutUser,
    clearError,
    // Actions (legacy aliases)
    login,
    register,
    logout,
    googleLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to access authentication context.
 * Must be used inside <AuthProvider>.
 *
 * @returns {{
 *   user: object|null,
 *   token: string|null,
 *   isAuthenticated: boolean,
 *   isLoading: boolean,
 *   loading: boolean,
 *   error: string|null,
 *   loginUser: function,
 *   registerUser: function,
 *   googleLoginUser: function,
 *   logoutUser: function,
 *   clearError: function,
 *   login: function,
 *   register: function,
 *   logout: function,
 *   googleLogin: function,
 * }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;
