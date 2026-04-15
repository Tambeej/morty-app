/**
 * paymentService.js
 * Handles Stripe payment API calls for the Morty paywall.
 *
 * Endpoints:
 *   POST /stripe/checkout  → Create a Stripe Checkout session
 *   GET  /stripe/status    → Verify payment status after redirect
 *
 * Architecture contract:
 *   POST /api/v1/stripe/checkout
 *     Body: { portfolioId: string, successUrl: string, cancelUrl: string }
 *     Response: { success: true, data: { url: string } }
 *
 *   GET /api/v1/stripe/status?session_id=xxx
 *     Response: { success: true, data: { paid: boolean, status: string, portfolioId: string } }
 */

import { getStoredToken } from '../utils/storage';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://morty-backend-h9sb.onrender.com/api/v1';

/**
 * Create a Stripe Checkout session for the paywall.
 * Requires the user to be authenticated (JWT token).
 *
 * @param {Object} params
 * @param {string} params.portfolioId - The selected portfolio ID
 * @param {string} params.successUrl  - URL to redirect to after successful payment
 * @param {string} params.cancelUrl   - URL to redirect to if payment is cancelled
 * @returns {Promise<{ url: string }>} Stripe Checkout session URL
 * @throws {Error} If not authenticated or API call fails
 */
export async function createCheckoutSession({ portfolioId, successUrl, cancelUrl }) {
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/stripe/checkout`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ portfolioId, successUrl, cancelUrl }),
  });

  if (response.status === 401) {
    throw new Error('AUTH_REQUIRED');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
      errorData.error ||
      `שגיאה ביצירת תשלום (${response.status})`
    );
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Verify the payment status after returning from Stripe Checkout.
 *
 * @param {string} sessionId - The Stripe session ID from the URL query param
 * @returns {Promise<{ paid: boolean, status: string, portfolioId: string }>}
 * @throws {Error} If the API call fails
 */
export async function verifyPaymentStatus(sessionId) {
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/stripe/status?session_id=${encodeURIComponent(sessionId)}`,
    { headers }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
      errorData.error ||
      `שגיאה בבדיקת סטטוס תשלום (${response.status})`
    );
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Get the Stripe publishable key from environment variables.
 * @returns {string|null}
 */
export function getStripePublishableKey() {
  return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || null;
}
