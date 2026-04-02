/**
 * Tests for authService module.
 */
import * as authService from '../../services/authService';

// Mock the api module
jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    defaults: { headers: { common: {} } },
  },
}));

jest.mock('../../utils/storage', () => ({
  setStoredToken: jest.fn(),
  setStoredRefreshToken: jest.fn(),
  clearStoredTokens: jest.fn(),
  getStoredRefreshToken: jest.fn(),
}));

import api from '../../services/api';
import * as storage from '../../utils/storage';

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call POST /auth/login and store tokens', async () => {
      const mockResponse = {
        data: {
          token: 'access-token',
          refreshToken: 'refresh-token',
          user: { id: '1', email: 'test@test.com' },
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await authService.login({ email: 'test@test.com', password: 'Password1' });

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'Password1',
      });
      expect(storage.setStoredToken).toHaveBeenCalledWith('access-token');
      expect(storage.setStoredRefreshToken).toHaveBeenCalledWith('refresh-token');
      expect(result.user.email).toBe('test@test.com');
    });

    it('should throw on login failure', async () => {
      api.post.mockRejectedValue(new Error('Invalid credentials'));
      await expect(authService.login({ email: 'bad@test.com', password: 'wrong' })).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should call POST /auth/register and store tokens', async () => {
      const mockResponse = {
        data: {
          token: 'access-token',
          refreshToken: 'refresh-token',
          user: { id: '2', email: 'new@test.com' },
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await authService.register({
        email: 'new@test.com',
        password: 'Password1',
        fullName: 'New User',
        phone: '0501234567',
      });

      expect(api.post).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
        email: 'new@test.com',
      }));
      expect(storage.setStoredToken).toHaveBeenCalledWith('access-token');
      expect(result.user.email).toBe('new@test.com');
    });
  });

  describe('logout', () => {
    it('should call POST /auth/logout and clear tokens', async () => {
      api.post.mockResolvedValue({ data: { success: true } });
      await authService.logout();
      expect(api.post).toHaveBeenCalledWith('/auth/logout');
      expect(storage.clearStoredTokens).toHaveBeenCalled();
    });

    it('should clear tokens even if API call fails', async () => {
      api.post.mockRejectedValue(new Error('Network error'));
      await authService.logout();
      expect(storage.clearStoredTokens).toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('should call GET /auth/me and return user', async () => {
      const mockUser = { id: '1', email: 'test@test.com' };
      api.get.mockResolvedValue({ data: { user: mockUser } });

      const user = await authService.getMe();
      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(user).toEqual(mockUser);
    });
  });
});
