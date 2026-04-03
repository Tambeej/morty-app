/**
 * Authentication service module.
 *
 * Handles all auth-related API calls: register, login, logout, refresh, getMe.
 * Normalizes the user shape from Firestore backend (string `id`, no `_id`).
 * Stores tokens and user in localStorage via storage utilities.
 */
import api from './api';
import {
  setStoredToken,
  setStoredRefreshToken,
  setStoredUser,
  clearStoredTokens,
  getStoredRefreshToken,
} from '../utils/storage';

/**
 * Normalize user object from backend response.
 * Provides backward-compat shim: prefers `id` (Firestore string), falls back to `_id`.
 * @param {object} user - Raw user from API
 * @returns {object} Normalized user
 */
export const normalizeUser = (user) => ({
  id: user.id || user._id || '',
  email: user.email || '',
  phone: user.phone || '',
  verified: user.verified || false,
});

/**
 * Register a new user.
 * @param {{ email: string, password: string, phone?: string }} data
 * @returns {Promise<{ token: string, refreshToken: string, user: object }>}
 */
export const register = async (data) => {
  const response = await api.post('/auth/register', data);
  // Backend envelope: { data: { token, refreshToken, user }, message? }
  const payload = response.data?.data || response.data;
  const { token, refreshToken, user } = payload;
  const normalizedUser = normalizeUser(user);
  setStoredToken(token);
  setStoredRefreshToken(refreshToken);
  setStoredUser(normalizedUser);
  return { token, refreshToken, user: normalizedUser };
};

/**
 * Login an existing user.
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ token: string, refreshToken: string, user: object }>}
 */
export const login = async (data) => {
  const response = await api.post('/auth/login', data);
  // Backend envelope: { data: { token, refreshToken, user }, message? }
  const payload = response.data?.data || response.data;
  const { token, refreshToken, user } = payload;
  const normalizedUser = normalizeUser(user);
  setStoredToken(token);
  setStoredRefreshToken(refreshToken);
  setStoredUser(normalizedUser);
  return { token, refreshToken, user: normalizedUser };
};

/**
 * Logout the current user.
 * Calls the server to invalidate the refresh token, then clears local storage.
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    const refreshToken = getStoredRefreshToken();
    await api.post('/auth/logout', { refreshToken });
  } catch (err) {
    // Ignore errors on logout — clear tokens regardless
    console.warn('Logout API call failed:', err.message);
  } finally {
    clearStoredTokens();
  }
};

/**
 * Refresh the access token using the stored refresh token.
 * @param {string} refreshToken
 * @returns {Promise<{ token: string, refreshToken: string }>}
 */
export const refreshAccessToken = async (refreshToken) => {
  const response = await api.post('/auth/refresh', { refreshToken });
  const payload = response.data?.data || response.data;
  const { token, refreshToken: newRefreshToken } = payload;
  setStoredToken(token);
  if (newRefreshToken) setStoredRefreshToken(newRefreshToken);
  return { token, refreshToken: newRefreshToken || refreshToken };
};

/**
 * Get the current authenticated user's profile from the server.
 * @returns {Promise<object>} Normalized user object
 */
export const getMe = async () => {
  const response = await api.get('/auth/me');
  // Backend envelope: { data: { user } } or { data: user }
  const payload = response.data?.data || response.data;
  const rawUser = payload.user || payload;
  return normalizeUser(rawUser);
};
