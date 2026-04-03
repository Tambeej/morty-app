/**
 * LoginForm.test.jsx
 * Tests for the LoginForm component.
 * Uses Vitest (vi) — aligned with the project's test setup.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginForm from '../LoginForm';
import { AuthProvider } from '../../../context/AuthContext';
import { ToastProvider } from '../../common/Toast';

// Mock the api module
vi.mock('../../../services/api', () => ({
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

// Mock authService to prevent real API calls
vi.mock('../../../services/authService', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getMe: vi.fn(),
  googleLogin: vi.fn(),
  normalizeUser: vi.fn((user) => ({
    id: user.id || user._id || '',
    email: user.email || '',
    phone: user.phone || '',
    verified: user.verified || false,
  })),
}));

// Mock Firebase module to prevent initialization errors in tests
vi.mock('../../../firebase', () => ({
  auth: {},
  googleProvider: {},
}));

// Mock storage utilities
vi.mock('../../../utils/storage', () => ({
  getStoredToken: vi.fn(() => null),
  getStoredRefreshToken: vi.fn(() => null),
  getStoredUser: vi.fn(() => null),
  setStoredToken: vi.fn(),
  setStoredRefreshToken: vi.fn(),
  setStoredUser: vi.fn(),
  clearStoredTokens: vi.fn(),
  isAuthenticated: vi.fn(() => false),
}));

const renderLoginForm = () => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password fields', () => {
    renderLoginForm();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    renderLoginForm();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders Google sign-in button', () => {
    renderLoginForm();
    expect(
      screen.getByRole('button', { name: /sign in with google/i })
    ).toBeInTheDocument();
  });

  it('renders "or" divider between sign-in and Google button', () => {
    renderLoginForm();
    expect(screen.getByText('or')).toBeInTheDocument();
  });

  it('shows validation error for empty email on submit', async () => {
    renderLoginForm();
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    renderLoginForm();
    const emailInput = screen.getByPlaceholderText('you@example.com');
    await userEvent.type(emailInput, 'invalid-email');
    fireEvent.blur(emailInput);
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('shows validation error for short password', async () => {
    renderLoginForm();
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    await userEvent.type(passwordInput, 'short');
    fireEvent.blur(passwordInput);
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('shows register link', () => {
    renderLoginForm();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('shows forgot password link', () => {
    renderLoginForm();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    renderLoginForm();
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByLabelText('Show password');
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await userEvent.click(screen.getByLabelText('Hide password'));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('calls googleLogin when Google button is clicked', async () => {
    const authService = await import('../../../services/authService');
    // Simulate user closing the popup (null return = silent no-op)
    authService.googleLogin.mockResolvedValueOnce(null);

    renderLoginForm();
    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(authService.googleLogin).toHaveBeenCalledTimes(1);
    });
  });

  it('Google button shows loading state while signing in', async () => {
    const authService = await import('../../../services/authService');
    // Never resolves during this test — keeps button in loading state
    authService.googleLogin.mockImplementationOnce(() => new Promise(() => {}));

    renderLoginForm();
    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });
  });
});
