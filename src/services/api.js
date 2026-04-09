/**
 * Core Axios instance for the Morty backend API.
 *
 * Features:
 * - Pre-configured base URL from environment variable
 * - Automatic Bearer token attachment via request interceptor
 * - Automatic token refresh on 401 via response interceptor
 * - Centralized apiService object for all endpoint calls
 *
 * All backend responses follow the envelope: { data: ..., message?: string }
 */
import axios from 'axios';
import {
  getStoredToken,
  getStoredRefreshToken,
  setStoredToken,
  setStoredRefreshToken,
  clearStoredTokens,
} from '../utils/storage';

/**
 * Backend API base URL.
 * Defaults to the Render deployment; override with VITE_API_URL in .env.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://morty-backend-h9sb.onrender.com/api/v1';

/**
 * Axios instance pre-configured for the Morty backend.
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach Bearer token ──────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 / token refresh ─────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getStoredRefreshToken();

      if (refreshToken) {
        try {
          // POST /auth/refresh → { data: { token, refreshToken } }
          const { data: envelope } = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken }
          );
          const newToken = envelope.data?.token || envelope.token;
          const newRefreshToken = envelope.data?.refreshToken || envelope.refreshToken;

          setStoredToken(newToken);
          if (newRefreshToken) setStoredRefreshToken(newRefreshToken);

          axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch {
          // Refresh failed — clear storage and redirect to login
          clearStoredTokens();
          window.location.href = '/morty-app/login';
        }
      } else {
        // No refresh token available — redirect to login
        clearStoredTokens();
        window.location.href = '/morty-app/login';
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Central API service object.
 *
 * All methods unwrap the backend envelope `{ data: ..., message? }` and
 * return the inner `data` payload directly.
 *
 * Endpoint reference (Architecture Design):
 *   POST /auth/login      → { data: { token, refreshToken, user } }
 *   POST /auth/register   → { data: { token, refreshToken, user } }
 *   POST /auth/logout     → { message }
 *   POST /auth/refresh    → { data: { token, refreshToken } }
 *   GET  /auth/me         → { data: { user } }
 *   GET  /profile         → { data: financialShape }
 *   PUT  /profile         → { data: financialShape }
 *   GET  /offers          → { data: OfferShape[] }
 *   POST /offers          → { data: { id, status } }
 *   GET  /analysis/:id    → { data: OfferShape }
 *   GET  /dashboard       → { data: { financials, recentOffers, stats } }
 */
export const apiService = {
  // ── Auth ──────────────────────────────────────────────────────────────

  /** Set or clear the Authorization header on the shared instance */
  setAuthToken(token) {
    if (token) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common.Authorization;
    }
  },

  /**
   * Login an existing user.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ token: string, refreshToken: string, user: object }>}
   */
  async login(email, password) {
    const { data: envelope } = await axiosInstance.post('/auth/login', { email, password });
    // Backend returns { data: { token, refreshToken, user }, message? }
    return envelope.data || envelope;
  },

  /**
   * Register a new user.
   * @param {{ email: string, password: string, phone?: string }} userData
   * @returns {Promise<{ token: string, refreshToken: string, user: object }>}
   */
  async register(userData) {
    const { data: envelope } = await axiosInstance.post('/auth/register', userData);
    return envelope.data || envelope;
  },

  /**
   * Logout — invalidates the refresh token on the server.
   * @returns {Promise<void>}
   */
  async logout() {
    const refreshToken = getStoredRefreshToken();
    const { data: envelope } = await axiosInstance.post('/auth/logout', { refreshToken });
    return envelope;
  },

  /**
   * Refresh the access token.
   * @param {string} refreshToken
   * @returns {Promise<{ token: string, refreshToken: string }>}
   */
  async refreshToken(refreshToken) {
    const { data: envelope } = await axiosInstance.post('/auth/refresh', { refreshToken });
    return envelope.data || envelope;
  },

  /**
   * Get the currently authenticated user.
   * @returns {Promise<object>} user object
   */
  async getMe() {
    const { data: envelope } = await axiosInstance.get('/auth/me');
    return (envelope.data && (envelope.data.user || envelope.data)) || envelope.user || envelope;
  },

  // ── Financial Profile ─────────────────────────────────────────────────

  /**
   * Get the current user's financial profile.
   * @returns {Promise<object>} financialShape
   */
  async getFinancials() {
    const { data: envelope } = await axiosInstance.get('/profile');
    return envelope.data || envelope;
  },

  /**
   * Update the current user's financial profile.
   * @param {object} financials
   * @returns {Promise<object>} updated financialShape
   */
  async updateFinancials(financials) {
    const { data: envelope } = await axiosInstance.put('/profile', financials);
    return envelope.data || envelope;
  },

  // ── Offers ────────────────────────────────────────────────────────────

  /**
   * List all offers for the current user (sorted by createdAt desc).
   * @returns {Promise<object[]>} OfferShape[]
   */
  async getOffers() {
    const { data: envelope } = await axiosInstance.get('/offers');
    // Backend returns { data: OfferShape[] }
    return Array.isArray(envelope.data) ? envelope.data : (envelope.data?.offers || []);
  },

  /**
   * Upload a mortgage offer file.
   * @param {File} file
   * @param {Function} [onProgress] - (percent: number) => void
   * @returns {Promise<{ id: string, status: string }>}
   */
  async uploadOffer(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);
    const { data: envelope } = await axiosInstance.post('/offers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(Math.round((evt.loaded * 100) / evt.total));
        }
      },
    });
    return envelope.data || envelope;
  },

  // ── Analysis ──────────────────────────────────────────────────────────

  /**
   * Get a full offer with analysis by offer ID.
   * @param {string} offerId
   * @returns {Promise<object>} full OfferShape
   */
  async getAnalysis(offerId) {
    const { data: envelope } = await axiosInstance.get(`/analysis/${offerId}`);
    return envelope.data || envelope;
  },

  // ── Dashboard ─────────────────────────────────────────────────────────

  /**
   * Get aggregated dashboard data.
   * @returns {Promise<{ financials: object, recentOffers: object[], stats: object }>}
   */
  async getDashboard() {
    const { data: envelope } = await axiosInstance.get('/dashboard');
    return envelope.data || envelope;
  },
};

export default axiosInstance;
