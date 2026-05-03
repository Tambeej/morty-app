/**
 * portfolioService.test.js
 * Tests for the portfolio service API calls and storage utilities.
 */

import {
  savePortfolio,
  storeSelectedPortfolio,
  getStoredSelectedPortfolio,
  clearStoredSelectedPortfolio,
} from '../../services/portfolioService';
import * as storage from '../../utils/storage';

// Mock storage module
jest.mock('../../utils/storage');

// Mock fetch globally
global.fetch = jest.fn();

const mockPortfolio = {
  id: 'portfolio-123',
  name: 'Market Standard',
  nameHe: 'שוק סטנדרטי',
  monthlyRepayment: 5500,
};

describe('portfolioService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  describe('savePortfolio', () => {
    it('throws AUTH_REQUIRED when no token is stored', async () => {
      storage.getStoredToken.mockReturnValue(null);
      await expect(savePortfolio('portfolio-123')).rejects.toThrow('AUTH_REQUIRED');
    });

    it('makes authenticated POST request with portfolio ID', async () => {
      storage.getStoredToken.mockReturnValue('test-token');
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { saved: true } }),
      });

      const result = await savePortfolio('portfolio-123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/wizard/save'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ portfolioId: 'portfolio-123' }),
        })
      );
      expect(result).toEqual({ saved: true });
    });

    it('throws AUTH_REQUIRED on 401 response', async () => {
      storage.getStoredToken.mockReturnValue('expired-token');
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      await expect(savePortfolio('portfolio-123')).rejects.toThrow('AUTH_REQUIRED');
    });

    it('throws error with server message on non-401 failure', async () => {
      storage.getStoredToken.mockReturnValue('test-token');
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' }),
      });

      await expect(savePortfolio('portfolio-123')).rejects.toThrow('Internal server error');
    });

    it('throws generic error when server returns no message', async () => {
      storage.getStoredToken.mockReturnValue('test-token');
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({}),
      });

      await expect(savePortfolio('portfolio-123')).rejects.toThrow(/שגיאה בשמירת התיק/);
    });
  });

  describe('storeSelectedPortfolio', () => {
    it('stores portfolio in sessionStorage', () => {
      storeSelectedPortfolio(mockPortfolio);
      const stored = sessionStorage.getItem('morty_selected_portfolio');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored)).toEqual(mockPortfolio);
    });

    it('handles storage errors gracefully', () => {
      const originalSetItem = sessionStorage.setItem;
      sessionStorage.setItem = jest.fn(() => {
        throw new Error('Storage full');
      });
      // Should not throw
      expect(() => storeSelectedPortfolio(mockPortfolio)).not.toThrow();
      sessionStorage.setItem = originalSetItem;
    });
  });

  describe('getStoredSelectedPortfolio', () => {
    it('returns null when nothing is stored', () => {
      expect(getStoredSelectedPortfolio()).toBeNull();
    });

    it('returns the stored portfolio', () => {
      sessionStorage.setItem('morty_selected_portfolio', JSON.stringify(mockPortfolio));
      expect(getStoredSelectedPortfolio()).toEqual(mockPortfolio);
    });

    it('returns null on invalid JSON', () => {
      sessionStorage.setItem('morty_selected_portfolio', 'invalid-json{');
      expect(getStoredSelectedPortfolio()).toBeNull();
    });
  });

  describe('clearStoredSelectedPortfolio', () => {
    it('removes the stored portfolio', () => {
      sessionStorage.setItem('morty_selected_portfolio', JSON.stringify(mockPortfolio));
      clearStoredSelectedPortfolio();
      expect(sessionStorage.getItem('morty_selected_portfolio')).toBeNull();
    });

    it('does not throw when nothing is stored', () => {
      expect(() => clearStoredSelectedPortfolio()).not.toThrow();
    });
  });
});
