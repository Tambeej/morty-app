/**
 * useDashboard hook
 * Convenience re-export from DashboardContext.
 *
 * Provides:
 *   financials    — normalized financial profile | null
 *   recentOffers  — OfferShape[] (up to 5, Firestore string IDs, ISO timestamps)
 *   stats         — { totalOffers: number, savingsTotal: number }
 *   isLoading     — boolean
 *   error         — string | null
 *   lastFetched   — ISO string | null
 *   fetchDashboard — async (force?: boolean) => dashboard data
 *   clearError    — () => void
 */
export { useDashboard } from '../context/DashboardContext';
