/**
 * Analysis service module.
 *
 * Handles fetching analysis results.
 * Aligned with Firestore backend API contract:
 *   GET /analysis/:offerId → { data: OfferShape }
 *
 * Note: The new API contract does not include:
 *   - GET /analysis (list) — use offersService.listOffers() instead
 *   - POST /analysis/:id/reanalyze — not in current contract
 *   - SSE streaming — polling is the recommended approach
 */
import api from './api';
import { getStoredToken } from '../utils/storage';
import { API_BASE_URL } from './api';
import { normalizeOffer } from './offersService';

/**
 * Get a single analysis result (full offer) by offer ID.
 * @param {string} id - Offer/Analysis ID (Firestore string)
 * @returns {Promise<object>} Full normalized OfferShape with analysis fields
 */
export const getAnalysis = async (id) => {
  const response = await api.get(`/analysis/${id}`);
  // Backend envelope: { data: OfferShape, message? }
  const payload = response.data?.data || response.data;
  return normalizeOffer(payload);
};

/**
 * Subscribe to real-time analysis status updates via SSE.
 * Falls back gracefully if SSE is not supported.
 * @param {string} id - Offer ID
 * @param {Object} callbacks - { onMessage, onError, onComplete }
 * @returns {EventSource|null} The EventSource instance (call .close() to unsubscribe)
 */
export const streamAnalysis = (id, { onMessage, onError, onComplete } = {}) => {
  if (typeof EventSource === 'undefined') {
    console.warn('SSE not supported in this environment');
    return null;
  }

  const token = getStoredToken();
  const url = `${API_BASE_URL}/analysis/${id}/stream?token=${encodeURIComponent(token || '')}`;

  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (onMessage) onMessage(data);
      // Close stream when analysis is complete or errored
      if (data.status === 'analyzed' || data.status === 'error') {
        eventSource.close();
        if (onComplete) onComplete(data);
      }
    } catch (err) {
      console.error('SSE parse error:', err);
    }
  };

  eventSource.onerror = (err) => {
    console.error('SSE error:', err);
    eventSource.close();
    if (onError) onError(err);
  };

  return eventSource;
};
