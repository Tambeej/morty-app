/**
 * AuthContext.js
 * Provides authentication state and actions to the entire app.
 *
 * Exposes via useAuth():
 *   user          — current user object or null
 *   token         — JWT access token or null
 *   loading       — true while an auth request is in-flight
 *   isAuthenticated — boolean shorthand
 *   login(email, password)         — POST /auth/login
 *   register(fullName, email, phone, password) — POST /auth/register
 *   logout()                       — POST /auth/logout + clear state
 *   refreshAccessToken()           — POST /auth/refresh
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api from '../services/api';
import { extractApiError } from '../utils/validators';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const AuthContext = createContext(null);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------
const TOKEN_KEY = 'morty_access_token';
const REFRESH_KEY = 'morty_refresh_token';
const USER_KEY = 'morty_user';

function persistSession(token, refreshToken, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

function loadSession() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    return { token, refreshToken, user };
  } catch {
    return { token: null, refreshToken: null, user: null };
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }) {
  const saved = loadSession();
  const [user, setUser] = useState(saved.user || null);
  const [token, setToken] = useState(saved.token || null);
  const [refreshToken, setRefreshToken] = useState(saved.refreshToken || null);
  const [loading, setLoading] = useState(false);

  // Inject / remove Authorization header whenever token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // ------------------------------------------------------------------
  // login
  // ------------------------------------------------------------------
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { token: accessToken, refreshToken: rt, user: u } = data;
      persistSession(accessToken, rt, u);
      setToken(accessToken);
      setRefreshToken(rt);
      setUser(u);
      return { success: true };
    } catch (err) {
      return { success: false, error: extractApiError(err) };
    } finally {
      setLoading(false);
    }
  }, []);

  // ------------------------------------------------------------------
  // register
  // ------------------------------------------------------------------
  const register = useCallback(async (fullName, email, phone, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        fullName,
        email,
        phone,
        password,
      });
      const { token: accessToken, refreshToken: rt, user: u } = data;
      persistSession(accessToken, rt, u);
      setToken(accessToken);
      setRefreshToken(rt);
      setUser(u);
      return { success: true };
    } catch (err) {
      return { success: false, error: extractApiError(err) };
    } finally {
      setLoading(false);
    }
  }, []);

  // ------------------------------------------------------------------
  // logout
  // ------------------------------------------------------------------
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      if (token) {
        await api.post('/auth/logout').catch(() => {
          // Ignore server errors on logout — clear client state regardless
        });
      }
    } finally {
      clearSession();
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  // ------------------------------------------------------------------
  // refreshAccessToken
  // ------------------------------------------------------------------
  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) return null;
    try {
      const { data } = await api.post('/auth/refresh', { refreshToken });
      const { token: newToken, refreshToken: newRt } = data;
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(REFRESH_KEY, newRt);
      setToken(newToken);
      setRefreshToken(newRt);
      return newToken;
    } catch {
      // Refresh failed — force logout
      clearSession();
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      return null;
    }
  }, [refreshToken]);

  // ------------------------------------------------------------------
  // Context value — stable reference via useMemo
  // ------------------------------------------------------------------
  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshAccessToken,
    }),
    [user, token, loading, login, register, logout, refreshAccessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
