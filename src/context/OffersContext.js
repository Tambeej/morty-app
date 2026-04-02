/**
 * Mortgage Offers Context
 * Manages the list of uploaded mortgage offers, upload state, and pagination.
 */
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { listOffers, uploadOffer, deleteOffer, getOfferStats } from '../services/offersService';
import { extractApiError } from '../utils/validators';

// ─── State Shape ────────────────────────────────────────────────────────────
const initialState = {
  offers: [],
  pagination: null,
  stats: null,
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
  uploadError: null,
};

// ─── Action Types ────────────────────────────────────────────────────────────
const OFFERS_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR',
  UPLOAD_START: 'UPLOAD_START',
  UPLOAD_PROGRESS: 'UPLOAD_PROGRESS',
  UPLOAD_SUCCESS: 'UPLOAD_SUCCESS',
  UPLOAD_ERROR: 'UPLOAD_ERROR',
  DELETE_SUCCESS: 'DELETE_SUCCESS',
  SET_STATS: 'SET_STATS',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CLEAR_UPLOAD_ERROR: 'CLEAR_UPLOAD_ERROR',
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
const offersReducer = (state, action) => {
  switch (action.type) {
    case OFFERS_ACTIONS.FETCH_START:
      return { ...state, isLoading: true, error: null };
    case OFFERS_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        offers: action.payload.offers,
        pagination: action.payload.pagination,
        error: null,
      };
    case OFFERS_ACTIONS.FETCH_ERROR:
      return { ...state, isLoading: false, error: action.payload };
    case OFFERS_ACTIONS.UPLOAD_START:
      return { ...state, isUploading: true, uploadProgress: 0, uploadError: null };
    case OFFERS_ACTIONS.UPLOAD_PROGRESS:
      return { ...state, uploadProgress: action.payload };
    case OFFERS_ACTIONS.UPLOAD_SUCCESS:
      return {
        ...state,
        isUploading: false,
        uploadProgress: 100,
        offers: [action.payload, ...state.offers],
        uploadError: null,
      };
    case OFFERS_ACTIONS.UPLOAD_ERROR:
      return { ...state, isUploading: false, uploadProgress: 0, uploadError: action.payload };
    case OFFERS_ACTIONS.DELETE_SUCCESS:
      return {
        ...state,
        offers: state.offers.filter((o) => o._id !== action.payload),
      };
    case OFFERS_ACTIONS.SET_STATS:
      return { ...state, stats: action.payload };
    case OFFERS_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case OFFERS_ACTIONS.CLEAR_UPLOAD_ERROR:
      return { ...state, uploadError: null };
    default:
      return state;
  }
};

// ─── Context ─────────────────────────────────────────────────────────────────
export const OffersContext = createContext(null);

export const OffersProvider = ({ children }) => {
  const [state, dispatch] = useReducer(offersReducer, initialState);

  /**
   * Fetch the list of offers
   * @param {Object} [params] - { status, page, limit }
   */
  const fetchOffers = useCallback(async (params = {}) => {
    dispatch({ type: OFFERS_ACTIONS.FETCH_START });
    try {
      const data = await listOffers(params);
      dispatch({ type: OFFERS_ACTIONS.FETCH_SUCCESS, payload: data });
      return data;
    } catch (err) {
      const message = extractApiError(err, 'Failed to load offers');
      dispatch({ type: OFFERS_ACTIONS.FETCH_ERROR, payload: message });
      throw err;
    }
  }, []);

  /**
   * Upload a new mortgage offer file
   * @param {File} file
   * @param {string} [bankName]
   */
  const uploadNewOffer = useCallback(async (file, bankName) => {
    dispatch({ type: OFFERS_ACTIONS.UPLOAD_START });
    try {
      const offer = await uploadOffer(file, bankName, (progress) => {
        dispatch({ type: OFFERS_ACTIONS.UPLOAD_PROGRESS, payload: progress });
      });
      dispatch({ type: OFFERS_ACTIONS.UPLOAD_SUCCESS, payload: offer });
      return offer;
    } catch (err) {
      const message = extractApiError(err, 'Failed to upload offer');
      dispatch({ type: OFFERS_ACTIONS.UPLOAD_ERROR, payload: message });
      throw err;
    }
  }, []);

  /**
   * Delete an offer by ID
   * @param {string} id
   */
  const removeOffer = useCallback(async (id) => {
    try {
      await deleteOffer(id);
      dispatch({ type: OFFERS_ACTIONS.DELETE_SUCCESS, payload: id });
    } catch (err) {
      const message = extractApiError(err, 'Failed to delete offer');
      dispatch({ type: OFFERS_ACTIONS.FETCH_ERROR, payload: message });
      throw err;
    }
  }, []);

  /**
   * Fetch offer statistics
   */
  const fetchStats = useCallback(async () => {
    try {
      const stats = await getOfferStats();
      dispatch({ type: OFFERS_ACTIONS.SET_STATS, payload: stats });
      return stats;
    } catch (err) {
      console.error('Failed to fetch offer stats:', err);
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: OFFERS_ACTIONS.CLEAR_ERROR });
  }, []);

  const clearUploadError = useCallback(() => {
    dispatch({ type: OFFERS_ACTIONS.CLEAR_UPLOAD_ERROR });
  }, []);

  const value = {
    ...state,
    fetchOffers,
    uploadNewOffer,
    removeOffer,
    fetchStats,
    clearError,
    clearUploadError,
  };

  return <OffersContext.Provider value={value}>{children}</OffersContext.Provider>;
};

export const useOffers = () => {
  const context = useContext(OffersContext);
  if (!context) {
    throw new Error('useOffers must be used within an OffersProvider');
  }
  return context;
};
