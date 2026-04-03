/**
 * Financial Profile Context
 *
 * Manages the user's financial data state with loading, error, and auto-save support.
 *
 * Aligned with Firestore backend API contract:
 *   GET /profile → { data: financialShape }
 *   PUT /profile → { data: financialShape }
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
 *
 * initialData provides safe defaults matching the Firestore shape.
 * All nested objects are initialized to avoid null-access errors in components.
 */
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { getFinancials, updateFinancials } from '../services/financialService';
import { extractApiError } from '../utils/validators';

// ─── Firestore-aligned default financial data ────────────────────────────────
/**
 * Default financial data shape — mirrors Firestore document structure.
 * Used as the initial form state and fallback when API returns null.
 */
export const DEFAULT_FINANCIAL_DATA = {
  income: 0,
  additionalIncome: 0,
  expenses: { housing: 0, loans: 0, other: 0 },
  assets: { savings: 0, investments: 0 },
  debts: [],
};

// ─── State Shape ────────────────────────────────────────────────────────────
const initialState = {
  /**
   * Financial data from the API (null until first fetch).
   * When loaded, matches Firestore financialShape.
   */
  data: null,
  isLoading: false,
  isSaving: false,
  error: null,
  saveSuccess: false,
  /** ISO string of last successful save, or null */
  lastSaved: null,
};

// ─── Action Types ────────────────────────────────────────────────────────────
const FINANCIAL_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR',
  SAVE_START: 'SAVE_START',
  SAVE_SUCCESS: 'SAVE_SUCCESS',
  SAVE_ERROR: 'SAVE_ERROR',
  CLEAR_SAVE_STATUS: 'CLEAR_SAVE_STATUS',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_DATA: 'RESET_DATA',
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
const financialReducer = (state, action) => {
  switch (action.type) {
    case FINANCIAL_ACTIONS.FETCH_START:
      return { ...state, isLoading: true, error: null };

    case FINANCIAL_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        data: action.payload,
        error: null,
      };

    case FINANCIAL_ACTIONS.FETCH_ERROR:
      return { ...state, isLoading: false, error: action.payload };

    case FINANCIAL_ACTIONS.SAVE_START:
      return { ...state, isSaving: true, saveSuccess: false, error: null };

    case FINANCIAL_ACTIONS.SAVE_SUCCESS:
      return {
        ...state,
        isSaving: false,
        data: action.payload,
        saveSuccess: true,
        lastSaved: new Date().toISOString(),
        error: null,
      };

    case FINANCIAL_ACTIONS.SAVE_ERROR:
      return { ...state, isSaving: false, error: action.payload };

    case FINANCIAL_ACTIONS.CLEAR_SAVE_STATUS:
      return { ...state, saveSuccess: false };

    case FINANCIAL_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case FINANCIAL_ACTIONS.RESET_DATA:
      return { ...initialState };

    default:
      return state;
  }
};

// ─── Context ─────────────────────────────────────────────────────────────────
export const FinancialContext = createContext(null);

/**
 * FinancialProvider — wraps pages that need financial profile data.
 *
 * @param {{ children: React.ReactNode }} props
 */
export const FinancialProvider = ({ children }) => {
  const [state, dispatch] = useReducer(financialReducer, initialState);

  /**
   * Fetch the user's financial profile from the API.
   * On success, stores the normalized Firestore-shaped data.
   * On error, stores the error message (data remains null).
   *
   * @returns {Promise<object>} Normalized financial data
   */
  const fetchFinancials = useCallback(async () => {
    dispatch({ type: FINANCIAL_ACTIONS.FETCH_START });
    try {
      const data = await getFinancials();
      dispatch({ type: FINANCIAL_ACTIONS.FETCH_SUCCESS, payload: data });
      return data;
    } catch (err) {
      const message = extractApiError(err, 'Failed to load financial profile');
      dispatch({ type: FINANCIAL_ACTIONS.FETCH_ERROR, payload: message });
      throw err;
    }
  }, []);

  /**
   * Save/update the user's financial profile.
   * Sends the full financial shape to PUT /profile.
   * Auto-clears the success indicator after 3 seconds.
   *
   * @param {object} data - Financial data to save (matches Firestore shape)
   * @returns {Promise<object>} Updated normalized financial data
   */
  const saveFinancials = useCallback(async (data) => {
    dispatch({ type: FINANCIAL_ACTIONS.SAVE_START });
    try {
      const updated = await updateFinancials(data);
      dispatch({ type: FINANCIAL_ACTIONS.SAVE_SUCCESS, payload: updated });
      // Auto-clear success indicator after 3 seconds
      setTimeout(() => {
        dispatch({ type: FINANCIAL_ACTIONS.CLEAR_SAVE_STATUS });
      }, 3000);
      return updated;
    } catch (err) {
      const message = extractApiError(err, 'Failed to save financial profile');
      dispatch({ type: FINANCIAL_ACTIONS.SAVE_ERROR, payload: message });
      throw err;
    }
  }, []);

  /**
   * Clear the current error message.
   */
  const clearError = useCallback(() => {
    dispatch({ type: FINANCIAL_ACTIONS.CLEAR_ERROR });
  }, []);

  /**
   * Reset financial data to initial state (e.g., on logout).
   */
  const resetData = useCallback(() => {
    dispatch({ type: FINANCIAL_ACTIONS.RESET_DATA });
  }, []);

  /**
   * Calculate profile completion percentage based on filled fields.
   * Returns 0 if no data has been loaded yet.
   *
   * Fields counted:
   *   income, additionalIncome,
   *   expenses.housing, expenses.loans, expenses.other,
   *   assets.savings, assets.investments
   *
   * @returns {number} 0–100
   */
  const getProfileCompletion = useCallback(() => {
    if (!state.data) return 0;
    const { income, additionalIncome, expenses, assets } = state.data;
    const fields = [
      income,
      additionalIncome,
      expenses?.housing,
      expenses?.loans,
      expenses?.other,
      assets?.savings,
      assets?.investments,
    ];
    const filled = fields.filter(
      (f) => f !== null && f !== undefined && f !== 0
    ).length;
    return Math.round((filled / fields.length) * 100);
  }, [state.data]);

  /**
   * Get the current financial data with safe defaults.
   * Returns DEFAULT_FINANCIAL_DATA when no data has been fetched yet.
   * Useful for form initialization.
   *
   * @returns {object} Financial data with Firestore-aligned defaults
   */
  const getDataWithDefaults = useCallback(() => {
    if (!state.data) return DEFAULT_FINANCIAL_DATA;
    return {
      income: state.data.income ?? 0,
      additionalIncome: state.data.additionalIncome ?? 0,
      expenses: {
        housing: state.data.expenses?.housing ?? 0,
        loans: state.data.expenses?.loans ?? 0,
        other: state.data.expenses?.other ?? 0,
      },
      assets: {
        savings: state.data.assets?.savings ?? 0,
        investments: state.data.assets?.investments ?? 0,
      },
      debts: Array.isArray(state.data.debts) ? state.data.debts : [],
      // Preserve Firestore metadata fields if present
      ...(state.data.id ? { id: state.data.id } : {}),
      ...(state.data.userId ? { userId: state.data.userId } : {}),
      ...(state.data.updatedAt ? { updatedAt: state.data.updatedAt } : {}),
    };
  }, [state.data]);

  const value = {
    // State
    ...state,
    // Actions
    fetchFinancials,
    saveFinancials,
    clearError,
    resetData,
    // Computed
    getProfileCompletion,
    getDataWithDefaults,
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};

/**
 * useFinancial hook — access financial context.
 * Must be used inside <FinancialProvider>.
 *
 * @returns {{
 *   data: object|null,
 *   isLoading: boolean,
 *   isSaving: boolean,
 *   error: string|null,
 *   saveSuccess: boolean,
 *   lastSaved: string|null,
 *   fetchFinancials: function,
 *   saveFinancials: function,
 *   clearError: function,
 *   resetData: function,
 *   getProfileCompletion: function,
 *   getDataWithDefaults: function,
 * }}
 */
export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
