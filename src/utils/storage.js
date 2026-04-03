/**
 * Local storage utility functions for token management.
 * Centralizes all localStorage access for auth tokens.
 *
 * Firestore alignment:
 *   - normalizeStoredUser() ensures retrieved user objects have `id` (string),
 *     not `_id` (legacy MongoDB ObjectId), for backward compatibility.
 */
import { normalizeUserDoc } from './firestoreUtils';

const TOKEN_KEY = 'morty_token';
const REFRESH_TOKEN_KEY = 'morty_refresh_token';
const USER_KEY = 'morty_user';

/**
 * Get the stored JWT access token
 * @returns {string|null}
 */
export const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

/**
 * Store the JWT access token
 * @param {string} token
 */
export const setStoredToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (err) {
    console.error('Failed to store token:', err);
  }
};

/**
 * Get the stored refresh token
 * @returns {string|null}
 */
export const getStoredRefreshToken = () => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

/**
 * Store the refresh token
 * @param {string} token
 */
export const setStoredRefreshToken = (token) => {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (err) {
    console.error('Failed to store refresh token:', err);
  }
};

/**
 * Clear all stored auth tokens
 */
export const clearStoredTokens = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    console.error('Failed to clear tokens:', err);
  }
};

/**
 * Get the stored user object.
 * Returns the raw stored object without normalization.
 * Use normalizeStoredUser() if you need Firestore-aligned shape.
 *
 * @returns {Object|null}
 */
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Get the stored user object, normalized to Firestore shape.
 *
 * Ensures the returned user has:
 *   - `id` (string) — prefers `id`, falls back to `_id` for legacy compat
 *   - `email`, `phone`, `verified` with safe defaults
 *
 * Use this when restoring session state to guarantee Firestore-aligned shape.
 *
 * @returns {{ id: string, email: string, phone: string, verified: boolean }|null}
 *
 * @example
 *   // Stored as { _id: 'legacy-id', email: 'user@example.com' }
 *   normalizeStoredUser() // → { id: 'legacy-id', email: 'user@example.com', phone: '', verified: false }
 *
 *   // Stored as { id: 'firestore-uid', email: 'user@example.com', verified: true }
 *   normalizeStoredUser() // → { id: 'firestore-uid', email: 'user@example.com', phone: '', verified: true }
 */
export const normalizeStoredUser = () => {
  const raw = getStoredUser();
  if (!raw) return null;
  return normalizeUserDoc(raw);
};

/**
 * Store the user object
 * @param {Object} user
 */
export const setStoredUser = (user) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to store user:', err);
  }
};

/**
 * Check if the user appears to be authenticated (has a token)
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return Boolean(getStoredToken());
};
