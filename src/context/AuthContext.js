/**
 * Authentication Context
 * Manages JWT auth state across the application
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider component
 * Wraps the app and provides auth state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('morty_token');
      const storedUser = localStorage.getItem('morty_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('[Auth] Failed to restore session:', error);
      localStorage.removeItem('morty_token');
      localStorage.removeItem('morty_user');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login user
   * @param {string} email
   * @param {string} password
   */
  const login = useCallback(async (email, password) => {
    const response = await apiLogin({ email, password });
    const { token: newToken, refreshToken, user: userData } = response.data;

    localStorage.setItem('morty_token', newToken);
    localStorage.setItem('morty_refresh_token', refreshToken);
    localStorage.setItem('morty_user', JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);

    return userData;
  }, []);

  /**
   * Register new user
   * @param {Object} userData - { email, password, fullName, phone }
   */
  const register = useCallback(async (userData) => {
    const response = await apiRegister(userData);
    const { token: newToken, refreshToken, user: newUser } = response.data;

    localStorage.setItem('morty_token', newToken);
    localStorage.setItem('morty_refresh_token', refreshToken);
    localStorage.setItem('morty_user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);

    return newUser;
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (error) {
      // Ignore logout API errors
    } finally {
      localStorage.removeItem('morty_token');
      localStorage.removeItem('morty_refresh_token');
      localStorage.removeItem('morty_user');
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
export default AuthContext;
