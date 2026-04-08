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

const mockSignInWithRedirect = vi.fn();
const mockOnAuthStateChanged = vi.fn();
const mockFirebaseSignOut = vi.fn();

vi.mock('firebase/auth', () => ({
  signInWithRedirect: (...args) => mockSignInWithRedirect(...args),
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
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
    it('should call signInWithRedirect with auth and provider', async () => {
      mockSignInWithRedirect.mockResolvedValue(undefined);

      await authService.googleLogin();

      const { auth, googleProvider } = await import('../../firebase');
      expect(mockSignInWithRedirect).toHaveBeenCalledWith(auth, googleProvider);
    });

    it('should re-throw errors from signInWithRedirect', async () => {
      mockSignInWithRedirect.mockRejectedValue(new Error('Redirect failed'));

      await expect(authService.googleLogin()).rejects.toThrow('Redirect failed');
    });
  });

  describe('onFirebaseAuthReady', () => {
    it('should subscribe to onAuthStateChanged and return unsubscribe', () => {
      const mockUnsubscribe = vi.fn();
      mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe);

      const unsubscribe = authService.onFirebaseAuthReady(vi.fn(), vi.fn());

      expect(mockOnAuthStateChanged).toHaveBeenCalledWith(expect.anything(), expect.any(Function));
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should exchange token and call onSuccess when Firebase user is present', async () => {
      mockGetIdToken.mockResolvedValue('firebase-id-token-abc');
      mockOnAuthStateChanged.mockImplementation((authInstance, callback) => {
        callback(mockFirebaseUser);
        return vi.fn();
      });

      api.post.mockResolvedValue({
        data: {
          data: {
            token: 'access-token-google',
            refreshToken: 'refresh-token-google',
            user: mockGoogleUser,
          },
        },
      });

      const onSuccess = vi.fn();
      const onError = vi.fn();
      authService.onFirebaseAuthReady(onSuccess, onError);

      // Wait for async exchangeFirebaseToken to complete
      await vi.waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });

      expect(api.post).toHaveBeenCalledWith('/auth/google', {
        idToken: 'firebase-id-token-abc',
      });
      expect(storage.setStoredToken).toHaveBeenCalledWith('access-token-google');
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ token: 'access-token-google' })
      );
      expect(onError).not.toHaveBeenCalled();
    });

    it('should not call onSuccess when Firebase user is null', () => {
      mockOnAuthStateChanged.mockImplementation((authInstance, callback) => {
        callback(null);
        return vi.fn();
      });

      const onSuccess = vi.fn();
      const onError = vi.fn();
      authService.onFirebaseAuthReady(onSuccess, onError);

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
      expect(api.post).not.toHaveBeenCalled();
    });

    it('should call onError when token exchange fails', async () => {
      mockGetIdToken.mockResolvedValue('firebase-id-token-abc');
      mockOnAuthStateChanged.mockImplementation((authInstance, callback) => {
        callback(mockFirebaseUser);
        return vi.fn();
      });

      const backendError = new Error('Backend verification failed');
      api.post.mockRejectedValue(backendError);

      const onSuccess = vi.fn();
      const onError = vi.fn();
      authService.onFirebaseAuthReady(onSuccess, onError);

      await vi.waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(backendError);
    });
  });
});
