/**
 * portfolioService.js
 * Handles API calls for portfolio saving and management.
 * Authenticated endpoints require a valid JWT token.
 */

import { getStoredToken } from '../utils/storage';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://morty-backend-h9sb.onrender.com/api/v1';

/**
 * Save a selected portfolio to the authenticated user's account.
 * Requires the user to be logged in (JWT token in localStorage).
 *
 * @param {string} portfolioId - The ID of the portfolio to save
 * @returns {Promise<{ saved: boolean }>}
 * @throws {Error} If not authenticated or API call fails
 */
export async function savePortfolio(portfolioId) {
  const token = getStoredToken();

  if (!token) {
    throw new Error('AUTH_REQUIRED');
  }

  const response = await fetch(`${API_BASE_URL}/wizard/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ portfolioId }),
  });

  if (response.status === 401) {
    throw new Error('AUTH_REQUIRED');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `שגיאה בשמירת התיק (${response.status})`);
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Store the selected portfolio in sessionStorage for cross-page access.
 * Used to pass portfolio data to the paywall/signup page.
 *
 * @param {Object} portfolio - The selected portfolio object
 */
export function storeSelectedPortfolio(portfolio) {
  try {
    sessionStorage.setItem('morty_selected_portfolio', JSON.stringify(portfolio));
  } catch {
    // ignore storage errors
  }
}

/**
 * Retrieve the selected portfolio from sessionStorage.
 *
 * @returns {Object|null} The stored portfolio or null
 */
export function getStoredSelectedPortfolio() {
  try {
    const raw = sessionStorage.getItem('morty_selected_portfolio');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clear the stored selected portfolio from sessionStorage.
 */
export function clearStoredSelectedPortfolio() {
  try {
    sessionStorage.removeItem('morty_selected_portfolio');
  } catch {
    // ignore
  }
}
