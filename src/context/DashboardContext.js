/**
 * Dashboard Context
 * Manages the aggregated dashboard summary data.
 */
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { getDashboard } from '../services/dashboardService';
import { extractApiError } from '../utils/validators';

// ─── State Shape ────────────────────────────────────────────────────────────
const initialState = {
  summary: null,
  financialProfile: null,
  comparisonData: [],
  recentOffers: [],
  isLoading: false,
  error: null,
  lastFetched: null,
};

// ─── Action Types ────────────────────────────────────────────────────────────
const DASHBOARD_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case DASHBOARD_ACTIONS.FETCH_START:
      return { ...state, isLoading: true, error: null };
    case DASHBOARD_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        summary: action.payload.summary,
        financialProfile: action.payload.financialProfile,
        comparisonData: action.payload.comparisonData || [],
        recentOffers: action.payload.recentOffers || [],
        lastFetched: new Date().toISOString(),
        error: null,
      };
    case DASHBOARD_ACTIONS.FETCH_ERROR:
      return { ...state, isLoading: false, error: action.payload };
    case DASHBOARD_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// ─── Context ─────────────────────────────────────────────────────────────────
export const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  /**
   * Fetch dashboard data
   * @param {boolean} [force=false] - Force refresh even if recently fetched
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

  const clearError = useCallback(() => {
    dispatch({ type: DASHBOARD_ACTIONS.CLEAR_ERROR });
  }, []);

  const value = {
    ...state,
    fetchDashboard,
    clearError,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
