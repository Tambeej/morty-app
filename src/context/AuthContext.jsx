/**
 * AuthContext - Provides authentication state and actions.
 *
 * Exposes: { user, token, loading, login, register, logout, refreshAuth }
 *
 * - login({ email, password })  → calls POST /api/v1/auth/login
 * - register({ email, password, fullName, phone }) → calls POST /api/v1/auth/register
 * - logout() → calls POST /api/v1/auth/logout, clears state
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'morty_token';
const REFRESH_KEY = 'morty_refresh_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true); // true while checking stored token

  /* ── Persist token to localStorage and axios defaults ── */
  const persistToken = useCallback((accessToken, refreshToken) => {
    if (accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      localStorage.removeItem(TOKEN_KEY);
      delete api.defaults.headers.common['Authorization'];
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_KEY);
    }
    setToken(accessToken);
  }, []);

  /* ── On mount: validate stored token ── */
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setLoading(false);
      return;
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        setToken(storedToken);
      })
      .catch(() => {
        // Token invalid — try refresh
        const refreshToken = localStorage.getItem(REFRESH_KEY);
        if (!refreshToken) {
          persistToken(null, null);
          return;
        }
        return api
          .post('/auth/refresh', { refreshToken })
          .then((res) => {
            persistToken(res.data.token, res.data.refreshToken);
            return api.get('/auth/me');
          })
          .then((res) => {
            setUser(res.data.user);
          })
          .catch(() => {
            persistToken(null, null);
          });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [persistToken]);

  /**
   * Login with email and password.
   * @param {{ email: string, password: string }} credentials
   */
  const login = useCallback(
    async ({ email, password }) => {
      const res = await api.post('/auth/login', { email, password });
      const { token: accessToken, refreshToken, user: userData } = res.data;
      persistToken(accessToken, refreshToken);
      setUser(userData);
      return res.data;
    },
    [persistToken]
  );

  /**
   * Register a new account.
   * @param {{ email: string, password: string, fullName: string, phone: string }} data
   */
  const register = useCallback(
    async ({ email, password, fullName, phone }) => {
      const res = await api.post('/auth/register', { email, password, fullName, phone });
      const { token: accessToken, refreshToken, user: userData } = res.data;
      persistToken(accessToken, refreshToken);
      setUser(userData);
      return res.data;
    },
    [persistToken]
  );

  /**
   * Logout the current user.
   */
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      persistToken(null, null);
      setUser(null);
    }
  }, [persistToken]);

  /**
   * Manually refresh the access token.
   */
  const refreshAuth = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) throw new Error('No refresh token');
    const res = await api.post('/auth/refresh', { refreshToken });
    persistToken(res.data.token, res.data.refreshToken);
    return res.data.token;
  }, [persistToken]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshAuth }),
    [user, token, loading, login, register, logout, refreshAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * useAuth hook - access auth state and actions.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;
