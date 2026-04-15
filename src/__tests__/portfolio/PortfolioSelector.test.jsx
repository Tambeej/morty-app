/**
 * Tests for PortfolioSelector component.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PortfolioSelector from '../../components/portfolio/PortfolioSelector';

// Mock formatters
jest.mock('../../utils/formatters', () => ({
  formatCurrency: (amount) => `₪${amount?.toLocaleString() || '0'}`,
}));

const mockPortfolio = {
  id: 'portfolio-1',
  name: 'Market Standard',
  nameHe: 'שוק סטנדרטי',
  monthlyRepayment: 7500,
};

describe('PortfolioSelector', () => {
  const mockOnProceed = jest.fn();

  beforeEach(() => {
    mockOnProceed.mockClear();
  });

  it('renders nothing when no portfolio is selected', () => {
    const { container } = render(
      <PortfolioSelector selectedPortfolio={null} onProceed={mockOnProceed} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders selected portfolio name', () => {
    render(
      <PortfolioSelector selectedPortfolio={mockPortfolio} onProceed={mockOnProceed} />
    );
    expect(screen.getByText('שוק סטנדרטי')).toBeInTheDocument();
  });

  it('renders "תיק נבחר" label', () => {
    render(
      <PortfolioSelector selectedPortfolio={mockPortfolio} onProceed={mockOnProceed} />
    );
    expect(screen.getByText('תיק נבחר')).toBeInTheDocument();
  });

  it('renders proceed button', () => {
    render(
      <PortfolioSelector selectedPortfolio={mockPortfolio} onProceed={mockOnProceed} />
    );
    expect(screen.getByText('המשך לניתוח מקצועי')).toBeInTheDocument();
  });

  it('calls onProceed when proceed button is clicked', () => {
    render(
      <PortfolioSelector selectedPortfolio={mockPortfolio} onProceed={mockOnProceed} />
    );
    const btn = screen.getByText('המשך לניתוח מקצועי');
    fireEvent.click(btn);
    expect(mockOnProceed).toHaveBeenCalledTimes(1);
  });

  it('renders monthly repayment when provided', () => {
    render(
      <PortfolioSelector selectedPortfolio={mockPortfolio} onProceed={mockOnProceed} />
    );
    expect(screen.getByText('החזר חודשי:')).toBeInTheDocument();
  });

  it('has correct aria region label', () => {
    render(
      <PortfolioSelector selectedPortfolio={mockPortfolio} onProceed={mockOnProceed} />
    );
    expect(screen.getByRole('region', { name: 'תיק נבחר - המשך לניתוח' })).toBeInTheDocument();
  });

  it('renders secondary CTA text', () => {
    render(
      <PortfolioSelector selectedPortfolio={mockPortfolio} onProceed={mockOnProceed} />
    );
    expect(screen.getByText('שמור ובצע השוואה עם ההצעה הבנקאית')).toBeInTheDocument();
  });
});
