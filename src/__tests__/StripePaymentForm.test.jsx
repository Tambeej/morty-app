/**
 * StripePaymentForm.test.jsx
 * Tests for the Stripe payment form component.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock paymentService
const mockCreateCheckoutSession = jest.fn();
jest.mock('../services/paymentService', () => ({
  createCheckoutSession: (...args) => mockCreateCheckoutSession(...args),
}));

import StripePaymentForm from '../components/paywall/StripePaymentForm';

describe('StripePaymentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.location.href setter
    delete window.location;
    window.location = { href: '', origin: 'http://localhost' };
  });

  it('renders the pay button with price', () => {
    render(<StripePaymentForm portfolioId="p-1" price={149} />);
    expect(screen.getByText('שלם ₪149 ועבור לניתוח')).toBeInTheDocument();
  });

  it('renders security note', () => {
    render(<StripePaymentForm portfolioId="p-1" />);
    expect(screen.getByText(/תשלום מאובטח באמצעות Stripe/)).toBeInTheDocument();
  });

  it('shows loading state when payment is processing', async () => {
    mockCreateCheckoutSession.mockReturnValue(new Promise(() => {})); // never resolves
    render(<StripePaymentForm portfolioId="p-1" />);
    const button = screen.getByRole('button', { name: /שלם/ });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('מעבד...')).toBeInTheDocument();
    });
  });

  it('shows error when no portfolioId is provided', async () => {
    render(<StripePaymentForm portfolioId={null} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    await waitFor(() => {
      expect(
        screen.getByText('לא נבחר תיק משכנתא. חזור לדף ההשוואה ובחר תיק.')
      ).toBeInTheDocument();
    });
  });

  it('redirects to Stripe URL on success', async () => {
    mockCreateCheckoutSession.mockResolvedValue({
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    });
    render(<StripePaymentForm portfolioId="p-1" />);
    const button = screen.getByRole('button', { name: /שלם/ });
    fireEvent.click(button);
    await waitFor(() => {
      expect(window.location.href).toBe('https://checkout.stripe.com/pay/cs_test_123');
    });
  });

  it('shows error when checkout session creation fails', async () => {
    mockCreateCheckoutSession.mockRejectedValue(new Error('Server error'));
    render(<StripePaymentForm portfolioId="p-1" />);
    const button = screen.getByRole('button', { name: /שלם/ });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('calls onError callback when payment fails', async () => {
    const onError = jest.fn();
    mockCreateCheckoutSession.mockRejectedValue(new Error('Payment failed'));
    render(<StripePaymentForm portfolioId="p-1" onError={onError} />);
    const button = screen.getByRole('button', { name: /שלם/ });
    fireEvent.click(button);
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Payment failed');
    });
  });

  it('disables button when disabled prop is true', () => {
    render(<StripePaymentForm portfolioId="p-1" disabled={true} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('shows AUTH_REQUIRED error in Hebrew', async () => {
    mockCreateCheckoutSession.mockRejectedValue(new Error('AUTH_REQUIRED'));
    render(<StripePaymentForm portfolioId="p-1" />);
    const button = screen.getByRole('button', { name: /שלם/ });
    fireEvent.click(button);
    await waitFor(() => {
      expect(
        screen.getByText('יש להתחבר לחשבון לפני ביצוע תשלום')
      ).toBeInTheDocument();
    });
  });
});
