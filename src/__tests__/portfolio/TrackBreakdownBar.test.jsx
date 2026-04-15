/**
 * Tests for TrackBreakdownBar component.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrackBreakdownBar from '../../components/portfolio/TrackBreakdownBar';

const mockTracks = [
  {
    name: 'קל"צ',
    nameEn: 'Fixed',
    type: 'fixed',
    percentage: 40,
    rate: 3.8,
    rateDisplay: '3.80%',
  },
  {
    name: 'פריים',
    nameEn: 'Prime',
    type: 'prime',
    percentage: 30,
    rate: 1.5,
    rateDisplay: 'P-0.5%',
  },
  {
    name: 'צמוד מדד',
    nameEn: 'CPI',
    type: 'cpi',
    percentage: 30,
    rate: 2.1,
    rateDisplay: '2.10%+CPI',
  },
];

describe('TrackBreakdownBar', () => {
  it('renders all tracks', () => {
    render(<TrackBreakdownBar tracks={mockTracks} />);
    expect(screen.getByText('קל"צ')).toBeInTheDocument();
    expect(screen.getByText('פריים')).toBeInTheDocument();
    expect(screen.getByText('צמוד מדד')).toBeInTheDocument();
  });

  it('renders percentage values', () => {
    render(<TrackBreakdownBar tracks={mockTracks} />);
    // Check that percentages are displayed
    expect(screen.getByText(/40%/)).toBeInTheDocument();
    expect(screen.getByText(/30%/)).toBeInTheDocument();
  });

  it('renders rate display values', () => {
    render(<TrackBreakdownBar tracks={mockTracks} />);
    expect(screen.getByText(/3.80%/)).toBeInTheDocument();
    expect(screen.getByText(/P-0.5%/)).toBeInTheDocument();
  });

  it('shows empty state when no tracks provided', () => {
    render(<TrackBreakdownBar tracks={[]} />);
    expect(screen.getByText('אין מסלולים להצגה')).toBeInTheDocument();
  });

  it('shows empty state when tracks is null', () => {
    render(<TrackBreakdownBar tracks={null} />);
    expect(screen.getByText('אין מסלולים להצגה')).toBeInTheDocument();
  });

  it('renders with correct aria labels', () => {
    render(<TrackBreakdownBar tracks={mockTracks} />);
    const list = screen.getByRole('list', { name: 'פירוט מסלולי המשכנתא' });
    expect(list).toBeInTheDocument();
  });

  it('renders track items as list items', () => {
    render(<TrackBreakdownBar tracks={mockTracks} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  it('falls back to nameEn when name is not provided', () => {
    const tracksWithoutName = [
      { nameEn: 'Fixed Rate', type: 'fixed', percentage: 50, rate: 3.5 },
    ];
    render(<TrackBreakdownBar tracks={tracksWithoutName} />);
    expect(screen.getByText('Fixed Rate')).toBeInTheDocument();
  });

  it('falls back to TRACK_LABELS mapping when name and nameEn are missing', () => {
    const tracksWithType = [
      { type: 'prime', percentage: 40, rate: 2.0 },
    ];
    render(<TrackBreakdownBar tracks={tracksWithType} />);
    expect(screen.getByText('פריים')).toBeInTheDocument();
  });
});
