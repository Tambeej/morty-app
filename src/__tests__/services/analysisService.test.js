/**
 * Tests for analysisService module.
 * Uses Vitest (vi) — aligned with the project's test setup.
 * Mock shapes use Firestore string IDs and ISO timestamps.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the api module (default export = axios instance)
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
  },
  API_BASE_URL: 'https://morty-backend.onrender.com/api/v1',
}));

// Mock storage utilities
vi.mock('../../utils/storage', () => ({
  getStoredToken: vi.fn(() => 'mock-access-token'),
  getStoredRefreshToken: vi.fn(() => null),
  setStoredToken: vi.fn(),
  setStoredRefreshToken: vi.fn(),
  clearStoredTokens: vi.fn(),
  getStoredUser: vi.fn(() => null),
  setStoredUser: vi.fn(),
  isAuthenticated: vi.fn(() => true),
}));

import api from '../../services/api';
import * as analysisService from '../../services/analysisService';

/** Firestore-shaped mock offer with analysis */
const mockAnalyzedOffer = {
  id: 'offer-id-xyz',
  userId: 'firestore-uid-abc123',
  originalFile: { url: 'https://cdn.example.com/file.pdf', mimetype: 'application/pdf' },
  extractedData: { bank: 'הפועלים', amount: 1200000, rate: 3.5, term: 240 },
  analysis: { recommendedRate: 3.1, savings: 45000, aiReasoning: 'שיעור טוב יותר זמין.' },
  status: 'analyzed',
  createdAt: '2026-04-03T02:16:00.000Z',
  updatedAt: '2026-04-03T02:20:00.000Z',
};

/** Firestore-shaped mock offer in pending state */
const mockPendingOffer = {
  id: 'offer-id-pending',
  userId: 'firestore-uid-abc123',
  originalFile: { url: 'https://cdn.example.com/pending.pdf', mimetype: 'application/pdf' },
  extractedData: { bank: null, amount: null, rate: null, term: null },
  analysis: null,
  status: 'pending',
  createdAt: '2026-04-03T03:00:00.000Z',
  updatedAt: '2026-04-03T03:00:00.000Z',
};

describe('analysisService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── getAnalysis ──────────────────────────────────────────────────────

  describe('getAnalysis', () => {
    it('should call GET /analysis/:id and return normalized offer', async () => {
      api.get.mockResolvedValue({ data: { data: mockAnalyzedOffer } });

      const result = await analysisService.getAnalysis('offer-id-xyz');

      expect(api.get).toHaveBeenCalledWith('/analysis/offer-id-xyz');
      expect(result.id).toBe('offer-id-xyz');
      expect(result.status).toBe('analyzed');
    });

    it('should normalize analysis fields from Firestore shape', async () => {
      api.get.mockResolvedValue({ data: { data: mockAnalyzedOffer } });

      const result = await analysisService.getAnalysis('offer-id-xyz');

      expect(result.analysis.recommendedRate).toBe(3.1);
      expect(result.analysis.savings).toBe(45000);
      expect(result.analysis.aiReasoning).toBe('שיעור טוב יותר זמין.');
    });

    it('should normalize extractedData fields', async () => {
      api.get.mockResolvedValue({ data: { data: mockAnalyzedOffer } });

      const result = await analysisService.getAnalysis('offer-id-xyz');

      expect(result.extractedData.bank).toBe('הפועלים');
      expect(result.extractedData.amount).toBe(1200000);
      expect(result.extractedData.rate).toBe(3.5);
      expect(result.extractedData.term).toBe(240);
    });

    it('should handle pending offer with null analysis', async () => {
      api.get.mockResolvedValue({ data: { data: mockPendingOffer } });

      const result = await analysisService.getAnalysis('offer-id-pending');

      expect(result.id).toBe('offer-id-pending');
      expect(result.status).toBe('pending');
      expect(result.analysis).toBeNull();
    });

    it('should handle response without envelope wrapper', async () => {
      api.get.mockResolvedValue({ data: mockAnalyzedOffer });

      const result = await analysisService.getAnalysis('offer-id-xyz');
      expect(result.id).toBe('offer-id-xyz');
    });

    it('should propagate API errors', async () => {
      api.get.mockRejectedValue(new Error('Not found'));
      await expect(analysisService.getAnalysis('bad-id')).rejects.toThrow('Not found');
    });

    it('should use string IDs (not ObjectIds)', async () => {
      api.get.mockResolvedValue({ data: { data: mockAnalyzedOffer } });

      const result = await analysisService.getAnalysis('offer-id-xyz');
      // Firestore IDs are strings, not ObjectId objects
      expect(typeof result.id).toBe('string');
    });

    it('should preserve ISO timestamp strings', async () => {
      api.get.mockResolvedValue({ data: { data: mockAnalyzedOffer } });

      const result = await analysisService.getAnalysis('offer-id-xyz');
      expect(result.createdAt).toBe('2026-04-03T02:16:00.000Z');
      expect(result.updatedAt).toBe('2026-04-03T02:20:00.000Z');
    });
  });

  // ── streamAnalysis ───────────────────────────────────────────────────

  describe('streamAnalysis', () => {
    let mockEventSource;
    let originalEventSource;

    beforeEach(() => {
      originalEventSource = global.EventSource;
      mockEventSource = {
        onmessage: null,
        onerror: null,
        close: vi.fn(),
        readyState: 1,
      };
      global.EventSource = vi.fn(() => mockEventSource);
    });

    afterEach(() => {
      global.EventSource = originalEventSource;
    });

    it('should create an EventSource with the correct URL', () => {
      analysisService.streamAnalysis('offer-id-xyz', {});

      expect(global.EventSource).toHaveBeenCalledWith(
        expect.stringContaining('/analysis/offer-id-xyz/stream')
      );
    });

    it('should include the token in the SSE URL', () => {
      analysisService.streamAnalysis('offer-id-xyz', {});

      const url = global.EventSource.mock.calls[0][0];
      expect(url).toContain('token=');
      expect(url).toContain('mock-access-token');
    });

    it('should return the EventSource instance', () => {
      const result = analysisService.streamAnalysis('offer-id-xyz', {});
      expect(result).toBe(mockEventSource);
    });

    it('should call onMessage callback when message received', () => {
      const onMessage = vi.fn();
      analysisService.streamAnalysis('offer-id-xyz', { onMessage });

      // Simulate a message event
      mockEventSource.onmessage({ data: JSON.stringify({ status: 'pending', id: 'offer-id-xyz' }) });

      expect(onMessage).toHaveBeenCalledWith({ status: 'pending', id: 'offer-id-xyz' });
    });

    it('should close stream and call onComplete when status is analyzed', () => {
      const onComplete = vi.fn();
      analysisService.streamAnalysis('offer-id-xyz', { onComplete });

      mockEventSource.onmessage({
        data: JSON.stringify({ status: 'analyzed', id: 'offer-id-xyz' }),
      });

      expect(mockEventSource.close).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalledWith({ status: 'analyzed', id: 'offer-id-xyz' });
    });

    it('should close stream and call onComplete when status is error', () => {
      const onComplete = vi.fn();
      analysisService.streamAnalysis('offer-id-xyz', { onComplete });

      mockEventSource.onmessage({
        data: JSON.stringify({ status: 'error', id: 'offer-id-xyz' }),
      });

      expect(mockEventSource.close).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
    });

    it('should call onError and close on SSE error', () => {
      const onError = vi.fn();
      analysisService.streamAnalysis('offer-id-xyz', { onError });

      mockEventSource.onerror(new Error('SSE connection failed'));

      expect(mockEventSource.close).toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
    });

    it('should return null when EventSource is not supported', () => {
      delete global.EventSource;

      const result = analysisService.streamAnalysis('offer-id-xyz', {});
      expect(result).toBeNull();
    });
  });
});
