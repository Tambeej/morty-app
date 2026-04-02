/**
 * Analysis Context
 * Manages analysis results state, polling, and SSE streaming.
 */
import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import { listAnalysis, getAnalysis, reanalyze, streamAnalysis } from '../services/analysisService';
import { extractApiError } from '../utils/validators';

// ─── State Shape ────────────────────────────────────────────────────────────
const initialState = {
  analyses: [],
  currentAnalysis: null,
  pagination: null,
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
      return {
        ...state,
        isLoading: false,
        analyses: action.payload.offers,
        pagination: action.payload.pagination,
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
   * Fetch all analysis results
   */
  const fetchAnalyses = useCallback(async (params = {}) => {
    dispatch({ type: ANALYSIS_ACTIONS.FETCH_LIST_START });
    try {
      const data = await listAnalysis(params);
      dispatch({ type: ANALYSIS_ACTIONS.FETCH_LIST_SUCCESS, payload: data });
      return data;
    } catch (err) {
      const message = extractApiError(err, 'Failed to load analyses');
      dispatch({ type: ANALYSIS_ACTIONS.FETCH_LIST_ERROR, payload: message });
      throw err;
    }
  }, []);

  /**
   * Fetch a single analysis result
   * @param {string} id
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
   * Trigger re-analysis for an offer
   * @param {string} id
   */
  const triggerReanalysis = useCallback(async (id) => {
    try {
      await reanalyze(id);
      // Start streaming after triggering re-analysis
      startStreaming(id);
    } catch (err) {
      const message = extractApiError(err, 'Failed to trigger re-analysis');
      dispatch({ type: ANALYSIS_ACTIONS.FETCH_ONE_ERROR, payload: message });
      throw err;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Start SSE streaming for real-time analysis updates
   * @param {string} id
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
   * Stop SSE streaming
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
