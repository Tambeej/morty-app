import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  async logout() {
    const refreshToken = localStorage.getItem('morty_refresh_token');
    await api.post('/auth/logout', { refreshToken });
  },
  async refreshToken() {
    const refreshToken = localStorage.getItem('morty_refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');
    const response = await api.post('/auth/refresh', { refreshToken });
    const { token } = response.data;
    localStorage.setItem('morty_access_token', token);
    return response.data;
  },
  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data.user;
  }
};
