/**
 * Authentication service module.
 *
 * Handles all auth-related API calls: register, login, logout, refresh, getMe,
 * and Google OAuth via Firebase signInWithPopup.
 *
 * Normalizes the user shape from Firestore backend (string `id`, no `_id`).
 * Stores tokens and user in localStorage via storage utilities.
 *
 * Firestore user shape:
 *   { id: string, email: string, phone: string, verified: boolean }
 *
 * Backend response envelope:
 *   { data: { token, refreshToken, user }, message?: string }
 */
import api from './api';
import {
  setStoredToken,
  setStoredRefreshToken,
  setStoredUser,
  clearStoredTokens,
  getStoredRefreshToken,
} from '../utils/storage';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

/**
 * Normalize user object from backend response.
 *
 * Provides backward-compat shim: prefers `id` (Firestore string), falls back
 * to `_id` (legacy Mongoose ObjectId). Ensures all fields have safe defaults.
 *
 * @param {object} user - Raw user from API response
 * @returns {{ id: string, email: string, phone: string, verified: boolean }}
 */
export const normalizeUser = (user) => ({
  id: user.id || user._id || '',
  email: user.email || '',
  phone: user.phone || '',
  verified: user.verified || false,
});

/**
 * Register a new user.
 *
 * @param {{ email: string, password: string, phone?: string }} data
 * @returns {Promise<{ token: string, refreshToken: string, user: object }>}
 * @throws {Error} On network or server error
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
 *
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ token: string, refreshToken: string, user: object }>}
 * @throws {Error} On invalid credentials or network error
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
 * Sign in with Google via Firebase popup, then exchange the Firebase ID token
 * for custom Morty JWTs from the backend.
 *
 * Flow:
 *   1. Open Google sign-in popup via Firebase Auth (signInWithPopup).
 *   2. Obtain the Firebase ID token from the resulting credential.
 *   3. POST the ID token to /auth/google — backend verifies it with Admin SDK,
 *      finds-or-creates the Firestore user, and returns standard JWT payload.
 *   4. Store access token, refresh token, and user in localStorage.
 *
 * Error handling:
 *   - If the user closes the popup (`auth/popup-closed-by-user` or
 *     `auth/cancelled-popup-request`), the function returns `null` silently
 *     so callers can treat it as a no-op.
 *   - All other errors are re-thrown for the caller to handle (e.g. show toast).
 *
 * @returns {Promise<{ token: string, refreshToken: string, user: object } | null>}
 *   Resolved auth payload on success, or `null` if the user dismissed the popup.
 * @throws {Error} On Firebase auth failure or backend verification error.
 */
export const googleLogin = async () => {
  let firebaseUser;

  try {
    const result = await signInWithPopup(auth, googleProvider);
    firebaseUser = result.user;
  } catch (err) {
    // User closed the popup or cancelled — treat as a silent no-op.
    const silentCodes = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];
    if (silentCodes.includes(err?.code)) {
      return null;
    }
    // Re-throw all other Firebase errors (network, config, etc.).
    throw err;
  }

  // Obtain a fresh Firebase ID token (valid for ~1 hour).
  const idToken = await firebaseUser.getIdToken();

  // Exchange the Firebase ID token for Morty custom JWTs.
  // Backend: POST /auth/google { idToken } → { data: { token, refreshToken, user } }
  const response = await api.post('/auth/google', { idToken });
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
 *
 * Calls the server to invalidate the refresh token server-side,
 * then clears all locally stored tokens regardless of API result.
 *
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    const refreshToken = getStoredRefreshToken();
    await api.post('/auth/logout', { refreshToken });
  } catch (err) {
    // Ignore errors on logout — clear tokens regardless
    console.warn('Logout API call failed:', err?.message || err);
  } finally {
    clearStoredTokens();
  }
};

/**
 * Refresh the access token using the stored refresh token.
 *
 * @param {string} refreshToken - The current refresh token
 * @returns {Promise<{ token: string, refreshToken: string }>}
 * @throws {Error} If the refresh token is invalid or expired
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
 *
 * Handles both response shapes:
 *   - { data: { user: {...} } }
 *   - { data: {...} }  (user object directly)
 *
 * @returns {Promise<{ id: string, email: string, phone: string, verified: boolean }>}
 * @throws {Error} If not authenticated or network error
 */
export const getMe = async () => {
  const response = await api.get('/auth/me');
  // Backend envelope: { data: { user } } or { data: user }
  const payload = response.data?.data || response.data;
  const rawUser = payload.user || payload;
  return normalizeUser(rawUser);
};
