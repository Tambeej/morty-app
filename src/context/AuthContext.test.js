/**
 * AuthContext.test.js - Tests for the AuthContext.
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock api module
jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

const api = require('../services/api').default;

function TestConsumer() {
  const { user, loading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.email : 'null'}</span>
      <button
        data-testid="login-btn"
        onClick={() => login({ email: 'test@test.com', password: 'password123' })}
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
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('starts with loading=true then resolves to loading=false', async () => {
    api.get.mockRejectedValueOnce(new Error('No token'));

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('login sets user state', async () => {
    api.get.mockRejectedValueOnce(new Error('No token'));
    api.post.mockResolvedValueOnce({
      data: {
        token: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: '1', email: 'test@test.com' },
      },
    });

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    expect(screen.getByTestId('user').textContent).toBe('test@test.com');
    expect(localStorage.getItem('morty_token')).toBe('access-token');
  });

  it('exposes login, register, logout functions', async () => {
    api.get.mockRejectedValueOnce(new Error('No token'));

    let authValue;
    function Capture() {
      authValue = useAuth();
      return null;
    }

    await act(async () => {
      render(
        <AuthProvider>
          <Capture />
        </AuthProvider>
      );
    });

    expect(typeof authValue.login).toBe('function');
    expect(typeof authValue.register).toBe('function');
    expect(typeof authValue.logout).toBe('function');
  });
});
