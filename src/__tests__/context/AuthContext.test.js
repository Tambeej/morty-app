/**
 * Tests for AuthContext provider and useAuth hook.
 */
import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../context/AuthContext';

// Mock services
jest.mock('../../services/authService', () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  getMe: jest.fn(),
}));

jest.mock('../../utils/storage', () => ({
  getStoredToken: jest.fn(() => null),
  getStoredRefreshToken: jest.fn(() => null),
  getStoredUser: jest.fn(() => null),
  setStoredToken: jest.fn(),
  setStoredRefreshToken: jest.fn(),
  setStoredUser: jest.fn(),
  clearStoredTokens: jest.fn(),
  isAuthenticated: jest.fn(() => false),
}));

import * as authService from '../../services/authService';
import * as storage from '../../utils/storage';

// Test component that uses useAuth
const TestComponent = () => {
  const { user, isAuthenticated, isLoading, error, loginUser, logoutUser } = useAuth();
  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="authenticated">{String(isAuthenticated)}</div>
      <div data-testid="user">{user ? user.email : 'none'}</div>
      <div data-testid="error">{error || 'none'}</div>
      <button onClick={() => loginUser({ email: 'test@test.com', password: 'Password1' })}>
        Login
      </button>
      <button onClick={logoutUser}>Logout</button>
    </div>
  );
};

const renderWithAuth = () =>
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storage.isAuthenticated.mockReturnValue(false);
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

  it('should login successfully', async () => {
    const mockUser = { id: '1', email: 'test@test.com', fullName: 'Test User' };
    authService.login.mockResolvedValue({ token: 'tok', refreshToken: 'ref', user: mockUser });

    renderWithAuth();
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    await act(async () => {
      userEvent.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
      expect(screen.getByTestId('user').textContent).toBe('test@test.com');
    });
  });

  it('should handle login failure', async () => {
    authService.login.mockRejectedValue({
      response: { data: { error: 'Invalid credentials' } },
    });

    renderWithAuth();
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    await act(async () => {
      userEvent.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('Invalid credentials');
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });
  });

  it('should logout successfully', async () => {
    const mockUser = { id: '1', email: 'test@test.com' };
    authService.login.mockResolvedValue({ token: 'tok', refreshToken: 'ref', user: mockUser });
    authService.logout.mockResolvedValue();

    renderWithAuth();
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    // Login first
    await act(async () => { userEvent.click(screen.getByText('Login')); });
    await waitFor(() => expect(screen.getByTestId('authenticated').textContent).toBe('true'));

    // Then logout
    await act(async () => { userEvent.click(screen.getByText('Logout')); });
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('none');
    });
  });

  it('should throw when useAuth is used outside AuthProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );
    consoleError.mockRestore();
  });
});
