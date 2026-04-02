import axios from 'axios';

/**
 * Axios instance configured for the Morty backend API.
 * Base URL is read from REACT_APP_API_URL env var,
 * defaulting to http://localhost:5000/api/v1.
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

/**
 * Request interceptor — attaches JWT token from localStorage if present.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('morty_token');
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor — handles 401 by attempting token refresh.
 * On refresh failure, clears auth and redirects to login.
 */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('morty_refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('morty_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh`,
          { refreshToken }
        );
        const newToken = res.data?.token;
        const newRefresh = res.data?.refreshToken;

        localStorage.setItem('morty_token', newToken);
        if (newRefresh) localStorage.setItem('morty_refresh_token', newRefresh);

        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('morty_token');
        localStorage.removeItem('morty_refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
