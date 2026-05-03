/**
 * Tests for offersService module.
 * Uses Vitest (vi) — aligned with the project's test setup.
 * Mock shapes use Firestore string IDs and ISO timestamps.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
  API_BASE_URL : import.meta.env.VITE_API_BASE_URL || 'https://morty-backend.onrender.com',
  //API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://morty-backend-h9sb.onrender.com/api/v1'
}));

import api from '../../services/api';
import * as offersService from '../../services/offersService';

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

describe('offersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('normalizeOffer', () => {
    it('should normalize a Firestore offer with string id', () => {
      const result = offersService.normalizeOffer(mockOffer);
      expect(result.id).toBe('offer-id-xyz');
      expect(result.status).toBe('analyzed');
      expect(result.extractedData.bank).toBe('הפועלים');
      expect(result.analysis.savings).toBe(45000);
    });

    it('should fall back to _id when id is absent', () => {
      const result = offersService.normalizeOffer({ _id: 'old-id', status: 'pending' });
      expect(result.id).toBe('old-id');
    });

    it('should set analysis to null when absent', () => {
      const result = offersService.normalizeOffer({ id: 'abc', status: 'pending' });
      expect(result.analysis).toBeNull();
    });

    it('should provide safe defaults for missing extractedData', () => {
      const result = offersService.normalizeOffer({ id: 'abc', status: 'pending' });
      expect(result.extractedData.bank).toBeNull();
      expect(result.extractedData.amount).toBeNull();
    });

    it('should preserve ISO timestamp strings', () => {
      const result = offersService.normalizeOffer(mockOffer);
      expect(result.createdAt).toBe('2026-04-03T02:16:00.000Z');
      expect(result.updatedAt).toBe('2026-04-03T02:20:00.000Z');
    });
  });

  describe('listOffers', () => {
    it('should call GET /offers and return normalized array', async () => {
      api.get.mockResolvedValue({ data: { data: [mockOffer] } });

      const result = await offersService.listOffers();
      expect(api.get).toHaveBeenCalledWith('/offers');
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].id).toBe('offer-id-xyz');
    });

    it('should return empty array when data is empty', async () => {
      api.get.mockResolvedValue({ data: { data: [] } });
      const result = await offersService.listOffers();
      expect(result).toEqual([]);
    });

    it('should handle paginated response with offers array', async () => {
      api.get.mockResolvedValue({ data: { data: { offers: [mockOffer] } } });
      const result = await offersService.listOffers();
      expect(result[0].id).toBe('offer-id-xyz');
    });
  });

  describe('uploadOffer', () => {
    it('should call POST /offers with multipart/form-data and return { id, status }', async () => {
      api.post.mockResolvedValue({
        data: { data: { id: 'new-offer-id', status: 'pending' } },
      });

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const result = await offersService.uploadOffer(file);

      expect(api.post).toHaveBeenCalledWith(
        '/offers',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
      expect(result.id).toBe('new-offer-id');
      expect(result.status).toBe('pending');
    });
  });

  describe('getOffer', () => {
    it('should call GET /analysis/:id and return normalized offer', async () => {
      api.get.mockResolvedValue({ data: { data: mockOffer } });

      const result = await offersService.getOffer('offer-id-xyz');
      expect(api.get).toHaveBeenCalledWith('/analysis/offer-id-xyz');
      expect(result.id).toBe('offer-id-xyz');
    });
  });
});
