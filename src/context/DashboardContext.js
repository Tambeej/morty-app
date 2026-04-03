/**
 * Dashboard Context
 *
 * Manages the aggregated dashboard summary data.
 *
 * Aligned with Firestore backend API contract:
 *   GET /dashboard → { data: { financials: financialShape, recentOffers: OfferShape[5], stats: { totalOffers, savingsTotal } } }
 *
 * State shape:
 *   financials     — normalized financial profile (from /dashboard response)
 *   recentOffers   — up to 5 most recent OfferShape objects (string IDs, ISO timestamps)
 *   stats          — { totalOffers: number, savingsTotal: number }
 *   isLoading      — boolean
 *   error          — string | null
 *   lastFetched    — ISO string | null
 *
 * Cache: Skips re-fetch if data is less than 30 seconds old (configurable via force param).
 */
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { getDashboard } from '../services/dashboardService';
import { extractApiError } from '../utils/validators';

// ─── State Shape ────────────────────────────────────────────────────────────
const initialState = {
  /** Normalized financial profile from the dashboard endpoint */
  financials: null,
  /** Up to 5 most recent offers (OfferShape with Firestore string IDs) */
  recentOffers: [],
  /**
   * Aggregate stats from the backend.
   * totalOffers: number of offers for this user
   * savingsTotal: sum of analysis.savings across all analyzed offers
   */
  stats: {
    totalOffers: 0,
    savingsTotal: 0,
  },
  isLoading: false,
  error: null,
  /** ISO string of last successful fetch, or null */
  lastFetched: null,
};

// ─── Action Types ────────────────────────────────────────────────────────────
const DASHBOARD_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET: 'RESET',
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case DASHBOARD_ACTIONS.FETCH_START:
      return { ...state, isLoading: true, error: null };

    case DASHBOARD_ACTIONS.FETCH_SUCCESS: {
      const { financials, recentOffers, stats } = action.payload;
      return {
        ...state,
        isLoading: false,
        financials: financials || null,
        recentOffers: Array.isArray(recentOffers) ? recentOffers : [],
        stats: {
          totalOffers: stats?.totalOffers ?? 0,
          savingsTotal: stats?.savingsTotal ?? 0,
        },
        lastFetched: new Date().toISOString(),
        error: null,
      };
    }

    case DASHBOARD_ACTIONS.FETCH_ERROR:
      return { ...state, isLoading: false, error: action.payload };

    case DASHBOARD_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case DASHBOARD_ACTIONS.RESET:
      return { ...initialState };

    default:
      return state;
  }
};

// ─── Context ─────────────────────────────────────────────────────────────────
export const DashboardContext = createContext(null);

/**
 * DashboardProvider — wraps the dashboard page and provides aggregated data.
 *
 * @param {{ children: React.ReactNode }} props
 */
export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  /**
   * Fetch dashboard data.
   * getDashboard() returns { financials, recentOffers, stats } — already normalized.
   *
   * Implements a 30-second cache: skips re-fetch if data was recently loaded.
   * Pass force=true to bypass the cache.
   *
   * @param {boolean} [force=false] - Force refresh even if recently fetched
   * @returns {Promise<object>} Dashboard data
   */
  const fetchDashboard = useCallback(
    async (force = false) => {
      // Skip if recently fetched (within 30 seconds) unless forced
      if (!force && state.lastFetched) {
        const age = Date.now() - new Date(state.lastFetched).getTime();
        if (age < 30000) return state;
      }

      dispatch({ type: DASHBOARD_ACTIONS.FETCH_START });
      try {
        // getDashboard returns { financials, recentOffers, stats }
        const data = await getDashboard();
        dispatch({ type: DASHBOARD_ACTIONS.FETCH_SUCCESS, payload: data });
        return data;
      } catch (err) {
        const message = extractApiError(err, 'Failed to load dashboard');
        dispatch({ type: DASHBOARD_ACTIONS.FETCH_ERROR, payload: message });
        throw err;
      }
    },
    [state.lastFetched] // eslint-disable-line react-hooks/exhaustive-deps
  );

  /**
   * Clear the error message.
   */
  const clearError = useCallback(() => {
    dispatch({ type: DASHBOARD_ACTIONS.CLEAR_ERROR });
  }, []);

  /**
   * Reset dashboard state to initial (e.g., on logout).
   */
  const reset = useCallback(() => {
    dispatch({ type: DASHBOARD_ACTIONS.RESET });
  }, []);

  const value = {
    // State
    ...state,
    // Actions
    fetchDashboard,
    clearError,
    reset,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

/**
 * useDashboard hook — access dashboard context.
 * Must be used inside <DashboardProvider>.
 *
 * @returns {{
 *   financials: object|null,
 *   recentOffers: object[],
 *   stats: { totalOffers: number, savingsTotal: number },
 *   isLoading: boolean,
 *   error: string|null,
 *   lastFetched: string|null,
 *   fetchDashboard: function,
 *   clearError: function,
 *   reset: function,
 * }}
 */
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
