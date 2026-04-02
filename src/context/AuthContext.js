import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * AuthContext — provides authentication state and actions throughout the app.
 */
export const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app and manages JWT auth state.
 * Stores access token in memory, refresh token in localStorage.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('morty_token') || null);
  const [loading, setLoading] = useState(true);

  // Set axios default auth header whenever token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('morty_token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('morty_token');
    }
  }, [token]);

  // On mount: verify token and load user
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data?.user || null);
      } catch (err) {
        // Token invalid or expired — try refresh
        const refreshToken = localStorage.getItem('morty_refresh_token');
        if (refreshToken) {
          try {
            const refreshRes = await api.post('/auth/refresh', { refreshToken });
            const newToken = refreshRes.data?.token;
            const newRefresh = refreshRes.data?.refreshToken;
            setToken(newToken);
            if (newRefresh) localStorage.setItem('morty_refresh_token', newRefresh);
            const meRes = await api.get('/auth/me');
            setUser(meRes.data?.user || null);
          } catch {
            // Refresh failed — clear auth
            setToken(null);
            setUser(null);
            localStorage.removeItem('morty_refresh_token');
          }
        } else {
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  /**
   * Login with email and password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user, token}>}
   */
  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, refreshToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    if (refreshToken) localStorage.setItem('morty_refresh_token', refreshToken);
    return { user: newUser, token: newToken };
  }, []);

  /**
   * Register a new account.
   * @param {object} data - { email, password, fullName, phone }
   * @returns {Promise<{user, token}>}
   */
  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', data);
    const { token: newToken, refreshToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    if (refreshToken) localStorage.setItem('morty_refresh_token', refreshToken);
    return { user: newUser, token: newToken };
  }, []);

  /**
   * Logout — invalidates token on server and clears local state.
   */
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('morty_refresh_token');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
