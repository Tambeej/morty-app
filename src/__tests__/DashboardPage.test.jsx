import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../components/common/Toast';
import { AuthContext } from '../context/AuthContext';
import DashboardPage from '../pages/DashboardPage';

// Mock recharts to avoid canvas issues in tests
jest.mock('recharts', () => ({
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}));

jest.mock('../services/api', () => ({
  get: jest.fn(),
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
}));

import api from '../services/api';

const mockUser = { id: '1', email: 'yoav@example.com', fullName: 'Yoav Cohen' };

const renderWithProviders = (ui) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user: mockUser, token: 'test-token', loading: false, logout: jest.fn() }}>
        <ToastProvider>{ui}</ToastProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  );

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders welcome message with user name', async () => {
    api.get.mockResolvedValue({ data: { data: { stats: {} }, offers: [] } });
    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Yoav/i)).toBeInTheDocument();
    });
  });

  it('renders stat cards', async () => {
    api.get.mockResolvedValue({ data: { data: { stats: {} } } });
    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Best Rate')).toBeInTheDocument();
      expect(screen.getByText('Potential Savings')).toBeInTheDocument();
      expect(screen.getByText('Active Offers')).toBeInTheDocument();
    });
  });

  it('renders chart section', async () => {
    api.get.mockResolvedValue({ data: { data: { stats: {} } } });
    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Monthly Payment Comparison')).toBeInTheDocument();
    });
  });

  it('shows empty state when no offers', async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: null } })
      .mockResolvedValueOnce({ data: { data: { stats: {} } } })
      .mockResolvedValueOnce({ data: { data: { offers: [], pagination: {} } } });
    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText(/No offers uploaded yet/i)).toBeInTheDocument();
    });
  });
});
