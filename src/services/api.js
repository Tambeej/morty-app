import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://morty-backend.onrender.com/api/v1';

/**
 * Axios instance pre-configured for the Morty backend.
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ── Request interceptor: attach Bearer token ──────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('morty_token');
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
      const refreshToken = localStorage.getItem('morty_refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem('morty_token', data.token);
          axiosInstance.defaults.headers.common.Authorization = `Bearer ${data.token}`;
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return axiosInstance(originalRequest);
        } catch {
          // Refresh failed — clear storage and redirect to login
          localStorage.removeItem('morty_token');
          localStorage.removeItem('morty_refresh_token');
          localStorage.removeItem('morty_user');
          window.location.href = '/morty-app/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Central API service object.
 * All methods return the `data` field from the Axios response.
 */
export const apiService = {
  // ── Auth ──────────────────────────────────────────────────────────────

  /** Set or clear the Authorization header */
  setAuthToken(token) {
    if (token) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common.Authorization;
    }
  },

  /**
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{token: string, refreshToken: string, user: object}>}
   */
  async login(email, password) {
    const { data } = await axiosInstance.post('/auth/login', { email, password });
    return data;
  },

  /**
   * @param {{name: string, email: string, phone: string, password: string}} userData
   * @returns {Promise<{token: string, refreshToken: string, user: object}>}
   */
  async register(userData) {
    const { data } = await axiosInstance.post('/auth/register', userData);
    return data;
  },

  /** Invalidate the refresh token on the server */
  async logout() {
    const refreshToken = localStorage.getItem('morty_refresh_token');
    const { data } = await axiosInstance.post('/auth/logout', { refreshToken });
    return data;
  },

  // ── Financial Profile ─────────────────────────────────────────────────

  /** @returns {Promise<object>} */
  async getFinancials() {
    const { data } = await axiosInstance.get('/profile');
    return data;
  },

  /**
   * @param {object} financials
   * @returns {Promise<object>}
   */
  async updateFinancials(financials) {
    const { data } = await axiosInstance.put('/profile', financials);
    return data;
  },

  // ── Offers ────────────────────────────────────────────────────────────

  /** @returns {Promise<object[]>} */
  async getOffers() {
    const { data } = await axiosInstance.get('/offers');
    return data;
  },

  /**
   * Upload a mortgage offer file.
   * @param {File} file
   * @param {Function} onProgress - (percent: number) => void
   * @returns {Promise<object>}
   */
  async uploadOffer(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await axiosInstance.post('/offers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(Math.round((evt.loaded * 100) / evt.total));
        }
      }
    });
    return data;
  },

  // ── Analysis ──────────────────────────────────────────────────────────

  /**
   * @param {string} offerId
   * @returns {Promise<object>}
   */
  async getAnalysis(offerId) {
    const { data } = await axiosInstance.get(`/analysis/${offerId}`);
    return data;
  },

  // ── Dashboard ─────────────────────────────────────────────────────────

  /** @returns {Promise<object>} */
  async getDashboard() {
    const { data } = await axiosInstance.get('/dashboard');
    return data;
  }
};

export default axiosInstance;
