/**
 * AnalysisPage.test.jsx
 * Unit / integration tests for the AnalysisPage component.
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AnalysisPage from '../pages/AnalysisPage';
import api from '../services/api';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../services/api');
jest.mock('../hooks/useAnalysisStream', () => () => {});
jest.mock('../components/common/Toast', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

// Recharts uses ResizeObserver which is not available in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const renderPage = (id = 'offer-123') =>
  render(
    <MemoryRouter initialEntries={[`/analysis/${id}`]}>
      <Routes>
        <Route path="/analysis/:id" element={<AnalysisPage />} />
      </Routes>
    </MemoryRouter>
  );

const mockAnalyzedResponse = {
  data: {
    data: {
      id: 'offer-123',
      status: 'analyzed',
      createdAt: new Date().toISOString(),
      extractedData: {
        bank: 'Bank Hapoalim',
        amount: 1_200_000,
        rate: 3.8,
        term: 25,
      },
      analysis: {
        recommendedRate: 3.4,
        savings: 48_000,
        aiReasoning:
          'Based on your financial profile, this offer is above market rate by 0.4%.',
        monthlyPayment: 6_200,
        totalCost: 1_860_000,
        totalInterest: 660_000,
        marketAverageRate: 3.6,
        rateVsMarket: 0.2,
        debtToIncomeRatio: 0.32,
        affordabilityScore: 74,
        recommendations: [
          'Negotiate rate to 3.4% — saves ₪32,000',
          'Consider 20yr term — total cost -₪16,000',
        ],
      },
    },
  },
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AnalysisPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows skeleton while loading', () => {
    api.get.mockReturnValue(new Promise(() => {})); // never resolves
    renderPage();
    expect(screen.getByLabelText('Loading analysis results')).toBeInTheDocument();
  });

  it('renders analyzed results correctly', async () => {
    api.get.mockResolvedValueOnce(mockAnalyzedResponse);
    renderPage();

    await waitFor(() =>
      expect(screen.getByText('Bank Hapoalim')).toBeInTheDocument()
    );

    // AI Summary
    expect(
      screen.getByText(/above market rate by 0.4%/i)
    ).toBeInTheDocument();

    // Extracted terms
    expect(screen.getByText('Bank Hapoalim')).toBeInTheDocument();
    expect(screen.getByText('3.80%')).toBeInTheDocument();
    expect(screen.getByText('25 years')).toBeInTheDocument();

    // Recommendations
    expect(
      screen.getByText(/Negotiate rate to 3.4%/i)
    ).toBeInTheDocument();
  });

  it('shows processing state for pending offers', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: {
          id: 'offer-123',
          status: 'pending',
          createdAt: new Date().toISOString(),
          extractedData: null,
          analysis: null,
        },
      },
    });
    renderPage();

    await waitFor(() =>
      expect(screen.getByText(/Waiting for analysis/i)).toBeInTheDocument()
    );
  });

  it('shows error state and retry button on API failure', async () => {
    api.get.mockRejectedValueOnce({
      response: { data: { error: 'Analysis not found' } },
    });
    renderPage();

    await waitFor(() =>
      expect(screen.getByText('Analysis not found')).toBeInTheDocument()
    );
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('shows retry button for error status offers', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: {
          id: 'offer-123',
          status: 'error',
          createdAt: new Date().toISOString(),
          extractedData: null,
          analysis: null,
        },
      },
    });
    renderPage();

    await waitFor(() =>
      expect(screen.getByText('Analysis Failed')).toBeInTheDocument()
    );
    expect(screen.getByLabelText('Retry analysis')).toBeInTheDocument();
  });

  it('calls reanalyze endpoint on retry click', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: {
          id: 'offer-123',
          status: 'error',
          createdAt: new Date().toISOString(),
          extractedData: null,
          analysis: null,
        },
      },
    });
    api.post.mockResolvedValueOnce({ data: { success: true } });

    renderPage();

    await waitFor(() =>
      expect(screen.getByLabelText('Retry analysis')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText('Retry analysis'));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/analysis/offer-123/reanalyze')
    );
  });

  it('renders action buttons for analyzed offers', async () => {
    api.get.mockResolvedValueOnce(mockAnalyzedResponse);
    renderPage();

    await waitFor(() =>
      expect(screen.getByLabelText('Download analysis report as PDF')).toBeInTheDocument()
    );
    expect(
      screen.getByLabelText('Upload another mortgage offer')
    ).toBeInTheDocument();
  });
});
