/**
 * Analysis service module.
 * Handles fetching analysis results, re-analysis, and SSE streaming.
 */
import api from './api';
import { getStoredToken } from '../utils/storage';
import { API_BASE_URL } from './api';

/**
 * Get all analysis results for the current user
 * @param {Object} [params] - Query params: { page, limit }
 * @returns {Promise<{offers: Array, pagination: Object}>}
 */
export const listAnalysis = async (params = {}) => {
  const response = await api.get('/analysis', { params });
  return response.data.data;
};

/**
 * Get a single analysis result by offer ID
 * @param {string} id - Offer/Analysis ID
 * @returns {Promise<Object>} Analysis result with extractedData and analysis fields
 */
export const getAnalysis = async (id) => {
  const response = await api.get(`/analysis/${id}`);
  return response.data.data;
};

/**
 * Trigger re-analysis for an offer
 * @param {string} id - Offer ID
 * @returns {Promise<Object>} Response data
 */
export const reanalyze = async (id) => {
  const response = await api.post(`/analysis/${id}/reanalyze`);
  return response.data;
};

/**
 * Subscribe to real-time analysis status updates via SSE
 * @param {string} id - Offer ID
 * @param {Object} callbacks - { onMessage, onError, onComplete }
 * @returns {EventSource} The EventSource instance (call .close() to unsubscribe)
 */
export const streamAnalysis = (id, { onMessage, onError, onComplete }) => {
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
