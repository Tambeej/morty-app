/**
 * Tests for Firebase Client SDK initialization (src/firebase.js).
 *
 * We mock the firebase/* modules so that no real network calls are made
 * and the tests run in the jsdom environment without Firebase internals.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockApp = { name: '[DEFAULT]' };
const mockAuth = { currentUser: null };
const mockProvider = {
  addScope: vi.fn(),
  setCustomParameters: vi.fn(),
};

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => mockApp),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => mockApp),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockAuth),
  GoogleAuthProvider: vi.fn(() => mockProvider),
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Firebase initialization (src/firebase.js)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('initializes a Firebase app when none exists', async () => {
    const { initializeApp, getApps } = await import('firebase/app');
    getApps.mockReturnValue([]);

    await import('../firebase.js');

    expect(initializeApp).toHaveBeenCalledTimes(1);
    expect(initializeApp).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: expect.anything(),
        authDomain: expect.anything(),
        projectId: expect.anything(),
        appId: expect.anything(),
      })
    );
  });

  it('reuses an existing Firebase app (singleton pattern)', async () => {
    const { initializeApp, getApps, getApp } = await import('firebase/app');
    // Simulate an already-initialized app
    getApps.mockReturnValue([mockApp]);

    await import('../firebase.js');

    expect(initializeApp).not.toHaveBeenCalled();
    expect(getApp).toHaveBeenCalledTimes(1);
  });

  it('exports a valid auth instance', async () => {
    const { getAuth } = await import('firebase/auth');
    const { auth } = await import('../firebase.js');

    expect(getAuth).toHaveBeenCalledTimes(1);
    expect(auth).toBe(mockAuth);
  });

  it('exports a GoogleAuthProvider instance', async () => {
    const { googleProvider } = await import('../firebase.js');

    expect(googleProvider).toBe(mockProvider);
  });

  it('configures GoogleAuthProvider with required scopes', async () => {
    await import('../firebase.js');

    expect(mockProvider.addScope).toHaveBeenCalledWith('email');
    expect(mockProvider.addScope).toHaveBeenCalledWith('profile');
  });

  it('sets select_account prompt on GoogleAuthProvider', async () => {
    await import('../firebase.js');

    expect(mockProvider.setCustomParameters).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: 'select_account' })
    );
  });

  it('exports the Firebase app as default export', async () => {
    const firebaseModule = await import('../firebase.js');

    expect(firebaseModule.default).toBe(mockApp);
  });
});
