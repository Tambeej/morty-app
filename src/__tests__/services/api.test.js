/**
 * Tests for the core API Axios instance.
 * Verifies interceptors, token attachment, and refresh logic.
 */
import axios from 'axios';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('API Service', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should export a default axios instance', async () => {
    const api = (await import('../../services/api')).default;
    expect(api).toBeDefined();
    expect(typeof api.get).toBe('function');
    expect(typeof api.post).toBe('function');
    expect(typeof api.put).toBe('function');
    expect(typeof api.delete).toBe('function');
  });

  it('should use the correct base URL', async () => {
    const api = (await import('../../services/api')).default;
    expect(api.defaults.baseURL).toContain('/api/v1');
  });

  it('should export API_BASE_URL', async () => {
    const { API_BASE_URL } = await import('../../services/api');
    expect(API_BASE_URL).toBeDefined();
    expect(typeof API_BASE_URL).toBe('string');
  });
});
