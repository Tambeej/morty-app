/**
 * PaywallSuccessPage.test.jsx
 * Tests for the post-payment success page.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock paymentService
const mockVerifyPaymentStatus = jest.fn();
jest.mock('../services/paymentService', () => ({
  verifyPaymentStatus: (...args) => mockVerifyPaymentStatus(...args),
}));

// Mock portfolioService
jest.mock('../services/portfolioService', () => ({
  getStoredSelectedPortfolio: jest.fn(() => ({
    id: 'portfolio-1',
    name: 'Market Standard',
    nameHe: 'שוק סטנדרטי',
    termYears: 30,
    monthlyRepayment: 5500,
  })),
}));

// Mock formatters
jest.mock('../utils/formatters', () => ({
  formatCurrency: (amount) => `₪${amount?.toLocaleString() || '0'}`,
}));

import PaywallSuccessPage from '../pages/PaywallSuccessPage';

function renderSuccessPage(search = '?session_id=sess_123&portfolio_id=p-1') {
  return render(
    <MemoryRouter initialEntries={[`/paywall/success${search}`]}>
      <Routes>
        <Route path="/paywall/success" element={<PaywallSuccessPage />} />
        <Route path="/upload" element={<div>Upload Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/paywall" element={<div>Paywall</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PaywallSuccessPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    mockVerifyPaymentStatus.mockReturnValue(new Promise(() => {})); // never resolves
    renderSuccessPage();
    expect(screen.getByText('מאמת את התשלום...')).toBeInTheDocument();
  });

  it('shows success state when payment is verified', async () => {
    mockVerifyPaymentStatus.mockResolvedValue({ paid: true, status: 'complete' });
    renderSuccessPage();
    await waitFor(() => {
      expect(screen.getByText('התשלום הושלם בהצלחה!')).toBeInTheDocument();
    });
  });

  it('shows portfolio name on success', async () => {
    mockVerifyPaymentStatus.mockResolvedValue({ paid: true, status: 'complete' });
    renderSuccessPage();
    await waitFor(() => {
      expect(screen.getByText('שוק סטנדרטי')).toBeInTheDocument();
    });
  });

  it('shows upload CTA on success', async () => {
    mockVerifyPaymentStatus.mockResolvedValue({ paid: true, status: 'complete' });
    renderSuccessPage();
    await waitFor(() => {
      expect(screen.getByText('העלה הצעה בנקאית')).toBeInTheDocument();
    });
  });

  it('shows error state when payment is not verified', async () => {
    mockVerifyPaymentStatus.mockResolvedValue({ paid: false, status: 'pending' });
    renderSuccessPage();
    await waitFor(() => {
      expect(screen.getByText('שגיאה באימות התשלום')).toBeInTheDocument();
    });
  });

  it('shows error state when API call fails', async () => {
    mockVerifyPaymentStatus.mockRejectedValue(new Error('Network error'));
    renderSuccessPage();
    await waitFor(() => {
      expect(screen.getByText('שגיאה באימות התשלום')).toBeInTheDocument();
    });
  });

  it('shows error when session_id is missing', async () => {
    renderSuccessPage('?portfolio_id=p-1'); // no session_id
    await waitFor(() => {
      expect(screen.getByText('שגיאה באימות התשלום')).toBeInTheDocument();
    });
  });

  it('renders Morty logo in navbar', () => {
    mockVerifyPaymentStatus.mockReturnValue(new Promise(() => {}));
    renderSuccessPage();
    expect(screen.getByText('Morty')).toBeInTheDocument();
  });
});
