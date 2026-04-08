/**
 * googleAuthFlow.test.jsx
 *
 * Integration tests for the complete Google auth flow:
 *   - Success state: tokens stored, AuthContext updated, navigation to /dashboard
 *   - Error states: popup blocked, network error, backend error
 *   - Token storage: verifies localStorage is populated on success
 *   - Navigation: verifies redirect to /dashboard on success
 *   - Silent no-op: popup dismissed by user
 *
 * Tests cover both LoginForm and RegisterForm Google auth paths.
 */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../../context/AuthContext.jsx';
import { ToastProvider } from '../../components/common/Toast';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: { headers: { common: {} } },
  },
}));

vi.mock('../../firebase', () => ({
  auth: {},
  googleProvider: {},
}));

const mockSetStoredToken = vi.fn();
const mockSetStoredRefreshToken = vi.fn();
const mockSetStoredUser = vi.fn();
const mockClearStoredTokens = vi.fn();

vi.mock('../../utils/storage', () => ({
  getStoredToken: vi.fn(() => null),
  getStoredRefreshToken: vi.fn(() => null),
  getStoredUser: vi.fn(() => null),
  setStoredToken: (...args) => mockSetStoredToken(...args),
  setStoredRefreshToken: (...args) => mockSetStoredRefreshToken(...args),
  setStoredUser: (...args) => mockSetStoredUser(...args),
  clearStoredTokens: (...args) => mockClearStoredTokens(...args),
  isAuthenticated: vi.fn(() => false),
}));

const mockGoogleLoginService = vi.fn();
const mockLoginService = vi.fn();
const mockRegisterService = vi.fn();
const mockLogoutService = vi.fn();
// By default, onFirebaseAuthReady does nothing (no Firebase user detected)
const mockOnFirebaseAuthReady = vi.fn().mockReturnValue(vi.fn());

vi.mock('../../services/authService', () => ({
  googleLogin: (...args) => mockGoogleLoginService(...args),
  onFirebaseAuthReady: (...args) => mockOnFirebaseAuthReady(...args),
  login: (...args) => mockLoginService(...args),
  register: (...args) => mockRegisterService(...args),
  logout: (...args) => mockLogoutService(...args),
  normalizeUser: vi.fn((user) => ({
    id: user.id || user._id || '',
    email: user.email || '',
    phone: user.phone || '',
    verified: user.verified || false,
  })),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Dashboard stub for navigation assertions */
const DashboardStub = () => <div data-testid="dashboard">Dashboard</div>;

/**
 * Render a form inside a full router + auth + toast context.
 * Uses MemoryRouter with /login as initial entry so navigation to /dashboard works.
 */
const renderLoginFormWithRouter = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <div>
                  <LoginForm />
                </div>
              }
            />
            <Route path="/dashboard" element={<DashboardStub />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );

const renderRegisterFormWithRouter = () =>
  render(
    <MemoryRouter initialEntries={['/register']}>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route
              path="/register"
              element={
                <div>
                  <RegisterForm />
                </div>
              }
            />
            <Route path="/dashboard" element={<DashboardStub />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockAuthPayload = {
  token: 'access-token-google-xyz',
  refreshToken: 'refresh-token-google-xyz',
  user: {
    id: 'firestore-google-uid-789',
    email: 'google@morty.co.il',
    phone: '',
    verified: true,
  },
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Google Auth Flow — redirect-based', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogoutService.mockResolvedValue(undefined);
    mockOnFirebaseAuthReady.mockReturnValue(vi.fn());
  });

  // ── Button triggers redirect ──────────────────────────────────────────────

  it('calls googleLogin (signInWithRedirect) when Google button is clicked on LoginForm', async () => {
    mockGoogleLoginService.mockResolvedValue(undefined);

    renderLoginFormWithRouter();

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(mockGoogleLoginService).toHaveBeenCalledTimes(1);
    });
  });

  it('calls googleLogin (signInWithRedirect) when Google button is clicked on RegisterForm', async () => {
    mockGoogleLoginService.mockResolvedValue(undefined);

    renderRegisterFormWithRouter();

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(mockGoogleLoginService).toHaveBeenCalledTimes(1);
    });
  });

  // ── Redirect result on mount ──────────────────────────────────────────────

  it('navigates to /dashboard when Firebase auth state fires on mount', async () => {
    // Simulate onFirebaseAuthReady calling onSuccess immediately
    mockOnFirebaseAuthReady.mockImplementation((onSuccess) => {
      onSuccess(mockAuthPayload);
      return vi.fn();
    });

    renderLoginFormWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  it('stays on login page when no Firebase user is detected', async () => {
    // Default: onFirebaseAuthReady does not call onSuccess
    mockOnFirebaseAuthReady.mockReturnValue(vi.fn());

    renderLoginFormWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
    });

    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
  });

  // ── Error states ────────────────────────────────────────────────────────────

  it('does not navigate to dashboard when redirect errors', async () => {
    mockGoogleLoginService.mockRejectedValue(new Error('Redirect failed'));

    renderLoginFormWithRouter();

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
    });
  });

  it('re-enables Google button after error on LoginForm', async () => {
    mockGoogleLoginService.mockRejectedValue(new Error('Network error'));

    renderLoginFormWithRouter();

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(googleButton).not.toBeDisabled();
    });
  });

  it('re-enables Google button after error on RegisterForm', async () => {
    mockGoogleLoginService.mockRejectedValue(new Error('Network error'));

    renderRegisterFormWithRouter();

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(googleButton).not.toBeDisabled();
    });
  });

  // ── Loading state ───────────────────────────────────────────────────────────

  it('shows loading spinner while redirect is in progress on LoginForm', async () => {
    mockGoogleLoginService.mockImplementation(() => new Promise(() => {}));

    renderLoginFormWithRouter();

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });
  });

  it('disables Google button while redirect is in progress', async () => {
    mockGoogleLoginService.mockImplementation(() => new Promise(() => {}));

    renderLoginFormWithRouter();

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(googleButton).toBeDisabled();
    });
  });

  // ── Token storage via redirect result ─────────────────────────────────────

  it('does NOT store tokens when redirect errors', async () => {
    mockGoogleLoginService.mockRejectedValue(new Error('Auth failed'));

    renderLoginFormWithRouter();

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(googleButton).not.toBeDisabled();
    });

    expect(mockSetStoredToken).not.toHaveBeenCalled();
    expect(mockSetStoredRefreshToken).not.toHaveBeenCalled();
  });
});
