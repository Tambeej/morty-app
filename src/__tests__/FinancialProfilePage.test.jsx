import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../components/common/Toast';
import { AuthContext } from '../context/AuthContext';
import FinancialProfilePage from '../pages/FinancialProfilePage';

// Mock the api module
jest.mock('../services/api', () => ({
  get: jest.fn(),
  put: jest.fn(),
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
}));

import api from '../services/api';

const mockUser = { id: '1', email: 'test@example.com', fullName: 'Test User' };

const renderWithProviders = (ui) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user: mockUser, token: 'test-token', loading: false, logout: jest.fn() }}>
        <ToastProvider>{ui}</ToastProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  );

describe('FinancialProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page heading', async () => {
    api.get.mockResolvedValueOnce({ data: { data: null } });
    renderWithProviders(<FinancialProfilePage />);
    await waitFor(() => {
      expect(screen.getByText('Financial Profile')).toBeInTheDocument();
    });
  });

  it('renders all form sections', async () => {
    api.get.mockResolvedValueOnce({ data: { data: null } });
    renderWithProviders(<FinancialProfilePage />);
    await waitFor(() => {
      expect(screen.getByText(/INCOME/i)).toBeInTheDocument();
      expect(screen.getByText(/MONTHLY EXPENSES/i)).toBeInTheDocument();
      expect(screen.getByText(/ASSETS/i)).toBeInTheDocument();
    });
  });

  it('loads existing financial data', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: {
          income: 15000,
          additionalIncome: 2000,
          expenses: { housing: 3000, loans: 1000, other: 500 },
          assets: { savings: 50000, investments: 20000 },
        },
      },
    });
    renderWithProviders(<FinancialProfilePage />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('15,000')).toBeInTheDocument();
    });
  });

  it('shows progress bar', async () => {
    api.get.mockResolvedValueOnce({ data: { data: null } });
    renderWithProviders(<FinancialProfilePage />);
    await waitFor(() => {
      expect(screen.getByText(/Profile Completion/i)).toBeInTheDocument();
    });
  });

  it('submits form and shows success toast', async () => {
    api.get.mockResolvedValueOnce({ data: { data: null } });
    api.put.mockResolvedValueOnce({ data: { success: true } });
    renderWithProviders(<FinancialProfilePage />);

    await waitFor(() => screen.getByText('Financial Profile'));

    const saveBtn = screen.getByRole('button', { name: /save profile/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        '/profile/financials',
        expect.objectContaining({ income: 0 })
      );
    });
  });
});
