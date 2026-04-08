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
import {
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
} from 'firebase/auth';

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
 * Exchange a Firebase user's ID token for Morty custom JWTs from the backend.
 *
 * @param {import('firebase/auth').User} firebaseUser
 * @returns {Promise<{ token: string, refreshToken: string, user: object }>}
 */
const exchangeFirebaseToken = async (firebaseUser) => {
  const idToken = await firebaseUser.getIdToken();
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
 * Sign in with Google via Firebase redirect flow.
 *
 * Uses signInWithRedirect to avoid Cross-Origin-Opener-Policy issues on
 * GitHub Pages (which sets COOP: same-origin, breaking signInWithPopup).
 *
 * Flow:
 *   1. Redirect to Google sign-in page via signInWithRedirect.
 *   2. On return, handleGoogleRedirectResult (called on app init) picks up
 *      the result and exchanges the Firebase ID token for Morty JWTs.
 *
 * @returns {Promise<void>}
 */
export const googleLogin = async () => {
  await signInWithRedirect(auth, googleProvider);
};

/**
 * Handle the result of a Google sign-in redirect (called on app init).
 *
 * After signInWithRedirect, Firebase stores the auth result in session storage.
 * This function retrieves it and exchanges the token with the backend.
 *
 * @returns {Promise<{ token: string, refreshToken: string, user: object } | null>}
 *   Auth payload if a redirect result was pending, `null` otherwise.
 */
export const handleGoogleRedirectResult = async () => {
  const result = await getRedirectResult(auth);
  if (!result) return null;
  return await exchangeFirebaseToken(result.user);
};

/**
 * Logout the current user.
 *
 * Performs a full sign-out in two steps:
 *   1. Firebase sign-out — clears the Firebase Auth session (Google OAuth
 *      session cookie, cached credentials). This is a no-op for email/password
 *      users who never signed in via Firebase, so it is always safe to call.
 *   2. Backend invalidation — POSTs the refresh token to /auth/logout so the
 *      server can revoke it in Firestore.
 *   3. Local token cleanup — clears all tokens from localStorage regardless of
 *      whether steps 1 or 2 succeed, ensuring the user is always logged out
 *      on the client side.
 *
 * Error handling:
 *   - Firebase signOut errors are caught and logged as warnings (non-fatal).
 *     The Firebase session may already be expired or the user may have been
 *     an email/password user with no Firebase session.
 *   - Backend logout errors are caught and logged as warnings (non-fatal).
 *     Token cleanup always runs in the `finally` block.
 *
 * @returns {Promise<void>}
 */
export const logout = async () => {
  // Step 1: Sign out from Firebase Auth to clear Google OAuth session.
  // This is safe to call even for email/password users (no-op if no Firebase session).
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    // Non-fatal: Firebase session may already be expired or absent.
    console.warn('[authService] Firebase signOut failed (non-fatal):', err?.message || err);
  }

  // Step 2: Invalidate the refresh token on the backend + Step 3: clear local storage.
  try {
    const refreshToken = getStoredRefreshToken();
    await api.post('/auth/logout', { refreshToken });
  } catch (err) {
    // Ignore errors on logout — clear tokens regardless
    console.warn('[authService] Logout API call failed (non-fatal):', err?.message || err);
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
