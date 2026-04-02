/**
 * Mortgage offers service module.
 * Handles file upload, listing, fetching, and deleting offers.
 */
import api from './api';

/**
 * Upload a mortgage offer file
 * @param {File} file - The PDF/PNG/JPG file
 * @param {string} [bankName] - Optional bank name
 * @param {Function} [onUploadProgress] - Progress callback (percent: number) => void
 * @returns {Promise<Object>} Created offer object
 */
export const uploadOffer = async (file, bankName, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  if (bankName) {
    formData.append('bankName', bankName);
  }

  const response = await api.post('/offers', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percent);
      }
    },
  });

  return response.data.data.offer;
};

/**
 * List all offers for the current user
 * @param {Object} [params] - Query params: { status, page, limit }
 * @returns {Promise<{offers: Array, pagination: Object}>}
 */
export const listOffers = async (params = {}) => {
  const response = await api.get('/offers', { params });
  return response.data.data;
};

/**
 * Get offer statistics
 * @returns {Promise<Object>} Stats: { total, pending, processing, analyzed, error }
 */
export const getOfferStats = async () => {
  const response = await api.get('/offers/stats');
  return response.data.data.stats;
};

/**
 * Get a single offer by ID
 * @param {string} id - Offer ID
 * @returns {Promise<Object>} Offer object
 */
export const getOffer = async (id) => {
  const response = await api.get(`/offers/${id}`);
  return response.data.data;
};

/**
 * Delete an offer by ID
 * @param {string} id - Offer ID
 * @returns {Promise<void>}
 */
export const deleteOffer = async (id) => {
  await api.delete(`/offers/${id}`);
};
