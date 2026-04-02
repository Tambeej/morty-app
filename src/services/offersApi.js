import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

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
 * Offers API service
 *
 * Provides methods to interact with the /api/v1/offers endpoints.
 */
export const offersApi = {
  /**
   * Upload a mortgage offer file.
   *
   * Uses XMLHttpRequest directly to support upload progress tracking.
   *
   * @param {File} file - The file to upload
   * @param {string} [bankName] - Optional bank name metadata
   * @param {Function} [onProgress] - Progress callback (0-100)
   * @returns {Promise<object>} Parsed API response data
   */
  uploadOffer(file, bankName, onProgress) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      if (bankName) {
        formData.append('bankName', bankName);
      }

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
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch {
            resolve({ success: true });
          }
        } else {
          let errorMessage = 'Upload failed';
          try {
            const errData = JSON.parse(xhr.responseText);
            errorMessage = errData.error || errorMessage;
          } catch {
            // ignore parse error
          }
          const error = new Error(errorMessage);
          error.response = { data: { error: errorMessage }, status: xhr.status };
          reject(error);
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload. Please check your connection.'));
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
   *
   * @param {object} [params] - Query parameters (status, page, limit)
   * @returns {Promise<object>} { offers, pagination }
   */
  async getOffers(params = {}) {
    const response = await axios.get(`${API_BASE_URL}/offers`, {
      headers: authHeader(),
      params,
    });
    return response.data.data;
  },

  /**
   * Fetch a single offer by ID.
   *
   * @param {string} offerId
   * @returns {Promise<object>} Offer object
   */
  async getOffer(offerId) {
    const response = await axios.get(`${API_BASE_URL}/offers/${offerId}`, {
      headers: authHeader(),
    });
    return response.data.data;
  },

  /**
   * Delete an offer by ID.
   *
   * @param {string} offerId
   * @returns {Promise<object>} API response
   */
  async deleteOffer(offerId) {
    const response = await axios.delete(`${API_BASE_URL}/offers/${offerId}`, {
      headers: authHeader(),
    });
    return response.data;
  },

  /**
   * Fetch offer statistics for the current user.
   *
   * @returns {Promise<object>} { stats: { total, pending, processing, analyzed, error } }
   */
  async getStats() {
    const response = await axios.get(`${API_BASE_URL}/offers/stats`, {
      headers: authHeader(),
    });
    return response.data.data;
  },
};

export default offersApi;
