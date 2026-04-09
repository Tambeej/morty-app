/**
 * Legacy offers API module (XHR-based upload with progress tracking).
 *
 * This module provides an XHR-based upload implementation for environments
 * where Axios progress tracking is insufficient. It is aligned with the
 * Firestore backend API contract.
 *
 * Prefer using offersService.js for most use cases.
 */
import axios from 'axios';

/**
 * Backend API base URL.
 * Uses VITE_API_URL env var (Vite projects) with fallback to production URL.
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://morty-backend-h9sb.onrender.com/api/v1';

/**
 * Get the stored JWT access token.
 * @returns {string|null}
 */
const getToken = () => localStorage.getItem('morty_token');

/**
 * Build Authorization header.
 * @returns {object}
 */
const authHeader = () => ({
  Authorization: `Bearer ${getToken()}`,
});

/**
 * Offers API service (XHR-based for upload progress support).
 */
export const offersApi = {
  /**
   * Upload a mortgage offer file.
   *
   * Uses XMLHttpRequest directly to support upload progress tracking.
   * Backend returns: { data: { id: string, status: 'pending' } }
   *
   * @param {File} file - The file to upload
   * @param {Function} [onProgress] - Progress callback (0-100)
   * @returns {Promise<{ id: string, status: string }>} Created offer stub
   */
  uploadOffer(file, onProgress) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const envelope = JSON.parse(xhr.responseText);
            // Unwrap { data: { id, status } } envelope
            resolve(envelope.data || envelope);
          } catch {
            resolve({ status: 'pending' });
          }
        } else {
          let errorMessage = 'Upload failed';
          try {
            const errData = JSON.parse(xhr.responseText);
            errorMessage = errData.message || errData.error || errorMessage;
          } catch {
            // ignore parse error
          }
          const error = new Error(errorMessage);
          error.response = { data: { message: errorMessage }, status: xhr.status };
          reject(error);
        }
      });

      xhr.addEventListener('error', () => {
        reject(
          new Error('Network error during upload. Please check your connection.')
        );
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was cancelled.'));
      });

      xhr.open('POST', `${API_BASE_URL}/offers`);
      xhr.setRequestHeader('Authorization', `Bearer ${getToken()}`);
      xhr.send(formData);
    });
  },

  /**
   * Fetch the list of user's mortgage offers.
   * Backend returns: { data: OfferShape[] }
   *
   * @returns {Promise<object[]>} Array of OfferShape objects
   */
  async getOffers() {
    const response = await axios.get(`${API_BASE_URL}/offers`, {
      headers: authHeader(),
    });
    const payload = response.data?.data || response.data;
    return Array.isArray(payload) ? payload : (payload?.offers || []);
  },

  /**
   * Fetch a single offer by ID (via analysis endpoint).
   * Backend returns: { data: OfferShape }
   *
   * @param {string} offerId - Firestore string ID
   * @returns {Promise<object>} OfferShape object
   */
  async getOffer(offerId) {
    const response = await axios.get(`${API_BASE_URL}/analysis/${offerId}`, {
      headers: authHeader(),
    });
    return response.data?.data || response.data;
  },
};

export default offersApi;
