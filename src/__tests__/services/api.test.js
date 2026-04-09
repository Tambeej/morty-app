/**
 * Tests for the core API Axios instance and apiService.
 * Uses Vitest (vi) — aligned with the project's test setup.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock storage utilities
vi.mock('../../utils/storage', () => ({
  getStoredToken: vi.fn(() => null),
  getStoredRefreshToken: vi.fn(() => null),
  setStoredToken: vi.fn(),
  setStoredRefreshToken: vi.fn(),
  clearStoredTokens: vi.fn(),
  getStoredUser: vi.fn(() => null),
  setStoredUser: vi.fn(),
  isAuthenticated: vi.fn(() => false),
}));

// Mock axios to avoid real HTTP calls
vi.mock('axios', () => {
  const mockInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: { baseURL: 'https://morty-backend-h9sb.onrender.com/api/v1', headers: { common: {} } },
  };
  return {
    default: {
      create: vi.fn(() => mockInstance),
      post: vi.fn(),
      ...mockInstance,
    },
  };
});

describe('API Service', () => {
  it('should export API_BASE_URL as a string containing /api/v1', async () => {
    const { API_BASE_URL } = await import('../../services/api.js');
    expect(typeof API_BASE_URL).toBe('string');
    expect(API_BASE_URL).toContain('/api/v1');
  });

  it('should export a default axios instance with HTTP methods', async () => {
    const api = (await import('../../services/api.js')).default;
    expect(api).toBeDefined();
    expect(typeof api.get).toBe('function');
    expect(typeof api.post).toBe('function');
    expect(typeof api.put).toBe('function');
  });

  it('should export apiService with all required methods', async () => {
    const { apiService } = await import('../../services/api.js');
    expect(apiService).toBeDefined();
    expect(typeof apiService.login).toBe('function');
    expect(typeof apiService.register).toBe('function');
    expect(typeof apiService.logout).toBe('function');
    expect(typeof apiService.refreshToken).toBe('function');
    expect(typeof apiService.getMe).toBe('function');
    expect(typeof apiService.getFinancials).toBe('function');
    expect(typeof apiService.updateFinancials).toBe('function');
    expect(typeof apiService.getOffers).toBe('function');
    expect(typeof apiService.uploadOffer).toBe('function');
    expect(typeof apiService.getAnalysis).toBe('function');
    expect(typeof apiService.getDashboard).toBe('function');
    expect(typeof apiService.setAuthToken).toBe('function');
  });
});
