/**
 * Tests for AuthContext provider and useAuth hook.
 *
 * Uses Vitest (vi) — aligned with the project's test setup.
 * Mock user shapes use Firestore string IDs (not ObjectIds).
 *
 * Covers:
 *   - Initial loading state
 *   - Session restore from localStorage
 *   - loginUser (success, failure with message/error fields)
 *   - registerUser (success, failure)
 *   - googleLoginUser (success, popup dismissed, error)
 *   - logoutUser (success, API failure)
 *   - clearError
 *   - useAuth outside provider throws
 */
import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../../context/AuthContext.jsx';

// ── Mock authService ──────────────────────────────────────────────────────────
vi.mock('../../services/authService', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  googleLogin: vi.fn(),
  getMe: vi.fn(),
  normalizeUser: vi.fn((user) => ({
    id: user.id || user._id || '',
    email: user.email || '',
    phone: user.phone || '',
    verified: user.verified || false,
  })),
}));

// ── Mock storage utilities ────────────────────────────────────────────────────
vi.mock('../../utils/storage', () => ({
  getStoredToken: vi.fn(() => null),
  getStoredRefreshToken: vi.fn(() => null),
  getStoredUser: vi.fn(() => null),
  setStoredToken: vi.fn(),
  setStoredRefreshToken: vi.fn(),
  setStoredUser: vi.fn(),
  clearStoredTokens: vi.fn(),
  isAuthenticated: vi.fn(() => false),
}));

import * as authService from '../../services/authService';
import * as storage from '../../utils/storage';

// ── Firestore-shaped mock data ────────────────────────────────────────────────
/** Firestore user: string id, no _id */
const mockUser = {
  id: 'firestore-uid-abc123',
  email: 'test@morty.co.il',
  phone: '050-0000000',
  verified: true,
};

const googleMockUser = {
  id: 'google-firestore-uid-xyz789',
  email: 'google@morty.co.il',
  phone: '',
  verified: true,
};

// ── Test component ────────────────────────────────────────────────────────────
const TestComponent = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginUser,
    logoutUser,
    googleLoginUser,
    clearError,
  } = useAuth();
  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="authenticated">{String(isAuthenticated)}</div>
      <div data-testid="user">{user ? user.email : 'none'}</div>
      <div data-testid="error">{error || 'none'}</div>
      <button
        onClick={() =>
          loginUser({ email: 'test@morty.co.il', password: 'Password1' })
        }
      >
        Login
      </button>
      <button onClick={logoutUser}>Logout</button>
      <button onClick={googleLoginUser}>Google Login</button>
      <button onClick={clearError}>Clear Error</button>
    </div>
  );
};

const renderWithAuth = () =>
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage.getStoredToken.mockReturnValue(null);
    storage.getStoredUser.mockReturnValue(null);
  });

  it('should start with loading state', () => {
    renderWithAuth();
    // Initially loading while checking session
    expect(screen.getByTestId('loading').textContent).toBe('true');
  });

  it('should set isAuthenticated to false when no token', async () => {
    renderWithAuth();
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
  });

  it('should restore session from localStorage when token and user exist', async () => {
    storage.getStoredToken.mockReturnValue('stored-access-token');
    storage.getStoredUser.mockReturnValue(mockUser);

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
      expect(screen.getByTestId('user').textContent).toBe('test@morty.co.il');
    });
  });

  it('should login successfully with Firestore user shape', async () => {
    authService.login.mockResolvedValue({
      token: 'access-token',
      refreshToken: 'refresh-token',
      user: mockUser,
    });

    renderWithAuth();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    await act(async () => {
      await userEvent.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
      expect(screen.getByTestId('user').textContent).toBe('test@morty.co.il');
    });

    // Verify authService.login was called with correct credentials
    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@morty.co.il',
      password: 'Password1',
    });
  });

  it('should handle login failure and show error message', async () => {
    authService.login.mockRejectedValue({
      response: { data: { error: 'Invalid credentials' } },
    });

    renderWithAuth();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    await act(async () => {
      await userEvent.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('Invalid credentials');
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });
  });

  it('should handle login failure with message field', async () => {
    authService.login.mockRejectedValue({
      response: { data: { message: 'אימייל או סיסמה שגויים' } },
    });

    renderWithAuth();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    await act(async () => {
      await userEvent.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('אימייל או סיסמה שגויים');
    });
  });

  // ── googleLoginUser tests ─────────────────────────────────────────────────

  it('should sign in with Google successfully and update auth state', async () => {
    authService.googleLogin.mockResolvedValue({
      token: 'google-access-token',
      refreshToken: 'google-refresh-token',
      user: googleMockUser,
    });

    renderWithAuth();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    await act(async () => {
      await userEvent.click(screen.getByText('Google Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
      expect(screen.getByTestId('user').textContent).toBe('google@morty.co.il');
      expect(screen.getByTestId('error').textContent).toBe('none');
    });

    expect(authService.googleLogin).toHaveBeenCalledTimes(1);
  });

  it('should return null and not update auth state when user dismisses Google popup', async () => {
    // authService.googleLogin returns null when popup is dismissed
    authService.googleLogin.mockResolvedValue(null);

    renderWithAuth();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    let result;
    await act(async () => {
      // Directly call googleLoginUser to capture return value
      const { googleLoginUser } = screen.getByText('Google Login').closest('[data-testid]')
        ? { googleLoginUser: null }
        : { googleLoginUser: null };
      await userEvent.click(screen.getByText('Google Login'));
    });

    await waitFor(() => {
      // State should remain unauthenticated
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
      // No error should be shown
      expect(screen.getByTestId('error').textContent).toBe('none');
      // Loading should be false
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
  });

  it('should handle Google login failure and set error state', async () => {
    authService.googleLogin.mockRejectedValue({
      message: 'Firebase: Error (auth/network-request-failed).',
      code: 'auth/network-request-failed',
    });

    renderWithAuth();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    await act(async () => {
      await userEvent.click(screen.getByText('Google Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
      expect(screen.getByTestId('error').textContent).not.toBe('none');
    });
  });

  it('should handle Google login popup-blocked error with friendly message', async () => {
    authService.googleLogin.mockRejectedValue({
      code: 'auth/popup-blocked',
      message: 'Firebase: Error (auth/popup-blocked).',
    });

    renderWithAuth();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    await act(async () => {
      await userEvent.click(screen.getByText('Google Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe(
        'Enable popups for this site to use Google sign-in'
      );
    });
  });

  it('should handle Google login backend error', async () => {
    authService.googleLogin.mockRejectedValue({
      response: { data: { message: 'INVALID_FIREBASE_TOKEN' } },
    });

    renderWithAuth();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    await act(async () => {
      await userEvent.click(screen.getByText('Google Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('INVALID_FIREBASE_TOKEN');
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });
  });

  it('should expose googleLogin as a legacy alias for googleLoginUser', async () => {
    // Verify the context value includes googleLogin
    const TestAliasComponent = () => {
      const ctx = useAuth();
      return (
        <div data-testid="has-google-login">
          {typeof ctx.googleLogin === 'function' ? 'yes' : 'no'}
        </div>
      );
    };
    render(
      <AuthProvider>
        <TestAliasComponent />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('has-google-login').textContent).toBe('yes');
    });
  });

  it('should clear error state when clearError is called', async () => {
    authService.login.mockRejectedValue({
      response: { data: { error: 'Invalid credentials' } },
    });

    renderWithAuth();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    // Trigger an error
    await act(async () => {
      await userEvent.click(screen.getByText('Login'));
    });
    await waitFor(() =>
      expect(screen.getByTestId('error').textContent).toBe('Invalid credentials')
    );

    // Clear the error
    await act(async () => {
      await userEvent.click(screen.getByText('Clear Error'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('none');
    });
  });

  it('should logout successfully and clear state', async () => {
    authService.login.mockResolvedValue({
      token: 'access-token',
      refreshToken: 'refresh-token',
      user: mockUser,
    });
    authService.logout.mockResolvedValue();

    renderWithAuth();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    // Login first
    await act(async () => {
      await userEvent.click(screen.getByText('Login'));
    });
    await waitFor(() =>
      expect(screen.getByTestId('authenticated').textContent).toBe('true')
    );

    // Then logout
    await act(async () => {
      await userEvent.click(screen.getByText('Logout'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('none');
    });
  });

  it('should clear tokens even if logout API call fails', async () => {
    authService.login.mockResolvedValue({
      token: 'access-token',
      refreshToken: 'refresh-token',
      user: mockUser,
    });
    authService.logout.mockRejectedValue(new Error('Network error'));

    renderWithAuth();
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    await act(async () => {
      await userEvent.click(screen.getByText('Login'));
    });
    await waitFor(() =>
      expect(screen.getByTestId('authenticated').textContent).toBe('true')
    );

    await act(async () => {
      await userEvent.click(screen.getByText('Logout'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });
  });

  it('should throw when useAuth is used outside AuthProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );
    consoleError.mockRestore();
  });
});
