import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    },
    defaults: { headers: { common: {} } }
  };
  return { default: mockAxios };
});

describe('apiService', () => {
  it('is importable without errors', async () => {
    const { apiService } = await import('../../services/api.js');
    expect(apiService).toBeDefined();
    expect(typeof apiService.login).toBe('function');
    expect(typeof apiService.register).toBe('function');
    expect(typeof apiService.logout).toBe('function');
    expect(typeof apiService.getFinancials).toBe('function');
    expect(typeof apiService.updateFinancials).toBe('function');
    expect(typeof apiService.getOffers).toBe('function');
    expect(typeof apiService.uploadOffer).toBe('function');
    expect(typeof apiService.getAnalysis).toBe('function');
    expect(typeof apiService.getDashboard).toBe('function');
  });
});
