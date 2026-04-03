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
  normalizeUser: vi.fn((user) => ({
    id: user.id || user._id || '',
    email: user.email || '',
    phone: user.phone || '',
    verified: user.verified || false,
  })),
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
});
