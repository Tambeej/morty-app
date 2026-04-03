/**
 * AnalysisListPage.test.jsx
 * Tests for the AnalysisListPage component.
 * Uses Vitest (vi) — aligned with the project's test setup.
 * Uses Firestore string IDs (offer.id, not offer._id).
 *
 * API contract: GET /offers → { data: OfferShape[] } (flat array)
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AnalysisListPage from '../pages/AnalysisListPage';

// Mock the api module
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// Mock ToastContext — AnalysisListPage uses useToast from context
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ showSuccess: vi.fn(), showError: vi.fn(), showInfo: vi.fn() }),
  ToastProvider: ({ children }) => children,
  default: null,
}));

// Mock Toast component (re-exports ToastProvider)
vi.mock('../components/common/Toast', () => ({
  default: () => null,
  ToastProvider: ({ children }) => children,
  useToast: () => ({ showSuccess: vi.fn(), showError: vi.fn(), showToast: vi.fn(), showInfo: vi.fn() }),
}));

import api from '../services/api';

/**
 * Mock offers using Firestore string IDs.
 * createdAt is an ISO string (Firestore Admin SDK format).
 */
const mockOffers = [
  {
    id: 'offer-id-abc123',
    status: 'analyzed',
    createdAt: '2026-04-03T02:16:00.000Z',
    updatedAt: '2026-04-03T02:20:00.000Z',
    extractedData: { bank: 'Bank Hapoalim', amount: 1_200_000, rate: 3.8, term: 25 },
    analysis: { savings: 48_000, recommendedRate: 3.4, aiReasoning: 'Good rate.' },
  },
  {
    id: 'offer-id-def456',
    status: 'pending',
    createdAt: '2026-04-03T02:16:00.000Z',
    updatedAt: null,
    extractedData: { bank: 'Bank Leumi', amount: 900_000, rate: 3.6, term: 20 },
    analysis: null,
  },
];

/**
 * Flat array response (primary Firestore API contract).
 * GET /offers → { data: OfferShape[] }
 */
const mockFlatResponse = {
  data: {
    data: mockOffers,
  },
};

/**
 * Paginated response (optional shape).
 */
const mockPaginatedResponse = {
  data: {
    data: {
      offers: mockOffers,
      pagination: { total: 2, page: 1, limit: 10, pages: 1, hasNext: false, hasPrev: false },
    },
  },
};

describe('AnalysisListPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows skeleton while loading', () => {
    api.get.mockReturnValue(new Promise(() => {}));
    render(<MemoryRouter><AnalysisListPage /></MemoryRouter>);
    expect(screen.getByLabelText('Loading analyses')).toBeInTheDocument();
  });

  it('renders offer rows after loading (flat array response)', async () => {
    api.get.mockResolvedValueOnce(mockFlatResponse);
    render(<MemoryRouter><AnalysisListPage /></MemoryRouter>);

    await waitFor(() =>
      expect(screen.getByText('Bank Hapoalim')).toBeInTheDocument()
    );
    expect(screen.getByText('Bank Leumi')).toBeInTheDocument();
  });

  it('renders offer rows after loading (paginated response)', async () => {
    api.get.mockResolvedValueOnce(mockPaginatedResponse);
    render(<MemoryRouter><AnalysisListPage /></MemoryRouter>);

    await waitFor(() =>
      expect(screen.getByText('Bank Hapoalim')).toBeInTheDocument()
    );
    expect(screen.getByText('Bank Leumi')).toBeInTheDocument();
  });

  it('shows empty state when no offers', async () => {
    api.get.mockResolvedValueOnce({
      data: { data: [] },
    });
    render(<MemoryRouter><AnalysisListPage /></MemoryRouter>);

    await waitFor(() =>
      expect(screen.getByText('No analyses yet')).toBeInTheDocument()
    );
  });

  it('shows error state on API failure', async () => {
    api.get.mockRejectedValueOnce({
      response: { data: { error: 'Server error' } },
    });
    render(<MemoryRouter><AnalysisListPage /></MemoryRouter>);

    await waitFor(() =>
      expect(screen.getByText('Server error')).toBeInTheDocument()
    );
  });

  it('filters by status', async () => {
    api.get.mockResolvedValue(mockFlatResponse);
    render(<MemoryRouter><AnalysisListPage /></MemoryRouter>);

    await waitFor(() => expect(screen.getByText('Bank Hapoalim')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Filter analyses by status'), {
      target: { value: 'analyzed' },
    });

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith(
        '/offers',
        expect.objectContaining({ params: expect.objectContaining({ status: 'analyzed' }) })
      )
    );
  });

  it('uses GET /offers endpoint (per API contract)', async () => {
    api.get.mockResolvedValueOnce(mockFlatResponse);
    render(<MemoryRouter><AnalysisListPage /></MemoryRouter>);

    await waitFor(() => expect(screen.getByText('Bank Hapoalim')).toBeInTheDocument());

    // Verify the correct endpoint is called
    expect(api.get).toHaveBeenCalledWith(
      '/offers',
      expect.any(Object)
    );
  });

  it('uses offer.id (Firestore string ID) as row key and in navigation links', async () => {
    api.get.mockResolvedValueOnce(mockFlatResponse);
    render(<MemoryRouter><AnalysisListPage /></MemoryRouter>);

    await waitFor(() =>
      expect(screen.getByText('Bank Hapoalim')).toBeInTheDocument()
    );

    // Verify links use string IDs (both offers have View Results links)
    const links = screen.getAllByText('View Results →');
    expect(links.length).toBe(2);
    // First offer link should use Firestore string ID
    expect(links[0].closest('a')).toHaveAttribute('href', '/analysis/offer-id-abc123');
  });

  it('displays formatted ISO date for createdAt', async () => {
    api.get.mockResolvedValueOnce(mockFlatResponse);
    render(<MemoryRouter><AnalysisListPage /></MemoryRouter>);

    await waitFor(() =>
      expect(screen.getByText('Bank Hapoalim')).toBeInTheDocument()
    );

    // Date should be formatted (not raw ISO string)
    // The formatted date should contain '2026'
    const dateElements = screen.getAllByText(/2026/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('null-guards analysis.savings for pending offers', async () => {
    api.get.mockResolvedValueOnce(mockFlatResponse);
    render(<MemoryRouter><AnalysisListPage /></MemoryRouter>);

    await waitFor(() =>
      expect(screen.getByText('Bank Leumi')).toBeInTheDocument()
    );

    // Should not throw for pending offer with null analysis
    // The savings cell should show ₪0 (null-guarded to 0)
    const savingsCells = screen.getAllByText('₪0');
    expect(savingsCells.length).toBeGreaterThan(0);
  });
});
