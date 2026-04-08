/**
 * Tests for authService module.
 * Uses Vitest (vi) — aligned with the project's test setup.
 * Mock shapes use Firestore string IDs (not ObjectIds).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the api module (default export = axios instance)
vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    defaults: { headers: { common: {} } },
  },
  API_BASE_URL: 'https://morty-backend.onrender.com/api/v1',
}));

// Mock storage utilities
vi.mock('../../utils/storage', () => ({
  setStoredToken: vi.fn(),
  setStoredRefreshToken: vi.fn(),
  setStoredUser: vi.fn(),
  clearStoredTokens: vi.fn(),
  getStoredRefreshToken: vi.fn(() => 'stored-refresh-token'),
  getStoredToken: vi.fn(() => null),
  getStoredUser: vi.fn(() => null),
  isAuthenticated: vi.fn(() => false),
}));

// Mock Firebase auth module
const mockGetIdToken = vi.fn();
const mockFirebaseUser = {
  uid: 'firebase-uid-xyz',
  email: 'google@morty.co.il',
  displayName: 'Google User',
  getIdToken: mockGetIdToken,
};

const mockSignInWithPopup = vi.fn();
const mockSignInWithRedirect = vi.fn();
const mockGetRedirectResult = vi.fn();
const mockFirebaseSignOut = vi.fn();

vi.mock('firebase/auth', () => ({
  signInWithPopup: (...args) => mockSignInWithPopup(...args),
  signInWithRedirect: (...args) => mockSignInWithRedirect(...args),
  getRedirectResult: (...args) => mockGetRedirectResult(...args),
  signOut: (...args) => mockFirebaseSignOut(...args),
  GoogleAuthProvider: vi.fn(),
  getAuth: vi.fn(),
}));

vi.mock('../../firebase', () => ({
  auth: {},
  googleProvider: {},
}));

import api from '../../services/api';
import * as storage from '../../utils/storage';
import * as authService from '../../services/authService';

/** Firestore-shaped mock user (string id, no _id) */
const mockUser = {
  id: 'firestore-uid-abc123',
  email: 'test@morty.co.il',
  phone: '050-0000000',
  verified: true,
};

/** Firestore-shaped mock user returned after Google auth */
const mockGoogleUser = {
  id: 'firestore-google-uid-789',
  email: 'google@morty.co.il',
  phone: '',
  verified: true,
};

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('normalizeUser', () => {
    it('should prefer id over _id', () => {
      const result = authService.normalizeUser({ id: 'abc', _id: 'xyz', email: 'a@b.com' });
      expect(result.id).toBe('abc');
    });

    it('should fall back to _id when id is absent', () => {
      const result = authService.normalizeUser({ _id: 'xyz', email: 'a@b.com' });
      expect(result.id).toBe('xyz');
    });

    it('should provide safe defaults for missing fields', () => {
      const result = authService.normalizeUser({ id: 'abc' });
      expect(result.email).toBe('');
      expect(result.phone).toBe('');
      expect(result.verified).toBe(false);
    });
  });

  describe('login', () => {
    it('should call POST /auth/login and store tokens', async () => {
      api.post.mockResolvedValue({
        data: {
          data: {
            token: 'access-token',
            refreshToken: 'refresh-token',
            user: mockUser,
          },
        },
      });

      const result = await authService.login({ email: 'test@morty.co.il', password: 'Password1' });

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@morty.co.il',
        password: 'Password1',
      });
      expect(storage.setStoredToken).toHaveBeenCalledWith('access-token');
      expect(storage.setStoredRefreshToken).toHaveBeenCalledWith('refresh-token');
      expect(storage.setStoredUser).toHaveBeenCalled();
      expect(result.user.id).toBe('firestore-uid-abc123');
      expect(result.user.email).toBe('test@morty.co.il');
    });

    it('should throw on login failure', async () => {
      api.post.mockRejectedValue(new Error('Invalid credentials'));
      await expect(
        authService.login({ email: 'bad@test.com', password: 'wrong' })
      ).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should call POST /auth/register and store tokens', async () => {
      api.post.mockResolvedValue({
        data: {
          data: {
            token: 'access-token',
            refreshToken: 'refresh-token',
            user: { id: 'new-uid-456', email: 'new@morty.co.il', phone: '', verified: false },
          },
        },
      });

      const result = await authService.register({
        email: 'new@morty.co.il',
        password: 'Password1',
        phone: '0501234567',
      });

      expect(api.post).toHaveBeenCalledWith(
        '/auth/register',
        expect.objectContaining({ email: 'new@morty.co.il' })
      );
      expect(storage.setStoredToken).toHaveBeenCalledWith('access-token');
      expect(result.user.id).toBe('new-uid-456');
    });
  });

  describe('logout', () => {
    it('should call Firebase signOut, POST /auth/logout with refresh token, and clear tokens', async () => {
      mockFirebaseSignOut.mockResolvedValue(undefined);
      api.post.mockResolvedValue({ data: { message: 'Logged out' } });

      await authService.logout();

      // Firebase signOut must be called first
      expect(mockFirebaseSignOut).toHaveBeenCalledTimes(1);

      // Backend logout must be called with the stored refresh token
      expect(api.post).toHaveBeenCalledWith('/auth/logout', {
        refreshToken: 'stored-refresh-token',
      });

      // Local tokens must be cleared
      expect(storage.clearStoredTokens).toHaveBeenCalled();
    });

    it('should clear tokens even if API call fails', async () => {
      mockFirebaseSignOut.mockResolvedValue(undefined);
      api.post.mockRejectedValue(new Error('Network error'));

      await authService.logout();

      expect(storage.clearStoredTokens).toHaveBeenCalled();
    });

    it('should still clear tokens and call backend if Firebase signOut fails', async () => {
      // Firebase signOut fails (e.g. no active session)
      mockFirebaseSignOut.mockRejectedValue(new Error('Firebase: no current user'));
      api.post.mockResolvedValue({ data: { message: 'Logged out' } });

      await authService.logout();

      // Firebase signOut was attempted
      expect(mockFirebaseSignOut).toHaveBeenCalledTimes(1);

      // Backend logout still called despite Firebase failure
      expect(api.post).toHaveBeenCalledWith('/auth/logout', {
        refreshToken: 'stored-refresh-token',
      });

      // Local tokens still cleared
      expect(storage.clearStoredTokens).toHaveBeenCalled();
    });

    it('should clear tokens even if both Firebase signOut and API call fail', async () => {
      mockFirebaseSignOut.mockRejectedValue(new Error('Firebase error'));
      api.post.mockRejectedValue(new Error('Network error'));

      await authService.logout();

      // Tokens must always be cleared regardless of errors
      expect(storage.clearStoredTokens).toHaveBeenCalled();
    });

    it('should call Firebase signOut with the auth instance', async () => {
      mockFirebaseSignOut.mockResolvedValue(undefined);
      api.post.mockResolvedValue({ data: { message: 'Logged out' } });

      await authService.logout();

      // Verify Firebase signOut was called with the auth object from firebase.js
      const { auth } = await import('../../firebase');
      expect(mockFirebaseSignOut).toHaveBeenCalledWith(auth);
    });
  });

  describe('refreshAccessToken', () => {
    it('should call POST /auth/refresh and store new tokens', async () => {
      api.post.mockResolvedValue({
        data: { data: { token: 'new-token', refreshToken: 'new-refresh' } },
      });

      const result = await authService.refreshAccessToken('old-refresh');
      expect(api.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'old-refresh' });
      expect(storage.setStoredToken).toHaveBeenCalledWith('new-token');
      expect(result.token).toBe('new-token');
    });
  });

  describe('getMe', () => {
    it('should call GET /auth/me and return normalized user', async () => {
      api.get.mockResolvedValue({
        data: { data: { user: mockUser } },
      });

      const user = await authService.getMe();
      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(user.id).toBe('firestore-uid-abc123');
      expect(user.email).toBe('test@morty.co.il');
    });
  });

  describe('googleLogin', () => {
    it('should open Google popup, get ID token, POST to /auth/google, and store tokens', async () => {
      // Firebase popup resolves with a user credential
      mockGetIdToken.mockResolvedValue('firebase-id-token-abc');
      mockSignInWithPopup.mockResolvedValue({ user: mockFirebaseUser });

      // Backend returns standard auth payload
      api.post.mockResolvedValue({
        data: {
          data: {
            token: 'access-token-google',
            refreshToken: 'refresh-token-google',
            user: mockGoogleUser,
          },
        },
      });

      const result = await authService.googleLogin();

      // Firebase popup was called
      expect(mockSignInWithPopup).toHaveBeenCalledTimes(1);

      // ID token was fetched from the Firebase user
      expect(mockGetIdToken).toHaveBeenCalledTimes(1);

      // Backend was called with the ID token
      expect(api.post).toHaveBeenCalledWith('/auth/google', {
        idToken: 'firebase-id-token-abc',
      });

      // Tokens and user were stored
      expect(storage.setStoredToken).toHaveBeenCalledWith('access-token-google');
      expect(storage.setStoredRefreshToken).toHaveBeenCalledWith('refresh-token-google');
      expect(storage.setStoredUser).toHaveBeenCalled();

      // Returned payload is normalized
      expect(result).not.toBeNull();
      expect(result.token).toBe('access-token-google');
      expect(result.refreshToken).toBe('refresh-token-google');
      expect(result.user.id).toBe('firestore-google-uid-789');
      expect(result.user.email).toBe('google@morty.co.il');
    });

    it('should return null when user closes the popup (popup-closed-by-user)', async () => {
      const popupClosedError = Object.assign(new Error('Popup closed'), {
        code: 'auth/popup-closed-by-user',
      });
      mockSignInWithPopup.mockRejectedValue(popupClosedError);

      const result = await authService.googleLogin();

      expect(result).toBeNull();
      // Backend should NOT be called
      expect(api.post).not.toHaveBeenCalled();
      // Storage should NOT be touched
      expect(storage.setStoredToken).not.toHaveBeenCalled();
    });

    it('should return null when popup request is cancelled (cancelled-popup-request)', async () => {
      const cancelledError = Object.assign(new Error('Cancelled'), {
        code: 'auth/cancelled-popup-request',
      });
      mockSignInWithPopup.mockRejectedValue(cancelledError);

      const result = await authService.googleLogin();

      expect(result).toBeNull();
      expect(api.post).not.toHaveBeenCalled();
    });

    it('should re-throw non-silent Firebase errors', async () => {
      const networkError = Object.assign(new Error('Network error'), {
        code: 'auth/network-request-failed',
      });
      mockSignInWithPopup.mockRejectedValue(networkError);

      await expect(authService.googleLogin()).rejects.toThrow('Network error');
      expect(api.post).not.toHaveBeenCalled();
    });

    it('should fall back to redirect when popup is blocked by COOP', async () => {
      const popupBlockedError = Object.assign(new Error('Popup blocked'), {
        code: 'auth/popup-blocked',
      });
      mockSignInWithPopup.mockRejectedValue(popupBlockedError);
      mockSignInWithRedirect.mockResolvedValue(undefined);

      const result = await authService.googleLogin();

      expect(result).toBe('redirect');
      expect(mockSignInWithRedirect).toHaveBeenCalledTimes(1);
      expect(api.post).not.toHaveBeenCalled();
    });

    it('should re-throw backend errors after successful Firebase auth', async () => {
      mockGetIdToken.mockResolvedValue('firebase-id-token-abc');
      mockSignInWithPopup.mockResolvedValue({ user: mockFirebaseUser });

      const backendError = new Error('Backend verification failed');
      backendError.response = { status: 401, data: { message: 'Invalid token' } };
      api.post.mockRejectedValue(backendError);

      await expect(authService.googleLogin()).rejects.toThrow('Backend verification failed');

      // Storage should NOT be touched on backend failure
      expect(storage.setStoredToken).not.toHaveBeenCalled();
      expect(storage.setStoredRefreshToken).not.toHaveBeenCalled();
    });

    it('should normalize user from backend response (handles _id fallback)', async () => {
      mockGetIdToken.mockResolvedValue('firebase-id-token-abc');
      mockSignInWithPopup.mockResolvedValue({ user: mockFirebaseUser });

      // Backend returns legacy _id shape
      api.post.mockResolvedValue({
        data: {
          data: {
            token: 'tok',
            refreshToken: 'ref',
            user: { _id: 'legacy-id', email: 'google@morty.co.il', verified: true },
          },
        },
      });

      const result = await authService.googleLogin();
      expect(result.user.id).toBe('legacy-id');
    });
  });
});
