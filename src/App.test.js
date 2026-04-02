/**
 * App.test.js - Basic smoke tests for the App component.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the service worker registration
jest.mock('./serviceWorkerRegistration', () => ({
  register: jest.fn(),
  unregister: jest.fn(),
}));

// Mock lazy-loaded pages
jest.mock('./pages/LoginPage', () => ({
  __esModule: true,
  default: () => <div data-testid="login-page">Login Page</div>,
}));

jest.mock('./pages/RegisterPage', () => ({
  __esModule: true,
  default: () => <div data-testid="register-page">Register Page</div>,
}));

jest.mock('./pages/DashboardPage', () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));

jest.mock('./pages/FinancialProfilePage', () => ({
  __esModule: true,
  default: () => <div data-testid="profile-page">Profile Page</div>,
}));

jest.mock('./pages/UploadPage', () => ({
  __esModule: true,
  default: () => <div data-testid="upload-page">Upload Page</div>,
}));

jest.mock('./pages/AnalysisPage', () => ({
  __esModule: true,
  default: () => <div data-testid="analysis-page">Analysis Page</div>,
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    defaults: { headers: { common: {} } },
  })),
  post: jest.fn(),
}));

describe('App', () => {
  it('renders without crashing', async () => {
    const App = require('./App').default;
    render(<App />);
    // App renders (redirects to /login since no auth)
    expect(document.body).toBeTruthy();
  });
});
