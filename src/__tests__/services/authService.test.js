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
    it('should call POST /auth/logout with refresh token and clear tokens', async () => {
      api.post.mockResolvedValue({ data: { message: 'Logged out' } });
      await authService.logout();
      expect(api.post).toHaveBeenCalledWith('/auth/logout', {
        refreshToken: 'stored-refresh-token',
      });
      expect(storage.clearStoredTokens).toHaveBeenCalled();
    });

    it('should clear tokens even if API call fails', async () => {
      api.post.mockRejectedValue(new Error('Network error'));
      await authService.logout();
      expect(storage.clearStoredTokens).toHaveBeenCalled();
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
});
