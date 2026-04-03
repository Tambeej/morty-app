/**
 * Mortgage Offers Context
 * Manages the list of uploaded mortgage offers, upload state, and pagination.
 *
 * Aligned with Firestore backend API contract:
 *   GET  /offers  → { data: OfferShape[] }  (flat array, sorted createdAt desc)
 *   POST /offers  → { data: { id: string, status: 'pending' } }
 *
 * OfferShape uses string `id` (Firestore), not `_id` (Mongoose).
 * Timestamps are ISO strings.
 */
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { listOffers, uploadOffer } from '../services/offersService';
import { extractApiError } from '../utils/validators';

// ─── State Shape ────────────────────────────────────────────────────────────
const initialState = {
  offers: [],
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
  CLEAR_ERROR: 'CLEAR_ERROR',
  CLEAR_UPLOAD_ERROR: 'CLEAR_UPLOAD_ERROR',
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
const offersReducer = (state, action) => {
  switch (action.type) {
    case OFFERS_ACTIONS.FETCH_START:
      return { ...state, isLoading: true, error: null };

    case OFFERS_ACTIONS.FETCH_SUCCESS:
      // listOffers returns a flat array of normalized OfferShape objects
      return {
        ...state,
        isLoading: false,
        offers: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };

    case OFFERS_ACTIONS.FETCH_ERROR:
      return { ...state, isLoading: false, error: action.payload };

    case OFFERS_ACTIONS.UPLOAD_START:
      return { ...state, isUploading: true, uploadProgress: 0, uploadError: null };

    case OFFERS_ACTIONS.UPLOAD_PROGRESS:
      return { ...state, uploadProgress: action.payload };

    case OFFERS_ACTIONS.UPLOAD_SUCCESS:
      // Prepend the new offer stub to the list
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
      // Firestore uses string `id`, not `_id`
      return {
        ...state,
        offers: state.offers.filter((o) => o.id !== action.payload),
      };

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
   * Fetch the list of offers for the current user.
   * Returns a flat array of normalized OfferShape objects (sorted createdAt desc).
   */
  const fetchOffers = useCallback(async () => {
    dispatch({ type: OFFERS_ACTIONS.FETCH_START });
    try {
      // listOffers returns OfferShape[] (flat array, already normalized)
      const offers = await listOffers();
      dispatch({ type: OFFERS_ACTIONS.FETCH_SUCCESS, payload: offers });
      return offers;
    } catch (err) {
      const message = extractApiError(err, 'Failed to load offers');
      dispatch({ type: OFFERS_ACTIONS.FETCH_ERROR, payload: message });
      throw err;
    }
  }, []);

  /**
   * Upload a new mortgage offer file.
   * @param {File} file - The PDF/PNG/JPG file to upload
   * @param {Function} [onProgress] - Optional progress callback (percent: number) => void
   * @returns {Promise<{ id: string, status: string }>} Created offer stub
   */
  const uploadNewOffer = useCallback(async (file, onProgress) => {
    dispatch({ type: OFFERS_ACTIONS.UPLOAD_START });
    try {
      const offer = await uploadOffer(file, (progress) => {
        dispatch({ type: OFFERS_ACTIONS.UPLOAD_PROGRESS, payload: progress });
        if (typeof onProgress === 'function') onProgress(progress);
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
   * Remove an offer from local state by its Firestore string ID.
   * Note: The current API contract does not include a DELETE /offers/:id endpoint.
   * This only removes the offer from local state (optimistic removal).
   * @param {string} id - Firestore string offer ID
   */
  const removeOffer = useCallback((id) => {
    dispatch({ type: OFFERS_ACTIONS.DELETE_SUCCESS, payload: id });
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
