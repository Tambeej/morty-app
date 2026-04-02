/**
 * Tests for storage utility functions.
 */
import {
  getStoredToken,
  setStoredToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
  clearStoredTokens,
  getStoredUser,
  setStoredUser,
  isAuthenticated,
} from '../../utils/storage';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Storage Utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Token management', () => {
    it('should return null when no token is stored', () => {
      expect(getStoredToken()).toBeNull();
    });

    it('should store and retrieve a token', () => {
      setStoredToken('test-token-123');
      expect(getStoredToken()).toBe('test-token-123');
    });

    it('should store and retrieve a refresh token', () => {
      setStoredRefreshToken('refresh-token-456');
      expect(getStoredRefreshToken()).toBe('refresh-token-456');
    });

    it('should clear all tokens', () => {
      setStoredToken('token');
      setStoredRefreshToken('refresh');
      clearStoredTokens();
      expect(getStoredToken()).toBeNull();
      expect(getStoredRefreshToken()).toBeNull();
    });
  });

  describe('User management', () => {
    it('should return null when no user is stored', () => {
      expect(getStoredUser()).toBeNull();
    });

    it('should store and retrieve a user object', () => {
      const user = { id: '123', email: 'test@example.com', fullName: 'Test User' };
      setStoredUser(user);
      expect(getStoredUser()).toEqual(user);
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token exists', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('should return true when a token exists', () => {
      setStoredToken('some-token');
      expect(isAuthenticated()).toBe(true);
    });
  });
});
