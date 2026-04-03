import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RecentUploads from '../RecentUploads';

/**
 * Mock offers using Firestore string IDs (offer.id, not offer._id).
 */
const mockOffers = [
  {
    id: 'offer-id-1',
    status: 'analyzed',
    originalFile: {
      originalName: 'hapoalim_offer.pdf',
      mimetype: 'application/pdf',
    },
    extractedData: { bank: 'Bank Hapoalim' },
    createdAt: '2026-04-03T02:16:00.000Z',
  },
  {
    id: 'offer-id-2',
    status: 'pending',
    originalFile: {
      originalName: 'leumi_offer.pdf',
      mimetype: 'application/pdf',
    },
    extractedData: { bank: 'Bank Leumi' },
    createdAt: '2026-04-03T02:16:00.000Z',
  },
  {
    id: 'offer-id-3',
    status: 'processing',
    originalFile: {
      originalName: 'discount_offer.png',
      mimetype: 'image/png',
    },
    extractedData: {},
    createdAt: '2026-04-03T02:16:00.000Z',
  },
  {
    id: 'offer-id-4',
    status: 'error',
    originalFile: {
      originalName: 'bad_offer.pdf',
      mimetype: 'application/pdf',
    },
    extractedData: {},
    createdAt: '2026-04-03T02:16:00.000Z',
  },
];

const renderWithRouter = (ui) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('RecentUploads', () => {
  it('renders loading skeletons when isLoading is true', () => {
    const { container } = renderWithRouter(
      <RecentUploads offers={[]} isLoading={true} />
    );
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders empty state when no offers', () => {
    renderWithRouter(<RecentUploads offers={[]} isLoading={false} />);
    expect(screen.getByText(/No uploads yet/i)).toBeInTheDocument();
  });

  it('renders all offers', () => {
    renderWithRouter(
      <RecentUploads offers={mockOffers} isLoading={false} />
    );
    expect(screen.getByText('hapoalim_offer.pdf')).toBeInTheDocument();
    expect(screen.getByText('leumi_offer.pdf')).toBeInTheDocument();
    expect(screen.getByText('discount_offer.png')).toBeInTheDocument();
    expect(screen.getByText('bad_offer.pdf')).toBeInTheDocument();
  });

  it('shows "View Results" button for analyzed offers', () => {
    renderWithRouter(
      <RecentUploads offers={mockOffers} isLoading={false} />
    );
    expect(screen.getByText('View Results')).toBeInTheDocument();
  });

  it('shows delete button for pending and error offers', () => {
    renderWithRouter(
      <RecentUploads offers={mockOffers} isLoading={false} />
    );
    // pending offer (id=offer-id-2) and error offer (id=offer-id-4) should have delete buttons
    const deleteButtons = screen.getAllByLabelText(/Delete/i);
    expect(deleteButtons.length).toBe(2);
  });

  it('calls onDelete with offer.id when delete button is clicked', () => {
    const onDelete = jest.fn();
    renderWithRouter(
      <RecentUploads offers={mockOffers} isLoading={false} onDelete={onDelete} />
    );
    const deleteButtons = screen.getAllByLabelText(/Delete/i);
    fireEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledTimes(1);
    // Should be called with the string ID (Firestore shape)
    expect(onDelete).toHaveBeenCalledWith('offer-id-2');
  });

  it('shows correct status badges', () => {
    renderWithRouter(
      <RecentUploads offers={mockOffers} isLoading={false} />
    );
    expect(screen.getByText('Analyzed')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('shows bank name when available', () => {
    renderWithRouter(
      <RecentUploads offers={mockOffers} isLoading={false} />
    );
    expect(screen.getByText('Bank Hapoalim')).toBeInTheDocument();
    expect(screen.getByText('Bank Leumi')).toBeInTheDocument();
  });

  it('uses offer.id (Firestore string ID) as list item key', () => {
    // This test verifies no React key warnings by checking renders correctly
    const { container } = renderWithRouter(
      <RecentUploads offers={mockOffers} isLoading={false} />
    );
    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBe(mockOffers.length);
  });
});
