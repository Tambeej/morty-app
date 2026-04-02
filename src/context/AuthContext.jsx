import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('morty_access_token');
        const storedUser = localStorage.getItem('morty_user');
        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          try {
            const freshUser = await authService.getProfile();
            setUser(freshUser);
            localStorage.setItem('morty_user', JSON.stringify(freshUser));
          } catch {
            try {
              await authService.refreshToken();
              const freshUser = await authService.getProfile();
              setUser(freshUser);
              localStorage.setItem('morty_user', JSON.stringify(freshUser));
            } catch {
              clearAuthState();
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        clearAuthState();
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const clearAuthState = useCallback(() => {
    setUser(null);
    localStorage.removeItem('morty_access_token');
    localStorage.removeItem('morty_refresh_token');
    localStorage.removeItem('morty_user');
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    setIsLoading(true);
    try {
      const { token, refreshToken, user: loggedInUser } = await authService.login(email, password);
      localStorage.setItem('morty_access_token', token);
      localStorage.setItem('morty_refresh_token', refreshToken);
      localStorage.setItem('morty_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setError(null);
    setIsLoading(true);
    try {
      const { token, refreshToken, user: newUser } = await authService.register(userData);
      localStorage.setItem('morty_access_token', token);
      localStorage.setItem('morty_refresh_token', refreshToken);
      localStorage.setItem('morty_user', JSON.stringify(newUser));
      setUser(newUser);
      return newUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      clearAuthState();
    }
  }, [clearAuthState]);

  const updateUser = useCallback((updatedUser) => {
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    localStorage.setItem('morty_user', JSON.stringify(merged));
  }, [user]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError: () => setError(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
