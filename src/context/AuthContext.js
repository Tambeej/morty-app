import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * AuthContext - Manages authentication state across the application.
 * Stores JWT access token and refresh token in localStorage.
 * Provides login, register, logout, and token refresh functionality.
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('morty_token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('morty_refresh_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Persist tokens to localStorage and update state.
   */
  const persistTokens = useCallback((accessToken, newRefreshToken) => {
    localStorage.setItem('morty_token', accessToken);
    localStorage.setItem('morty_refresh_token', newRefreshToken);
    setToken(accessToken);
    setRefreshToken(newRefreshToken);
  }, []);

  /**
   * Clear all auth data from state and localStorage.
   */
  const clearAuth = useCallback(() => {
    localStorage.removeItem('morty_token');
    localStorage.removeItem('morty_refresh_token');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  /**
   * Fetch current user profile using stored token.
   */
  const fetchCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem('morty_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (err) {
      // Token might be expired, try refresh
      const storedRefresh = localStorage.getItem('morty_refresh_token');
      if (storedRefresh) {
        try {
          const refreshResponse = await api.post('/auth/refresh', { refreshToken: storedRefresh });
          if (refreshResponse.data.success) {
            persistTokens(refreshResponse.data.token, refreshResponse.data.refreshToken);
            const userResponse = await api.get('/auth/me');
            if (userResponse.data.success) {
              setUser(userResponse.data.user);
            }
          }
        } catch (refreshErr) {
          clearAuth();
        }
      } else {
        clearAuth();
      }
    } finally {
      setLoading(false);
    }
  }, [persistTokens, clearAuth]);

  // On mount, verify existing token
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  /**
   * Login with email and password.
   * @param {string} email
   * @param {string} password
   * @returns {Object} user data
   */
  const login = useCallback(async (email, password) => {
    setError(null);
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      persistTokens(response.data.token, response.data.refreshToken);
      setUser(response.data.user);
      return response.data.user;
    }
    throw new Error(response.data.error || 'Login failed');
  }, [persistTokens]);

  /**
   * Register a new user account.
   * @param {Object} userData - { email, password, fullName, phone }
   * @returns {Object} user data
   */
  const register = useCallback(async (userData) => {
    setError(null);
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      persistTokens(response.data.token, response.data.refreshToken);
      setUser(response.data.user);
      return response.data.user;
    }
    throw new Error(response.data.error || 'Registration failed');
  }, [persistTokens]);

  /**
   * Logout the current user.
   */
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore logout API errors, clear local state anyway
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const value = {
    user,
    token,
    refreshToken,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
