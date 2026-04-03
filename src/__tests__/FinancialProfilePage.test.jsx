/**
 * FinancialProfilePage.test.jsx
 * Tests for the FinancialProfilePage component.
 * Uses Vitest (vi) — aligned with the project's test setup.
 * Uses Firestore data shapes and updated API endpoints.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToastProvider } from '../components/common/Toast';
import AuthContext from '../context/AuthContext';
import FinancialProfilePage from '../pages/FinancialProfilePage';

// Mock react-hot-toast (used by FinancialProfilePage)
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  success: vi.fn(),
  error: vi.fn(),
}));

// Mock the api module (default export = axios instance)
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

import api from '../services/api';

/**
 * Mock user using Firestore shape: { id: string, email, phone, verified }
 */
const mockUser = {
  id: 'firestore-uid-abc123',
  email: 'test@example.com',
  phone: '050-0000000',
  verified: true,
};

const renderWithProviders = (ui) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user: mockUser, token: 'test-token', loading: false, logout: vi.fn() }}>
        <ToastProvider>{ui}</ToastProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  );

describe('FinancialProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('loads existing financial data from Firestore shape', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: {
          income: 15000,
          additionalIncome: 2000,
          expenses: { housing: 3000, loans: 1000, other: 500 },
          assets: { savings: 50000, investments: 20000 },
          debts: [],
          updatedAt: '2026-04-03T02:16:00.000Z',
        },
      },
    });
    renderWithProviders(<FinancialProfilePage />);
    await waitFor(() => {
      // Income field should show 15000
      const incomeInput = screen.getByDisplayValue('15000');
      expect(incomeInput).toBeInTheDocument();
    });
  });

  it('shows progress bar', async () => {
    api.get.mockResolvedValueOnce({ data: { data: null } });
    renderWithProviders(<FinancialProfilePage />);
    await waitFor(() => {
      expect(screen.getByText(/Profile Completion/i)).toBeInTheDocument();
    });
  });

  it('submits form and calls PUT /profile', async () => {
    api.get.mockResolvedValueOnce({ data: { data: null } });
    api.put.mockResolvedValueOnce({ data: { data: { income: 0 } } });
    renderWithProviders(<FinancialProfilePage />);

    await waitFor(() => screen.getByText('Financial Profile'));

    const saveBtn = screen.getByRole('button', { name: /save profile/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        '/profile',
        expect.objectContaining({ income: 0 })
      );
    });
  });

  it('handles API error gracefully', async () => {
    api.get.mockRejectedValueOnce(new Error('Network error'));
    renderWithProviders(<FinancialProfilePage />);
    // Should still render the form (starts fresh on error)
    await waitFor(() => {
      expect(screen.getByText('Financial Profile')).toBeInTheDocument();
    });
  });

  it('shows null-safe defaults for missing nested fields', async () => {
    // Firestore may return partial data — ensure no crashes
    api.get.mockResolvedValueOnce({
      data: {
        data: {
          income: 10000,
          // No expenses, assets, or debts
        },
      },
    });
    renderWithProviders(<FinancialProfilePage />);
    await waitFor(() => {
      expect(screen.getByText('Financial Profile')).toBeInTheDocument();
    });
  });
});
