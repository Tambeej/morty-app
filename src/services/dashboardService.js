/**
 * Dashboard service module.
 *
 * Fetches the aggregated dashboard summary data.
 * Aligned with Firestore backend API contract:
 *   GET /dashboard → { data: { financials: financialShape, recentOffers: OfferShape[5], stats: { totalOffers, savingsTotal } } }
 */
import api from './api';
import { normalizeFinancials, DEFAULT_FINANCIALS } from './financialService';
import { normalizeOffer } from './offersService';

/**
 * Get dashboard summary data.
 * @returns {Promise<{
 *   financials: object,
 *   recentOffers: object[],
 *   stats: { totalOffers: number, savingsTotal: number }
 * }>}
 */
export const getDashboard = async () => {
  const response = await api.get('/dashboard');
  // Backend envelope: { data: { financials, recentOffers, stats }, message? }
  const payload = response.data?.data || response.data;

  return {
    financials: normalizeFinancials(payload.financials || DEFAULT_FINANCIALS),
    recentOffers: Array.isArray(payload.recentOffers)
      ? payload.recentOffers.map(normalizeOffer)
      : [],
    stats: {
      totalOffers: payload.stats?.totalOffers ?? 0,
      savingsTotal: payload.stats?.savingsTotal ?? 0,
    },
  };
};
