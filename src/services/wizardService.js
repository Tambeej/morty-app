/**
 * wizardService.js
 * Handles API calls for the public wizard flow.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://morty-backend.onrender.com';

/**
 * Submit wizard inputs to generate mortgage portfolios.
 * @param {Object} inputs - Wizard form inputs
 * @param {boolean} consent - User consent for anonymous data storage
 * @returns {Promise<{portfolios: Array, communityTips: Array}>}
 */
export async function submitWizard(inputs, consent) {
  const response = await fetch(`${API_BASE_URL}/api/v1/public/wizard/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs, consent }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `שגיאה בשרת (${response.status})`);
  }

  return response.json();
}

/**
 * Fetch latest Bank of Israel mortgage rates.
 * @returns {Promise<Object>} rates object
 */
export async function fetchLatestRates() {
  const response = await fetch(`${API_BASE_URL}/api/v1/public/rates/latest`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('שגיאה בטעינת נתוני הריבית');
  }

  return response.json();
}
