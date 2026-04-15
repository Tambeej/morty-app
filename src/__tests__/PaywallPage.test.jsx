/**
 * PaywallPage.test.jsx
 * Tests for the PaywallPage component.
 *
 * Tests cover:
 *   - Rendering the split layout
 *   - Feature list display
 *   - Signup form for unauthenticated users
 *   - Payment form for authenticated users
 *   - Portfolio summary display
 *   - Navigation back to compare page
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock AuthContext
const mockUseAuth = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

// Mock paymentService
jest.mock('../services/paymentService', () => ({
  createCheckoutSession: jest.fn(),
  verifyPaymentStatus: jest.fn(),
  getStripePublishableKey: jest.fn(() => 'pk_test_mock'),
}));

// Mock portfolioService
jest.mock('../services/portfolioService', () => ({
  getStoredSelectedPortfolio: jest.fn(() => ({
    id: 'portfolio-1',
    name: 'Market Standard',
    nameHe: 'שוק סטנדרטי',
    termYears: 30,
    monthlyRepayment: 5500,
    totalCost: 1980000,
    totalInterest: 480000,
  })),
  storeSelectedPortfolio: jest.fn(),
  clearStoredSelectedPortfolio: jest.fn(),
}));

// Mock formatters
jest.mock('../utils/formatters', () => ({
  formatCurrency: (amount) => `₪${amount?.toLocaleString() || '0'}`,
}));

import PaywallPage from '../pages/PaywallPage';

/** Helper to render PaywallPage with router context */
function renderPaywallPage({
  isAuthenticated = false,
  user = null,
  locationState = null,
  search = '',
} = {}) {
  mockUseAuth.mockReturnValue({
    isAuthenticated,
    user,
    registerUser: jest.fn(),
    googleLoginUser: jest.fn(),
  });

  const initialEntry = locationState
    ? { pathname: '/paywall', state: locationState, search }
    : `/paywall${search}`;

  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/paywall" element={<PaywallPage />} />
        <Route path="/wizard/compare" element={<div>Compare Page</div>} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PaywallPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Layout', () => {
    it('renders the navbar with Morty logo', () => {
      renderPaywallPage();
      expect(screen.getByText('Morty')).toBeInTheDocument();
    });

    it('renders the legal disclaimer footer', () => {
      renderPaywallPage();
      expect(
        screen.getByText(/Morty הינו כלי תמיכה בהחלטות בלבד/)
      ).toBeInTheDocument();
    });

    it('renders the feature list panel', () => {
      renderPaywallPage();
      expect(screen.getByText('מה תקבל בניתוח המקצועי')).toBeInTheDocument();
    });

    it('shows the price', () => {
      renderPaywallPage();
      expect(screen.getByText('₪149')).toBeInTheDocument();
    });
  });

  describe('Feature list', () => {
    it('displays all 4 features', () => {
      renderPaywallPage();
      expect(screen.getByText('השוואת הצעה בנקאית')).toBeInTheDocument();
      expect(screen.getByText('טריקי משכנתא')).toBeInTheDocument();
      expect(screen.getByText(/סקריפט מו"מ בעברית/)).toBeInTheDocument();
      expect(screen.getByText('תובנות AI אסטרטגיות')).toBeInTheDocument();
    });

    it('shows trust badges', () => {
      renderPaywallPage();
      expect(screen.getByText('SSL מאובטח')).toBeInTheDocument();
    });
  });

  describe('Portfolio summary', () => {
    it('displays portfolio name from sessionStorage', () => {
      renderPaywallPage();
      // Portfolio name from mock
      expect(screen.getAllByText('שוק סטנדרטי').length).toBeGreaterThan(0);
    });

    it('displays portfolio from location state', () => {
      renderPaywallPage({
        locationState: {
          portfolio: {
            id: 'p-2',
            name: 'Fast Track',
            nameHe: 'מסלול מהיר',
            termYears: 20,
            monthlyRepayment: 7000,
          },
        },
      });
      expect(screen.getAllByText('מסלול מהיר').length).toBeGreaterThan(0);
    });
  });

  describe('Unauthenticated user flow', () => {
    it('shows signup form heading', () => {
      renderPaywallPage({ isAuthenticated: false });
      expect(screen.getByText('הרשמה לניתוח מקצועי')).toBeInTheDocument();
    });

    it('shows email and password fields', () => {
      renderPaywallPage({ isAuthenticated: false });
      expect(screen.getByLabelText('אימייל')).toBeInTheDocument();
      expect(screen.getByLabelText('סיסמה')).toBeInTheDocument();
    });

    it('shows Google signup button', () => {
      renderPaywallPage({ isAuthenticated: false });
      expect(screen.getByText('הרשמה עם Google')).toBeInTheDocument();
    });

    it('shows login link', () => {
      renderPaywallPage({ isAuthenticated: false });
      expect(screen.getByText('כניסה')).toBeInTheDocument();
    });

    it('validates email field on blur', async () => {
      renderPaywallPage({ isAuthenticated: false });
      const emailInput = screen.getByLabelText('אימייל');
      fireEvent.blur(emailInput);
      await waitFor(() => {
        expect(screen.getByText('נדרשת כתובת אימייל')).toBeInTheDocument();
      });
    });

    it('validates password field on blur', async () => {
      renderPaywallPage({ isAuthenticated: false });
      const passwordInput = screen.getByLabelText('סיסמה');
      fireEvent.blur(passwordInput);
      await waitFor(() => {
        expect(screen.getByText('נדרשת סיסמה')).toBeInTheDocument();
      });
    });
  });

  describe('Authenticated user flow', () => {
    it('shows payment form directly for authenticated users', () => {
      renderPaywallPage({
        isAuthenticated: true,
        user: { email: 'test@example.com' },
      });
      expect(screen.getByText('בחר אמצעי תשלום')).toBeInTheDocument();
    });

    it('shows connected account indicator', () => {
      renderPaywallPage({
        isAuthenticated: true,
        user: { email: 'test@example.com' },
      });
      expect(screen.getByText('מחובר לחשבון')).toBeInTheDocument();
    });

    it('shows pay button with price', () => {
      renderPaywallPage({
        isAuthenticated: true,
        user: { email: 'test@example.com' },
      });
      expect(screen.getByText('שלם ₪149 ועבור לניתוח')).toBeInTheDocument();
    });
  });

  describe('Cancelled payment banner', () => {
    it('shows cancelled banner when cancelled=true in URL', () => {
      renderPaywallPage({ search: '?cancelled=true' });
      expect(screen.getByText('התשלום בוטל')).toBeInTheDocument();
    });

    it('does not show cancelled banner normally', () => {
      renderPaywallPage();
      expect(screen.queryByText('התשלום בוטל')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('renders back to compare link', () => {
      renderPaywallPage();
      expect(screen.getByText('← חזור לבחירת תיק')).toBeInTheDocument();
    });
  });
});
