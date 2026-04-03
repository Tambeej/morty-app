/**
 * Analysis Context
 * Manages analysis results state and SSE streaming.
 *
 * Aligned with Firestore backend API contract:
 *   GET /analysis/:offerId → { data: OfferShape }  (single offer with analysis)
 *   GET /offers            → { data: OfferShape[] } (used for listing analyses)
 *
 * Note: The current API contract does not include:
 *   - GET /analysis (list endpoint) — use offersService.listOffers() instead
 *   - POST /analysis/:id/reanalyze  — not in current contract
 *
 * OfferShape uses string `id` (Firestore), ISO timestamps.
 * analysis field may be null when status is 'pending'.
 */
import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import { getAnalysis, streamAnalysis } from '../services/analysisService';
import { listOffers } from '../services/offersService';
import { extractApiError } from '../utils/validators';

// ─── State Shape ────────────────────────────────────────────────────────────
const initialState = {
  /** Array of OfferShape objects (used as analysis list) */
  analyses: [],
  /** Currently viewed OfferShape (full, with analysis fields) */
  currentAnalysis: null,
  isLoading: false,
  isStreaming: false,
  error: null,
};

// ─── Action Types ────────────────────────────────────────────────────────────
const ANALYSIS_ACTIONS = {
  FETCH_LIST_START: 'FETCH_LIST_START',
  FETCH_LIST_SUCCESS: 'FETCH_LIST_SUCCESS',
  FETCH_LIST_ERROR: 'FETCH_LIST_ERROR',
  FETCH_ONE_START: 'FETCH_ONE_START',
  FETCH_ONE_SUCCESS: 'FETCH_ONE_SUCCESS',
  FETCH_ONE_ERROR: 'FETCH_ONE_ERROR',
  STREAM_START: 'STREAM_START',
  STREAM_UPDATE: 'STREAM_UPDATE',
  STREAM_END: 'STREAM_END',
  CLEAR_CURRENT: 'CLEAR_CURRENT',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
const analysisReducer = (state, action) => {
  switch (action.type) {
    case ANALYSIS_ACTIONS.FETCH_LIST_START:
      return { ...state, isLoading: true, error: null };

    case ANALYSIS_ACTIONS.FETCH_LIST_SUCCESS:
      // listOffers returns a flat OfferShape[] (already normalized)
      return {
        ...state,
        isLoading: false,
        analyses: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case ANALYSIS_ACTIONS.FETCH_LIST_ERROR:
      return { ...state, isLoading: false, error: action.payload };

    case ANALYSIS_ACTIONS.FETCH_ONE_START:
      return { ...state, isLoading: true, error: null };

    case ANALYSIS_ACTIONS.FETCH_ONE_SUCCESS:
      return { ...state, isLoading: false, currentAnalysis: action.payload, error: null };

    case ANALYSIS_ACTIONS.FETCH_ONE_ERROR:
      return { ...state, isLoading: false, error: action.payload };

    case ANALYSIS_ACTIONS.STREAM_START:
      return { ...state, isStreaming: true };

    case ANALYSIS_ACTIONS.STREAM_UPDATE:
      return {
        ...state,
        currentAnalysis: state.currentAnalysis
          ? { ...state.currentAnalysis, ...action.payload }
          : action.payload,
      };

    case ANALYSIS_ACTIONS.STREAM_END:
      return { ...state, isStreaming: false };

    case ANALYSIS_ACTIONS.CLEAR_CURRENT:
      return { ...state, currentAnalysis: null };

    case ANALYSIS_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

// ─── Context ─────────────────────────────────────────────────────────────────
export const AnalysisContext = createContext(null);

export const AnalysisProvider = ({ children }) => {
  const [state, dispatch] = useReducer(analysisReducer, initialState);
  const eventSourceRef = useRef(null);

  /**
   * Fetch all offers (used as the analysis list).
   * Uses listOffers() since there is no dedicated GET /analysis endpoint.
   * Returns a flat array of normalized OfferShape objects.
   */
  const fetchAnalyses = useCallback(async () => {
    dispatch({ type: ANALYSIS_ACTIONS.FETCH_LIST_START });
    try {
      // listOffers returns OfferShape[] (flat array, already normalized)
      const offers = await listOffers();
      dispatch({ type: ANALYSIS_ACTIONS.FETCH_LIST_SUCCESS, payload: offers });
      return offers;
    } catch (err) {
      const message = extractApiError(err, 'Failed to load analyses');
      dispatch({ type: ANALYSIS_ACTIONS.FETCH_LIST_ERROR, payload: message });
      throw err;
    }
  }, []);

  /**
   * Fetch a single analysis result (full OfferShape with analysis fields).
   * @param {string} id - Firestore string offer ID
   * @returns {Promise<object>} Full normalized OfferShape
   */
  const fetchAnalysis = useCallback(async (id) => {
    dispatch({ type: ANALYSIS_ACTIONS.FETCH_ONE_START });
    try {
      const data = await getAnalysis(id);
      dispatch({ type: ANALYSIS_ACTIONS.FETCH_ONE_SUCCESS, payload: data });
      return data;
    } catch (err) {
      const message = extractApiError(err, 'Failed to load analysis');
      dispatch({ type: ANALYSIS_ACTIONS.FETCH_ONE_ERROR, payload: message });
      throw err;
    }
  }, []);

  /**
   * Trigger re-analysis for an offer.
   * Note: POST /analysis/:id/reanalyze is not in the current API contract.
   * This method starts SSE streaming to poll for status updates instead.
   * @param {string} id - Firestore string offer ID
   */
  const triggerReanalysis = useCallback(
    async (id) => {
      try {
        // Re-fetch the offer to get the latest status, then start streaming
        await fetchAnalysis(id);
        startStreaming(id);
      } catch (err) {
        const message = extractApiError(err, 'Failed to trigger re-analysis');
        dispatch({ type: ANALYSIS_ACTIONS.FETCH_ONE_ERROR, payload: message });
        throw err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchAnalysis]
  );

  /**
   * Start SSE streaming for real-time analysis status updates.
   * @param {string} id - Firestore string offer ID
   */
  const startStreaming = useCallback((id) => {
    // Close any existing stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    dispatch({ type: ANALYSIS_ACTIONS.STREAM_START });

    const es = streamAnalysis(id, {
      onMessage: (data) => {
        dispatch({ type: ANALYSIS_ACTIONS.STREAM_UPDATE, payload: data });
      },
      onError: (err) => {
        console.error('Analysis stream error:', err);
        dispatch({ type: ANALYSIS_ACTIONS.STREAM_END });
      },
      onComplete: (data) => {
        dispatch({ type: ANALYSIS_ACTIONS.STREAM_UPDATE, payload: data });
        dispatch({ type: ANALYSIS_ACTIONS.STREAM_END });
      },
    });

    eventSourceRef.current = es;
  }, []);

  /**
   * Stop SSE streaming.
   */
  const stopStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    dispatch({ type: ANALYSIS_ACTIONS.STREAM_END });
  }, []);

  const clearCurrentAnalysis = useCallback(() => {
    dispatch({ type: ANALYSIS_ACTIONS.CLEAR_CURRENT });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: ANALYSIS_ACTIONS.CLEAR_ERROR });
  }, []);

  const value = {
    ...state,
    fetchAnalyses,
    fetchAnalysis,
    triggerReanalysis,
    startStreaming,
    stopStreaming,
    clearCurrentAnalysis,
    clearError,
  };

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};
