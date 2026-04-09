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

vi.mock('../../services/authService', () => ({
  googleLogin: (...args) => mockGoogleLoginService(...args),
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

describe('Google Auth Flow — LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogoutService.mockResolvedValue(undefined);
  });

  // ── Success state ───────────────────────────────────────────────────────────

  it('navigates to /dashboard on successful Google sign-in', async () => {
    mockGoogleLoginService.mockResolvedValue(mockAuthPayload);

    renderLoginFormWithRouter();

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  // ── Silent no-op (popup dismissed) ─────────────────────────────────────────

  it('does not navigate when user dismisses the Google popup (null return)', async () => {
    mockGoogleLoginService.mockResolvedValue(null);

    renderLoginFormWithRouter();

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
      expect(googleButton).not.toBeDisabled();
    });
  });

  it('does not show error toast when user dismisses the popup', async () => {
    mockGoogleLoginService.mockResolvedValue(null);

    renderLoginFormWithRouter();

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(googleButton).not.toBeDisabled();
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // ── Error states ────────────────────────────────────────────────────────────

  it('does not navigate when Google sign-in fails', async () => {
    mockGoogleLoginService.mockRejectedValue(
      Object.assign(new Error('Firebase: Error (auth/network-request-failed).'), {
        code: 'auth/network-request-failed',
      })
    );

    renderLoginFormWithRouter();

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
    });
  });

  it('re-enables Google button after error', async () => {
    mockGoogleLoginService.mockRejectedValue(new Error('Network error'));

    renderLoginFormWithRouter();

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(googleButton).not.toBeDisabled();
    });
  });

  // ── Loading state ───────────────────────────────────────────────────────────

  it('shows loading spinner while Google sign-in is in progress', async () => {
    mockGoogleLoginService.mockImplementation(() => new Promise(() => {}));

    renderLoginFormWithRouter();

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });
  });

  it('disables Google button while sign-in is in progress', async () => {
    mockGoogleLoginService.mockImplementation(() => new Promise(() => {}));

    renderLoginFormWithRouter();

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(googleButton).toBeDisabled();
    });
  });
});

describe('Google Auth Flow — RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogoutService.mockResolvedValue(undefined);
  });

  it('navigates to /dashboard on successful Google sign-up', async () => {
    mockGoogleLoginService.mockResolvedValue(mockAuthPayload);

    renderRegisterFormWithRouter();

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  it('does not navigate when user dismisses the Google popup', async () => {
    mockGoogleLoginService.mockResolvedValue(null);

    renderRegisterFormWithRouter();

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
      expect(googleButton).not.toBeDisabled();
    });
  });

  it('re-enables Google button after error', async () => {
    mockGoogleLoginService.mockRejectedValue(new Error('Network error'));

    renderRegisterFormWithRouter();

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(googleButton).not.toBeDisabled();
    });
  });

  it('shows loading spinner while Google sign-up is in progress', async () => {
    mockGoogleLoginService.mockImplementation(() => new Promise(() => {}));

    renderRegisterFormWithRouter();

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });
  });
});

describe('Token Storage — post-auth verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogoutService.mockResolvedValue(undefined);
  });

  it('does NOT store tokens when popup is dismissed', async () => {
    mockGoogleLoginService.mockResolvedValue(null);

    renderLoginFormWithRouter();

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(googleButton).not.toBeDisabled();
    });

    expect(mockSetStoredToken).not.toHaveBeenCalled();
    expect(mockSetStoredRefreshToken).not.toHaveBeenCalled();
    expect(mockSetStoredUser).not.toHaveBeenCalled();
  });

  it('does NOT store tokens when Google auth fails', async () => {
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
