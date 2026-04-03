/**
 * Tests for storage utility functions.
 * Uses Vitest (vi) — aligned with the project's test setup.
 * Includes tests for normalizeStoredUser() which handles Firestore ID normalization.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getStoredToken,
  setStoredToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
  clearStoredTokens,
  getStoredUser,
  setStoredUser,
  normalizeStoredUser,
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

  describe('normalizeStoredUser', () => {
    it('should return null when no user is stored', () => {
      expect(normalizeStoredUser()).toBeNull();
    });

    it('should normalize a Firestore user (string id)', () => {
      const user = {
        id: 'firestore-uid-abc123',
        email: 'test@morty.co.il',
        phone: '050-0000000',
        verified: true,
      };
      setStoredUser(user);
      const result = normalizeStoredUser();
      expect(result).not.toBeNull();
      expect(result.id).toBe('firestore-uid-abc123');
      expect(result.email).toBe('test@morty.co.il');
      expect(result.verified).toBe(true);
    });

    it('should normalize a legacy user (_id → id)', () => {
      const user = {
        _id: 'legacy-mongo-id',
        email: 'legacy@example.com',
        phone: '052-1234567',
        verified: false,
      };
      setStoredUser(user);
      const result = normalizeStoredUser();
      expect(result).not.toBeNull();
      // Should map _id to id
      expect(result.id).toBe('legacy-mongo-id');
      expect(result.email).toBe('legacy@example.com');
    });

    it('should provide safe defaults for missing fields', () => {
      setStoredUser({ id: 'uid-1' });
      const result = normalizeStoredUser();
      expect(result.email).toBe('');
      expect(result.phone).toBe('');
      expect(result.verified).toBe(false);
    });

    it('should handle user with both id and _id (prefers id)', () => {
      setStoredUser({
        id: 'firestore-id',
        _id: 'legacy-id',
        email: 'test@example.com',
      });
      const result = normalizeStoredUser();
      expect(result.id).toBe('firestore-id');
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
