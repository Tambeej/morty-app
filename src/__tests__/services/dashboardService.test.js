/**
 * Tests for dashboardService module.
 * Uses Vitest (vi) — aligned with the project's test setup.
 * Mock shapes use Firestore string IDs and ISO timestamps.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the api module (default export = axios instance)
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
  },
  API_BASE_URL : import.meta.env.VITE_API_BASE_URL || 'https://morty-backend.onrender.com',
  //API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://morty-backend-h9sb.onrender.com/api/v1'
}));

import api from '../../services/api';
import * as dashboardService from '../../services/dashboardService';

/** Firestore-shaped mock financial profile */
const mockFinancials = {
  id: 'financial-doc-id',
  userId: 'firestore-uid-abc123',
  income: 15000,
  additionalIncome: 3000,
  expenses: { housing: 4000, loans: 1500, other: 800 },
  assets: { savings: 200000, investments: 50000 },
  debts: [],
  updatedAt: '2026-04-03T02:16:00.000Z',
};

/** Firestore-shaped mock offer */
const mockOffer = {
  id: 'offer-id-xyz',
  userId: 'firestore-uid-abc123',
  originalFile: { url: 'https://cdn.example.com/file.pdf', mimetype: 'application/pdf' },
  extractedData: { bank: 'הפועלים', amount: 1200000, rate: 3.5, term: 240 },
  analysis: { recommendedRate: 3.1, savings: 45000, aiReasoning: 'שיעור טוב יותר זמין.' },
  status: 'analyzed',
  createdAt: '2026-04-03T02:16:00.000Z',
  updatedAt: '2026-04-03T02:20:00.000Z',
};

/** Full dashboard API response */
const mockDashboardResponse = {
  financials: mockFinancials,
  recentOffers: [mockOffer],
  stats: { totalOffers: 5, savingsTotal: 120000 },
};

describe('dashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('should call GET /dashboard and return structured data', async () => {
      api.get.mockResolvedValue({ data: { data: mockDashboardResponse } });

      const result = await dashboardService.getDashboard();

      expect(api.get).toHaveBeenCalledWith('/dashboard');
      expect(result).toHaveProperty('financials');
      expect(result).toHaveProperty('recentOffers');
      expect(result).toHaveProperty('stats');
    });

    it('should normalize financials from Firestore shape', async () => {
      api.get.mockResolvedValue({ data: { data: mockDashboardResponse } });

      const result = await dashboardService.getDashboard();

      expect(result.financials.income).toBe(15000);
      expect(result.financials.expenses.housing).toBe(4000);
      expect(result.financials.assets.savings).toBe(200000);
    });

    it('should normalize recentOffers with string IDs', async () => {
      api.get.mockResolvedValue({ data: { data: mockDashboardResponse } });

      const result = await dashboardService.getDashboard();

      expect(Array.isArray(result.recentOffers)).toBe(true);
      expect(result.recentOffers[0].id).toBe('offer-id-xyz');
      expect(typeof result.recentOffers[0].id).toBe('string');
    });

    it('should normalize offer analysis fields', async () => {
      api.get.mockResolvedValue({ data: { data: mockDashboardResponse } });

      const result = await dashboardService.getDashboard();

      expect(result.recentOffers[0].analysis.savings).toBe(45000);
      expect(result.recentOffers[0].analysis.recommendedRate).toBe(3.1);
    });

    it('should return correct stats', async () => {
      api.get.mockResolvedValue({ data: { data: mockDashboardResponse } });

      const result = await dashboardService.getDashboard();

      expect(result.stats.totalOffers).toBe(5);
      expect(result.stats.savingsTotal).toBe(120000);
    });

    it('should handle response without envelope wrapper', async () => {
      api.get.mockResolvedValue({ data: mockDashboardResponse });

      const result = await dashboardService.getDashboard();
      expect(result.financials.income).toBe(15000);
    });

    it('should return empty recentOffers when not present', async () => {
      api.get.mockResolvedValue({
        data: {
          data: {
            financials: mockFinancials,
            recentOffers: [],
            stats: { totalOffers: 0, savingsTotal: 0 },
          },
        },
      });

      const result = await dashboardService.getDashboard();
      expect(result.recentOffers).toEqual([]);
    });

    it('should default stats to zero when missing', async () => {
      api.get.mockResolvedValue({
        data: {
          data: {
            financials: mockFinancials,
            recentOffers: [],
            stats: {},
          },
        },
      });

      const result = await dashboardService.getDashboard();
      expect(result.stats.totalOffers).toBe(0);
      expect(result.stats.savingsTotal).toBe(0);
    });

    it('should use DEFAULT_FINANCIALS when financials is missing', async () => {
      api.get.mockResolvedValue({
        data: {
          data: {
            recentOffers: [],
            stats: { totalOffers: 0, savingsTotal: 0 },
          },
        },
      });

      const result = await dashboardService.getDashboard();
      expect(result.financials.income).toBe(0);
      expect(result.financials.expenses.housing).toBe(0);
    });

    it('should preserve ISO timestamps in recentOffers', async () => {
      api.get.mockResolvedValue({ data: { data: mockDashboardResponse } });

      const result = await dashboardService.getDashboard();
      expect(result.recentOffers[0].createdAt).toBe('2026-04-03T02:16:00.000Z');
    });

    it('should propagate API errors', async () => {
      api.get.mockRejectedValue(new Error('Unauthorized'));
      await expect(dashboardService.getDashboard()).rejects.toThrow('Unauthorized');
    });

    it('should handle multiple recentOffers', async () => {
      const secondOffer = {
        ...mockOffer,
        id: 'offer-id-second',
        status: 'pending',
        analysis: null,
        createdAt: '2026-04-02T10:00:00.000Z',
      };
      api.get.mockResolvedValue({
        data: {
          data: {
            ...mockDashboardResponse,
            recentOffers: [mockOffer, secondOffer],
          },
        },
      });

      const result = await dashboardService.getDashboard();
      expect(result.recentOffers).toHaveLength(2);
      expect(result.recentOffers[1].id).toBe('offer-id-second');
      expect(result.recentOffers[1].analysis).toBeNull();
    });
  });
});
