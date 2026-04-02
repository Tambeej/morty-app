/**
 * Financial profile service module.
 * Handles GET and PUT for user financial data.
 */
import api from './api';

/**
 * Get the current user's financial profile
 * @returns {Promise<Object>} Financial profile data with metrics
 */
export const getFinancials = async () => {
  const response = await api.get('/profile/financials');
  return response.data.data;
};

/**
 * Update the current user's financial profile
 * @param {Object} data - Partial or full financial profile
 * @returns {Promise<Object>} Updated financial profile data
 */
export const updateFinancials = async (data) => {
  const response = await api.put('/profile/financials', data);
  return response.data.data;
};
