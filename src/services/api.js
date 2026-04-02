/**
 * Morty API Service Layer
 * Axios instance with JWT interceptors for authenticated requests
 */

import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

/**
 * Create Axios instance with base configuration
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Request interceptor - attach JWT token to requests
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('morty_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor - handle token refresh and errors
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('morty_refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { token } = response.data;
        localStorage.setItem('morty_token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect to login
        localStorage.removeItem('morty_token');
        localStorage.removeItem('morty_refresh_token');
        localStorage.removeItem('morty_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================
// Auth API
// ============================================================

/**
 * Register a new user
 * @param {Object} data - { name, email, phone, password }
 */
export const register = (data) => api.post('/auth/register', data);

/**
 * Login user
 * @param {Object} data - { email, password }
 */
export const login = (data) => api.post('/auth/login', data);

/**
 * Logout user
 */
export const logout = () => api.post('/auth/logout');

/**
 * Refresh access token
 * @param {string} refreshToken
 */
export const refreshToken = (token) =>
  api.post('/auth/refresh', { refreshToken: token });

// ============================================================
// Profile / Financial Data API
// ============================================================

/**
 * Get user financial profile
 */
export const getFinancials = () => api.get('/profile');

/**
 * Update user financial profile
 * @param {Object} data - Financial data object
 */
export const updateFinancials = (data) => api.put('/profile', data);

// ============================================================
// Offers API
// ============================================================

/**
 * Upload a mortgage offer file
 * @param {FormData} formData - File + metadata
 * @param {Function} onUploadProgress - Progress callback
 */
export const uploadOffer = (formData, onUploadProgress) =>
  api.post('/offers', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });

/**
 * Get all offers for the current user
 */
export const getOffers = () => api.get('/offers');

/**
 * Get a specific offer by ID
 * @param {string} id - Offer ID
 */
export const getOffer = (id) => api.get(`/offers/${id}`);

/**
 * Delete an offer
 * @param {string} id - Offer ID
 */
export const deleteOffer = (id) => api.delete(`/offers/${id}`);

// ============================================================
// Analysis API
// ============================================================

/**
 * Get analysis results for an offer
 * @param {string} id - Offer ID
 */
export const getAnalysis = (id) => api.get(`/analysis/${id}`);

// ============================================================
// Dashboard API
// ============================================================

/**
 * Get dashboard summary data
 */
export const getDashboard = () => api.get('/dashboard');

export default api;
