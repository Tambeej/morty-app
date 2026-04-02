import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { apiService } from '../services/api.js';

/** @type {React.Context} */
const AuthContext = createContext(null);

/**
 * AuthProvider wraps the app and provides authentication state.
 * Stores JWT access token in memory and refresh token in localStorage.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  /** Restore session from localStorage on mount */
  useEffect(() => {
    const storedToken = localStorage.getItem('morty_token');
    const storedUser = localStorage.getItem('morty_user');
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        apiService.setAuthToken(storedToken);
      } catch {
        localStorage.removeItem('morty_token');
        localStorage.removeItem('morty_user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Log in with email and password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user: object}>}
   */
  const login = useCallback(async (email, password) => {
    const data = await apiService.login(email, password);
    const { token: accessToken, refreshToken, user: userData } = data;
    setToken(accessToken);
    setUser(userData);
    apiService.setAuthToken(accessToken);
    localStorage.setItem('morty_token', accessToken);
    localStorage.setItem('morty_refresh_token', refreshToken);
    localStorage.setItem('morty_user', JSON.stringify(userData));
    return { user: userData };
  }, []);

  /**
   * Register a new account.
   * @param {object} userData - { name, email, phone, password }
   * @returns {Promise<{user: object}>}
   */
  const register = useCallback(async (userData) => {
    const data = await apiService.register(userData);
    const { token: accessToken, refreshToken, user: newUser } = data;
    setToken(accessToken);
    setUser(newUser);
    apiService.setAuthToken(accessToken);
    localStorage.setItem('morty_token', accessToken);
    localStorage.setItem('morty_refresh_token', refreshToken);
    localStorage.setItem('morty_user', JSON.stringify(newUser));
    return { user: newUser };
  }, []);

  /** Log out and clear all stored credentials */
  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch {
      // Ignore logout API errors — clear local state regardless
    } finally {
      setToken(null);
      setUser(null);
      apiService.setAuthToken(null);
      localStorage.removeItem('morty_token');
      localStorage.removeItem('morty_refresh_token');
      localStorage.removeItem('morty_user');
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Hook to access authentication context.
 * Must be used inside <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
