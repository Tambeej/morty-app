/**
 * Dashboard service module.
 * Fetches the aggregated dashboard summary data.
 */
import api from './api';

/**
 * Get dashboard summary data
 * @returns {Promise<Object>} Dashboard data:
 *   { summary: {...}, financialProfile: {...}, comparisonData: [], recentOffers: [] }
 */
export const getDashboard = async () => {
  const response = await api.get('/dashboard');
  return response.data.data;
};
