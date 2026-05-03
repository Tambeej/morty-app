/**
 * Tests for PortfolioCard component.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PortfolioCard from '../../components/portfolio/PortfolioCard';

// Mock formatters
jest.mock('../../utils/formatters', () => ({
  formatCurrency: (amount) => `₪${amount?.toLocaleString() || '0'}`,
}));

const mockPortfolio = {
  id: 'portfolio-1',
  type: 'market_standard',
  name: 'Market Standard',
  nameHe: 'שוק סטנדרטי',
  description: 'החזר נמוך',
  termYears: 30,
  tracks: [
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
  ],
  monthlyRepayment: 7500,
  totalCost: 2700000,
  totalInterest: 1200000,
  interestSavings: 0,
  fitnessScore: 82,
  recommended: true,
};

describe('PortfolioCard', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('renders portfolio name in Hebrew', () => {
    render(
      <PortfolioCard
        portfolio={mockPortfolio}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );
    expect(screen.getByText('שוק סטנדרטי')).toBeInTheDocument();
  });

  it('renders term years', () => {
    render(
      <PortfolioCard
        portfolio={mockPortfolio}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );
    expect(screen.getByText(/30 שנה/)).toBeInTheDocument();
  });

  it('shows recommended badge when portfolio.recommended is true', () => {
    render(
      <PortfolioCard
        portfolio={mockPortfolio}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );
    expect(screen.getByText('מומלץ ✓')).toBeInTheDocument();
  });

  it('does not show recommended badge when portfolio.recommended is false', () => {
    render(
      <PortfolioCard
        portfolio={{ ...mockPortfolio, recommended: false }}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );
    expect(screen.queryByText('מומלץ ✓')).not.toBeInTheDocument();
  });

  it('shows "נבחר ✓" button text when selected', () => {
    render(
      <PortfolioCard
        portfolio={mockPortfolio}
        isSelected={true}
        onSelect={mockOnSelect}
      />
    );
    expect(screen.getByText('נבחר ✓')).toBeInTheDocument();
  });

  it('shows "בחר תיק זה" button text when not selected', () => {
    render(
      <PortfolioCard
        portfolio={mockPortfolio}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );
    expect(screen.getByText('בחר תיק זה')).toBeInTheDocument();
  });

  it('calls onSelect when card is clicked', () => {
    render(
      <PortfolioCard
        portfolio={mockPortfolio}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );
    const card = screen.getByRole('button', { name: /תיק שוק סטנדרטי/ });
    fireEvent.click(card);
    expect(mockOnSelect).toHaveBeenCalledWith('portfolio-1');
  });

  it('calls onSelect when select button is clicked', () => {
    render(
      <PortfolioCard
        portfolio={mockPortfolio}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );
    const btn = screen.getByText('בחר תיק זה');
    fireEvent.click(btn);
    expect(mockOnSelect).toHaveBeenCalledWith('portfolio-1');
  });

  it('calls onSelect on Enter key press', () => {
    render(
      <PortfolioCard
        portfolio={mockPortfolio}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );
    const card = screen.getByRole('button', { name: /תיק שוק סטנדרטי/ });
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockOnSelect).toHaveBeenCalledWith('portfolio-1');
  });

  it('renders track breakdown section', () => {
    render(
      <PortfolioCard
        portfolio={mockPortfolio}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );
    expect(screen.getByText('פירוט המסלולים')).toBeInTheDocument();
  });

  it('renders financial summary rows', () => {
    render(
      <PortfolioCard
        portfolio={mockPortfolio}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );
    expect(screen.getByText('החזר חודשי')).toBeInTheDocument();
    expect(screen.getByText('עלות כוללת')).toBeInTheDocument();
    expect(screen.getByText('סה"כ ריבית')).toBeInTheDocument();
  });

  it('renders fitness score bar when fitnessScore is provided', () => {
    render(
      <PortfolioCard
        portfolio={mockPortfolio}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );
    expect(screen.getByText('ציון התאמה')).toBeInTheDocument();
  });

  it('does not render fitness score bar when fitnessScore is undefined', () => {
    const portfolioWithoutScore = { ...mockPortfolio, fitnessScore: undefined };
    render(
      <PortfolioCard
        portfolio={portfolioWithoutScore}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );
    expect(screen.queryByText('ציון התאמה')).not.toBeInTheDocument();
  });

  it('renders fast_track portfolio with savings badge', () => {
    const fastTrackPortfolio = {
      ...mockPortfolio,
      id: 'portfolio-2',
      type: 'fast_track',
      nameHe: 'מסלול מהיר',
      interestSavings: 150000,
      recommended: false,
    };
    render(
      <PortfolioCard
        portfolio={fastTrackPortfolio}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );
    expect(screen.getByText(/חסוך/)).toBeInTheDocument();
  });

  it('has correct aria-pressed attribute', () => {
    const { rerender } = render(
      <PortfolioCard
        portfolio={mockPortfolio}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );
    const card = screen.getByRole('button', { name: /תיק שוק סטנדרטי/ });
    expect(card).toHaveAttribute('aria-pressed', 'false');

    rerender(
      <PortfolioCard
        portfolio={mockPortfolio}
        isSelected={true}
        onSelect={mockOnSelect}
      />
    );
    expect(card).toHaveAttribute('aria-pressed', 'true');
  });
});
