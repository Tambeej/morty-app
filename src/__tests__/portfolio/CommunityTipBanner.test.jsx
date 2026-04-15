/**
 * Tests for CommunityTipBanner component.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommunityTipBanner from '../../components/portfolio/CommunityTipBanner';

const mockTips = [
  {
    bank: 'בנק לאומי',
    branch: 'הרצליה',
    rateDiff: 0.3,
    timestamp: '2026-04-01T10:00:00Z',
  },
];

const mockMultipleTips = [
  {
    bank: 'בנק לאומי',
    branch: 'הרצליה',
    rateDiff: 0.3,
  },
  {
    bank: 'בנק הפועלים',
    branch: 'תל אביב',
    rateDiff: 0.2,
  },
  {
    bank: 'מזרחי טפחות',
    branch: 'ירושלים',
    rateDiff: 0.15,
  },
];

describe('CommunityTipBanner', () => {
  it('renders bank and branch name', () => {
    render(<CommunityTipBanner tips={mockTips} />);
    expect(screen.getByText(/בנק לאומי - הרצליה/)).toBeInTheDocument();
  });

  it('renders the tip heading', () => {
    render(<CommunityTipBanner tips={mockTips} />);
    expect(screen.getByText('תובנה מהקהילה')).toBeInTheDocument();
  });

  it('renders nothing when tips array is empty', () => {
    const { container } = render(<CommunityTipBanner tips={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when tips is null', () => {
    const { container } = render(<CommunityTipBanner tips={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('dismisses banner when close button is clicked', () => {
    render(<CommunityTipBanner tips={mockTips} />);
    const closeBtn = screen.getByRole('button', { name: 'סגור טיפ' });
    fireEvent.click(closeBtn);
    expect(screen.queryByText('תובנה מהקהילה')).not.toBeInTheDocument();
  });

  it('shows additional tips count when multiple tips provided', () => {
    render(<CommunityTipBanner tips={mockMultipleTips} />);
    expect(screen.getByText(/עוד 2 תובנות/)).toBeInTheDocument();
  });

  it('shows additional tip bank names', () => {
    render(<CommunityTipBanner tips={mockMultipleTips} />);
    expect(screen.getByText(/בנק הפועלים - תל אביב/)).toBeInTheDocument();
    expect(screen.getByText(/מזרחי טפחות - ירושלים/)).toBeInTheDocument();
  });

  it('renders message text when bank/branch not provided', () => {
    const tipsWithMessage = [{ message: 'הצעה טובה נמצאה' }];
    render(<CommunityTipBanner tips={tipsWithMessage} />);
    expect(screen.getByText('הצעה טובה נמצאה')).toBeInTheDocument();
  });

  it('has correct aria role', () => {
    render(<CommunityTipBanner tips={mockTips} />);
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });
});
