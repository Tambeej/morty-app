/**
 * RegisterForm.test.jsx
 * Tests for the RegisterForm component.
 * Uses Vitest (vi) — aligned with the project's test setup.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterForm from '../RegisterForm';
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

const renderRegisterForm = () => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <RegisterForm />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all required fields', () => {
    renderRegisterForm();
    expect(screen.getByPlaceholderText('Yoav Cohen')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('050-1234567')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/min. 8 characters/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repeat your password')).toBeInTheDocument();
  });

  it('renders create account button', () => {
    renderRegisterForm();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('renders Google sign-up button', () => {
    renderRegisterForm();
    expect(
      screen.getByRole('button', { name: /sign in with google/i })
    ).toBeInTheDocument();
  });

  it('Google button has correct label "Sign up with Google"', () => {
    renderRegisterForm();
    expect(screen.getByText('Sign up with Google')).toBeInTheDocument();
  });

  it('renders "or" divider between Google button and form fields', () => {
    renderRegisterForm();
    expect(screen.getByText('or')).toBeInTheDocument();
  });

  it('Google button appears before form fields (reduces friction)', () => {
    renderRegisterForm();
    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    const fullNameInput = screen.getByPlaceholderText('Yoav Cohen');
    // Google button should appear before the full name input in the DOM
    expect(
      googleButton.compareDocumentPosition(fullNameInput) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('shows validation error for empty full name', async () => {
    renderRegisterForm();
    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid phone number', async () => {
    renderRegisterForm();
    const phoneInput = screen.getByPlaceholderText('050-1234567');
    await userEvent.type(phoneInput, '12345');
    fireEvent.blur(phoneInput);
    await waitFor(() => {
      expect(
        screen.getByText(/valid Israeli phone number/i)
      ).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    renderRegisterForm();
    const emailInput = screen.getByPlaceholderText('you@example.com');
    await userEvent.type(emailInput, 'not-an-email');
    fireEvent.blur(emailInput);
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('shows validation error when passwords do not match', async () => {
    renderRegisterForm();
    const passwordInput = screen.getByPlaceholderText(/min. 8 characters/i);
    const confirmInput = screen.getByPlaceholderText('Repeat your password');

    await userEvent.type(passwordInput, 'Password123');
    await userEvent.type(confirmInput, 'DifferentPass123');
    fireEvent.blur(confirmInput);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('shows sign in link', () => {
    renderRegisterForm();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('accepts valid Israeli phone numbers', async () => {
    renderRegisterForm();
    const phoneInput = screen.getByPlaceholderText('050-1234567');
    await userEvent.type(phoneInput, '050-1234567');
    fireEvent.blur(phoneInput);
    await waitFor(() => {
      expect(
        screen.queryByText(/valid Israeli phone number/i)
      ).not.toBeInTheDocument();
    });
  });

  it('calls googleLogin when Google button is clicked', async () => {
    const authService = await import('../../../services/authService');
    // Simulate user closing the popup (null return = silent no-op)
    authService.googleLogin.mockResolvedValueOnce(null);

    renderRegisterForm();
    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(authService.googleLogin).toHaveBeenCalledTimes(1);
    });
  });

  it('Google button shows loading state while signing up', async () => {
    const authService = await import('../../../services/authService');
    // Never resolves during this test — keeps button in loading state
    authService.googleLogin.mockImplementationOnce(() => new Promise(() => {}));

    renderRegisterForm();
    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });
  });
});
