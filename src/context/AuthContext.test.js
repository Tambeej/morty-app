/**
 * AuthContext.test.js — Tests for the AuthContext provider.
 *
 * Uses Vitest (vi) — aligned with the project's test setup.
 * AuthContext now delegates to authService, so we mock authService.
 */
import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

// ── Mock authService ──────────────────────────────────────────────────────────
vi.mock('../services/authService', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getMe: vi.fn(),
  normalizeUser: vi.fn((user) => ({
    id: user.id || user._id || '',
    email: user.email || '',
    phone: user.phone || '',
    verified: user.verified || false,
  })),
}));

// ── Mock storage utilities ────────────────────────────────────────────────────
vi.mock('../utils/storage', () => ({
  getStoredToken: vi.fn(() => null),
  getStoredRefreshToken: vi.fn(() => null),
  getStoredUser: vi.fn(() => null),
  setStoredToken: vi.fn(),
  setStoredRefreshToken: vi.fn(),
  setStoredUser: vi.fn(),
  clearStoredTokens: vi.fn(),
  isAuthenticated: vi.fn(() => false),
}));

import * as authService from '../services/authService';
import * as storage from '../utils/storage';

/** Firestore-shaped mock user (string id, no _id) */
const mockUser = {
  id: 'firestore-uid-abc123',
  email: 'test@morty.co.il',
  phone: '050-0000000',
  verified: true,
};

// ── Test consumer component ─────────────────────────────────────────────────────
function TestConsumer() {
  const { user, isLoading, loading, isAuthenticated, error, login, logout, loginUser, logoutUser } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading ?? loading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user ? user.email : 'null'}</span>
      <span data-testid="error">{error || 'none'}</span>
      <button
        data-testid="login-btn"
        onClick={() => login({ email: 'test@morty.co.il', password: 'Password1' })}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage.getStoredToken.mockReturnValue(null);
    storage.getStoredUser.mockReturnValue(null);
  });

  it('starts with loading=true then resolves to loading=false when no session', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
  });

  it('restores session from localStorage when token and user exist', async () => {
    storage.getStoredToken.mockReturnValue('stored-token');
    storage.getStoredUser.mockReturnValue(mockUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
      expect(screen.getByTestId('user').textContent).toBe('test@morty.co.il');
    });
  });

  it('login sets user state with Firestore string id', async () => {
    authService.login.mockResolvedValue({
      token: 'access-token',
      refreshToken: 'refresh-token',
      user: mockUser,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('test@morty.co.il');
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });
  });

  it('login failure sets error state', async () => {
    authService.login.mockRejectedValue({
      response: { data: { message: 'אימייל או סיסמה שגויים' } },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('אימייל או סיסמה שגויים');
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });
  });

  it('logout clears user state', async () => {
    authService.login.mockResolvedValue({
      token: 'access-token',
      refreshToken: 'refresh-token',
      user: mockUser,
    });
    authService.logout.mockResolvedValue();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    await act(async () => { screen.getByTestId('login-btn').click(); });
    await waitFor(() =>
      expect(screen.getByTestId('authenticated').textContent).toBe('true')
    );

    await act(async () => { screen.getByTestId('logout-btn').click(); });
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });

  it('exposes login, register, logout, loginUser, logoutUser functions', async () => {
    let authValue;
    function Capture() {
      authValue = useAuth();
      return null;
    }

    render(
      <AuthProvider>
        <Capture />
      </AuthProvider>
    );

    await waitFor(() => expect(authValue).toBeDefined());

    expect(typeof authValue.login).toBe('function');
    expect(typeof authValue.register).toBe('function');
    expect(typeof authValue.logout).toBe('function');
    expect(typeof authValue.loginUser).toBe('function');
    expect(typeof authValue.registerUser).toBe('function');
    expect(typeof authValue.logoutUser).toBe('function');
    expect(typeof authValue.clearError).toBe('function');
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    function BadComponent() {
      useAuth();
      return null;
    }
    expect(() => render(<BadComponent />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );
    consoleError.mockRestore();
  });
});
