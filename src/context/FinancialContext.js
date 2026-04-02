/**
 * Financial Profile Context
 * Manages the user's financial data state with loading, error, and auto-save support.
 */
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { getFinancials, updateFinancials } from '../services/financialService';
import { extractApiError } from '../utils/validators';

// ─── State Shape ────────────────────────────────────────────────────────────
const initialState = {
  data: null,
  isLoading: false,
  isSaving: false,
  error: null,
  saveSuccess: false,
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
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
const financialReducer = (state, action) => {
  switch (action.type) {
    case FINANCIAL_ACTIONS.FETCH_START:
      return { ...state, isLoading: true, error: null };
    case FINANCIAL_ACTIONS.FETCH_SUCCESS:
      return { ...state, isLoading: false, data: action.payload, error: null };
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
    default:
      return state;
  }
};

// ─── Context ─────────────────────────────────────────────────────────────────
export const FinancialContext = createContext(null);

export const FinancialProvider = ({ children }) => {
  const [state, dispatch] = useReducer(financialReducer, initialState);

  /**
   * Fetch the user's financial profile from the API
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
   * Save/update the user's financial profile
   * @param {Object} data - Financial data to save
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

  const clearError = useCallback(() => {
    dispatch({ type: FINANCIAL_ACTIONS.CLEAR_ERROR });
  }, []);

  /**
   * Calculate profile completion percentage
   * @returns {number} 0-100
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
    const filled = fields.filter((f) => f !== null && f !== undefined && f !== 0).length;
    return Math.round((filled / fields.length) * 100);
  }, [state.data]);

  const value = {
    ...state,
    fetchFinancials,
    saveFinancials,
    clearError,
    getProfileCompletion,
  };

  return <FinancialContext.Provider value={value}>{children}</FinancialContext.Provider>;
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
