/**
 * AnalysisListPage.test.jsx
 * Tests for the AnalysisListPage component.
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AnalysisListPage from '../pages/AnalysisListPage';
import api from '../services/api';

jest.mock('../services/api');
jest.mock('../components/common/Toast', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

const mockOffers = [
  {
    _id: 'offer-1',
    status: 'analyzed',
    createdAt: new Date().toISOString(),
    extractedData: { bank: 'Bank Hapoalim', amount: 1_200_000, rate: 3.8, term: 25 },
    analysis: { savings: 48_000 },
  },
  {
    _id: 'offer-2',
    status: 'pending',
    createdAt: new Date().toISOString(),
    extractedData: { bank: 'Bank Leumi', amount: 900_000, rate: 3.6, term: 20 },
    analysis: null,
  },
];

const mockResponse = {
  data: {
    data: {
      offers: mockOffers,
      pagination: { total: 2, page: 1, limit: 10, pages: 1, hasNext: false, hasPrev: false },
    },
  },
};

describe('AnalysisListPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows skeleton while loading', () => {
    api.get.mockReturnValue(new Promise(() => {}));
    render(<MemoryRouter><AnalysisListPage /></MemoryRouter>);
    expect(screen.getByLabelText('Loading analyses')).toBeInTheDocument();
  });

  it('renders offer rows after loading', async () => {
    api.get.mockResolvedValueOnce(mockResponse);
    render(<MemoryRouter><AnalysisListPage /></MemoryRouter>);

    await waitFor(() =>
      expect(screen.getByText('Bank Hapoalim')).toBeInTheDocument()
    );
    expect(screen.getByText('Bank Leumi')).toBeInTheDocument();
  });

  it('shows empty state when no offers', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: {
          offers: [],
          pagination: { total: 0, page: 1, limit: 10, pages: 0, hasNext: false, hasPrev: false },
        },
      },
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
    api.get.mockResolvedValue(mockResponse);
    render(<MemoryRouter><AnalysisListPage /></MemoryRouter>);

    await waitFor(() => expect(screen.getByText('Bank Hapoalim')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Filter analyses by status'), {
      target: { value: 'analyzed' },
    });

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith(
        '/analysis',
        expect.objectContaining({ params: expect.objectContaining({ status: 'analyzed' }) })
      )
    );
  });
});
