/**
 * useAnalysisStream.js
 * Custom hook that subscribes to the SSE stream for real-time analysis status updates.
 * Endpoint: GET /api/v1/analysis/:id/stream
 *
 * Uses VITE_API_URL environment variable (Vite project).
 *
 * @param {string|null} analysisId  - The offer/analysis ID to stream. Pass null to disable.
 * @param {Function}    onUpdate    - Callback invoked with the parsed SSE event data.
 */

import { useEffect, useRef } from 'react';

/**
 * Backend API base URL.
 * Uses VITE_API_URL env var (Vite projects) with fallback to production URL.
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://morty-backend-h9sb.onrender.com/api/v1';

/**
 * Subscribes to the SSE stream for a given analysis ID.
 * Automatically reconnects on connection loss (up to 5 retries).
 * Cleans up the EventSource on unmount or when analysisId changes.
 *
 * @param {string|null} analysisId
 * @param {Function}    onUpdate
 */
const useAnalysisStream = (analysisId, onUpdate) => {
  const esRef = useRef(null);
  const retriesRef = useRef(0);
  const MAX_RETRIES = 5;

  useEffect(() => {
    if (!analysisId) return;

    const token = localStorage.getItem('morty_token');
    // EventSource doesn't support custom headers natively;
    // pass token as query param (backend must accept this for SSE).
    const url = `${API_BASE_URL}/analysis/${analysisId}/stream?token=${encodeURIComponent(token || '')}`;

    const connect = () => {
      if (esRef.current) {
        esRef.current.close();
      }

      const es = new EventSource(url);
      esRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          retriesRef.current = 0; // reset on success
          if (typeof onUpdate === 'function') {
            onUpdate(data);
          }
        } catch (err) {
          console.warn('[useAnalysisStream] Failed to parse SSE data:', err);
        }
      };

      es.onerror = () => {
        es.close();
        esRef.current = null;
        if (retriesRef.current < MAX_RETRIES) {
          retriesRef.current += 1;
          const delay = Math.min(1000 * 2 ** retriesRef.current, 30_000);
          setTimeout(connect, delay);
        } else {
          console.warn('[useAnalysisStream] Max retries reached. Giving up.');
        }
      };
    };

    connect();

    return () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [analysisId, onUpdate]);
};

export default useAnalysisStream;
