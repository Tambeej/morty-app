/**
 * Financial profile service module.
 *
 * Handles GET and PUT for user financial data.
 * Endpoint: /profile (not /profile/financials)
 *
 * Firestore financial shape:
 * {
 *   id: string,
 *   userId: string,
 *   income: number,
 *   additionalIncome: number,
 *   expenses: { housing: number, loans: number, other: number },
 *   assets: { savings: number, investments: number },
 *   debts: Array<{ type: string, amount: number }>,
 *   updatedAt: string (ISO)
 * }
 */
import api from './api';

/**
 * Default financial shape — matches Firestore document structure.
 * Used as fallback when API returns null/undefined fields.
 */
export const DEFAULT_FINANCIALS = {
  income: 0,
  additionalIncome: 0,
  expenses: { housing: 0, loans: 0, other: 0 },
  assets: { savings: 0, investments: 0 },
  debts: [],
};

/**
 * Normalize financial data from API response.
 * Ensures all nested objects exist with safe defaults.
 * @param {object} data - Raw financial data from API
 * @returns {object} Normalized financial data
 */
export const normalizeFinancials = (data) => ({
  id: data.id || data._id || undefined,
  userId: data.userId || undefined,
  income: data.income ?? 0,
  additionalIncome: data.additionalIncome ?? 0,
  expenses: {
    housing: data.expenses?.housing ?? 0,
    loans: data.expenses?.loans ?? 0,
    other: data.expenses?.other ?? 0,
  },
  assets: {
    savings: data.assets?.savings ?? 0,
    investments: data.assets?.investments ?? 0,
  },
  debts: Array.isArray(data.debts) ? data.debts : [],
  updatedAt: data.updatedAt || null,
});

/**
 * Get the current user's financial profile.
 * @returns {Promise<object>} Normalized financial profile data
 */
export const getFinancials = async () => {
  const response = await api.get('/profile');
  // Backend envelope: { data: financialShape, message? }
  const payload = response.data?.data || response.data;
  return normalizeFinancials(payload || DEFAULT_FINANCIALS);
};

/**
 * Update the current user's financial profile.
 * @param {object} data - Partial or full financial profile
 * @returns {Promise<object>} Updated normalized financial profile data
 */
export const updateFinancials = async (data) => {
  const response = await api.put('/profile', data);
  // Backend envelope: { data: financialShape, message? }
  const payload = response.data?.data || response.data;
  return normalizeFinancials(payload || data);
};
