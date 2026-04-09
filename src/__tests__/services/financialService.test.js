/**
 * Tests for financialService module.
 * Uses Vitest (vi) — aligned with the project's test setup.
 * Mock shapes use Firestore string IDs and ISO timestamps.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the api module (default export = axios instance)
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
  API_BASE_URL: 'https://morty-backend-h9sb.onrender.com/api/v1',
}));

import api from '../../services/api';
import * as financialService from '../../services/financialService';

/** Firestore-shaped mock financial profile */
const mockFinancials = {
  id: 'financial-doc-id',
  userId: 'firestore-uid-abc123',
  income: 15000,
  additionalIncome: 3000,
  expenses: { housing: 4000, loans: 1500, other: 800 },
  assets: { savings: 200000, investments: 50000 },
  debts: [{ type: 'car', amount: 30000 }],
  updatedAt: '2026-04-03T02:16:00.000Z',
};

describe('financialService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── normalizeFinancials ──────────────────────────────────────────────

  describe('normalizeFinancials', () => {
    it('should normalize a full Firestore financial document', () => {
      const result = financialService.normalizeFinancials(mockFinancials);
      expect(result.id).toBe('financial-doc-id');
      expect(result.userId).toBe('firestore-uid-abc123');
      expect(result.income).toBe(15000);
      expect(result.additionalIncome).toBe(3000);
      expect(result.expenses.housing).toBe(4000);
      expect(result.expenses.loans).toBe(1500);
      expect(result.expenses.other).toBe(800);
      expect(result.assets.savings).toBe(200000);
      expect(result.assets.investments).toBe(50000);
      expect(result.debts).toHaveLength(1);
      expect(result.updatedAt).toBe('2026-04-03T02:16:00.000Z');
    });

    it('should provide safe defaults for missing fields', () => {
      const result = financialService.normalizeFinancials({});
      expect(result.income).toBe(0);
      expect(result.additionalIncome).toBe(0);
      expect(result.expenses.housing).toBe(0);
      expect(result.expenses.loans).toBe(0);
      expect(result.expenses.other).toBe(0);
      expect(result.assets.savings).toBe(0);
      expect(result.assets.investments).toBe(0);
      expect(result.debts).toEqual([]);
      expect(result.updatedAt).toBeNull();
    });

    it('should fall back to _id when id is absent (backward compat)', () => {
      const result = financialService.normalizeFinancials({ _id: 'old-id', income: 5000 });
      expect(result.id).toBe('old-id');
    });

    it('should handle null/undefined nested objects gracefully', () => {
      const result = financialService.normalizeFinancials({
        income: 10000,
        expenses: null,
        assets: undefined,
        debts: null,
      });
      expect(result.expenses.housing).toBe(0);
      expect(result.assets.savings).toBe(0);
      expect(result.debts).toEqual([]);
    });

    it('should treat non-array debts as empty array', () => {
      const result = financialService.normalizeFinancials({ debts: 'invalid' });
      expect(result.debts).toEqual([]);
    });
  });

  // ── DEFAULT_FINANCIALS ───────────────────────────────────────────────

  describe('DEFAULT_FINANCIALS', () => {
    it('should export a valid default financial shape', () => {
      const defaults = financialService.DEFAULT_FINANCIALS;
      expect(defaults.income).toBe(0);
      expect(defaults.additionalIncome).toBe(0);
      expect(defaults.expenses).toEqual({ housing: 0, loans: 0, other: 0 });
      expect(defaults.assets).toEqual({ savings: 0, investments: 0 });
      expect(defaults.debts).toEqual([]);
    });
  });

  // ── getFinancials ────────────────────────────────────────────────────

  describe('getFinancials', () => {
    it('should call GET /profile and return normalized financials', async () => {
      api.get.mockResolvedValue({ data: { data: mockFinancials } });

      const result = await financialService.getFinancials();

      expect(api.get).toHaveBeenCalledWith('/profile');
      expect(result.income).toBe(15000);
      expect(result.expenses.housing).toBe(4000);
      expect(result.id).toBe('financial-doc-id');
    });

    it('should handle response without envelope wrapper', async () => {
      // Some responses may not have the nested data wrapper
      api.get.mockResolvedValue({ data: mockFinancials });

      const result = await financialService.getFinancials();
      expect(result.income).toBe(15000);
    });

    it('should return defaults when API returns null payload', async () => {
      api.get.mockResolvedValue({ data: { data: null } });

      const result = await financialService.getFinancials();
      expect(result.income).toBe(0);
      expect(result.expenses.housing).toBe(0);
    });

    it('should propagate API errors', async () => {
      api.get.mockRejectedValue(new Error('Network error'));
      await expect(financialService.getFinancials()).rejects.toThrow('Network error');
    });
  });

  // ── updateFinancials ─────────────────────────────────────────────────

  describe('updateFinancials', () => {
    it('should call PUT /profile with data and return normalized result', async () => {
      const updatePayload = { income: 20000, additionalIncome: 0 };
      api.put.mockResolvedValue({ data: { data: { ...mockFinancials, income: 20000 } } });

      const result = await financialService.updateFinancials(updatePayload);

      expect(api.put).toHaveBeenCalledWith('/profile', updatePayload);
      expect(result.income).toBe(20000);
    });

    it('should handle response without envelope wrapper', async () => {
      api.put.mockResolvedValue({ data: { ...mockFinancials, income: 18000 } });

      const result = await financialService.updateFinancials({ income: 18000 });
      expect(result.income).toBe(18000);
    });

    it('should propagate API errors', async () => {
      api.put.mockRejectedValue(new Error('Validation error'));
      await expect(
        financialService.updateFinancials({ income: -1 })
      ).rejects.toThrow('Validation error');
    });

    it('should normalize nested expenses in the response', async () => {
      const updated = { ...mockFinancials, expenses: { housing: 5000, loans: 2000, other: 500 } };
      api.put.mockResolvedValue({ data: { data: updated } });

      const result = await financialService.updateFinancials({ expenses: { housing: 5000 } });
      expect(result.expenses.housing).toBe(5000);
      expect(result.expenses.loans).toBe(2000);
    });
  });
});
