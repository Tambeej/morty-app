/**
 * Authentication service module.
 * Handles all auth-related API calls: register, login, logout, refresh, profile.
 */
import api from './api';
import { setStoredToken, setStoredRefreshToken, clearStoredTokens } from '../utils/storage';

/**
 * Register a new user
 * @param {Object} data - { email, password, fullName, phone }
 * @returns {Promise<{token, refreshToken, user}>}
 */
export const register = async (data) => {
  const response = await api.post('/auth/register', data);
  const { token, refreshToken, user } = response.data;
  setStoredToken(token);
  setStoredRefreshToken(refreshToken);
  return { token, refreshToken, user };
};

/**
 * Login an existing user
 * @param {Object} data - { email, password }
 * @returns {Promise<{token, refreshToken, user}>}
 */
export const login = async (data) => {
  const response = await api.post('/auth/login', data);
  const { token, refreshToken, user } = response.data;
  setStoredToken(token);
  setStoredRefreshToken(refreshToken);
  return { token, refreshToken, user };
};

/**
 * Logout the current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    // Ignore errors on logout — clear tokens regardless
    console.warn('Logout API call failed:', err.message);
  } finally {
    clearStoredTokens();
  }
};

/**
 * Refresh the access token using the stored refresh token
 * @param {string} refreshToken
 * @returns {Promise<{token, refreshToken}>}
 */
export const refreshAccessToken = async (refreshToken) => {
  const response = await api.post('/auth/refresh', { refreshToken });
  const { token, refreshToken: newRefreshToken } = response.data;
  setStoredToken(token);
  setStoredRefreshToken(newRefreshToken);
  return { token, refreshToken: newRefreshToken };
};

/**
 * Get the current authenticated user's profile
 * @returns {Promise<{user}>}
 */
export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data.user;
};
