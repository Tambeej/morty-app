/**
 * Tests for storage utility functions.
 * Uses Vitest (vi) — aligned with the project's test setup.
 */
import { describe, it, expect, beforeEach } from 'vitest';
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

    it('should store and retrieve a Firestore user object (string id)', () => {
      // Firestore user shape: { id: string, email, phone, verified }
      const user = {
        id: 'firestore-uid-abc123',
        email: 'test@morty.co.il',
        phone: '050-0000000',
        verified: true,
      };
      setStoredUser(user);
      expect(getStoredUser()).toEqual(user);
    });

    it('should store and retrieve a user object with legacy _id', () => {
      const user = { _id: 'legacy-id', email: 'test@example.com' };
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
