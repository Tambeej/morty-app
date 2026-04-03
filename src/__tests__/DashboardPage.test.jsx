/**
 * DashboardPage.test.jsx
 * Tests for the DashboardPage component.
 * Uses Firestore data shapes: string IDs, ISO timestamps, new stats shape.
 */

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

/**
 * Mock user using Firestore shape: { id: string, email, phone, verified }
 * No _id, no fullName — display name derived from email.
 */
const mockUser = {
  id: 'firestore-uid-abc123',
  email: 'yoav@example.com',
  phone: '050-0000000',
  verified: true,
};

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

  it('renders welcome message with user email prefix', async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          financials: null,
          recentOffers: [],
          stats: { totalOffers: 0, savingsTotal: 0 },
        },
      },
    });
    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      // User has no name, so falls back to email prefix 'yoav'
      expect(screen.getByText(/Welcome back, yoav/i)).toBeInTheDocument();
    });
  });

  it('renders stat cards', async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          financials: null,
          recentOffers: [],
          stats: { totalOffers: 3, savingsTotal: 45000 },
        },
      },
    });
    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Best Rate')).toBeInTheDocument();
      expect(screen.getByText('Potential Savings')).toBeInTheDocument();
      expect(screen.getByText('Active Offers')).toBeInTheDocument();
    });
  });

  it('renders chart section when offers exist', async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          financials: null,
          recentOffers: [
            {
              id: 'offer-id-xyz',
              status: 'analyzed',
              extractedData: { bank: 'הפועלים', amount: 1200000, rate: 3.5, term: 240 },
              analysis: { recommendedRate: 3.1, savings: 45000 },
              createdAt: '2026-04-03T02:16:00.000Z',
            },
          ],
          stats: { totalOffers: 1, savingsTotal: 45000 },
        },
      },
    });
    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Monthly Payment Comparison')).toBeInTheDocument();
    });
  });

  it('shows empty state when no offers', async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          financials: null,
          recentOffers: [],
          stats: { totalOffers: 0, savingsTotal: 0 },
        },
      },
    });
    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText(/No offers uploaded yet/i)).toBeInTheDocument();
    });
  });

  it('displays stats.totalOffers count', async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          financials: null,
          recentOffers: [],
          stats: { totalOffers: 5, savingsTotal: 0 },
        },
      },
    });
    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });
});
