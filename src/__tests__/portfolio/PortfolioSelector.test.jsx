/**
 * PortfolioSelector.test.jsx
 * Tests for the PortfolioSelector floating bottom bar component.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PortfolioSelector from '../../components/portfolio/PortfolioSelector';

const mockPortfolio = {
  id: 'portfolio-1',
  name: 'Market Standard',
  nameHe: 'שוק סטנדרטי',
  monthlyRepayment: 5500,
};

describe('PortfolioSelector', () => {
  describe('Rendering', () => {
    it('renders nothing when selectedPortfolio is null', () => {
      const { container } = render(
        <PortfolioSelector
          selectedPortfolio={null}
          onProceed={jest.fn()}
          onClearSelection={jest.fn()}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders the floating bar when a portfolio is selected', () => {
      render(
        <PortfolioSelector
          selectedPortfolio={mockPortfolio}
          onProceed={jest.fn()}
          onClearSelection={jest.fn()}
        />
      );
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('displays the selected portfolio name', () => {
      render(
        <PortfolioSelector
          selectedPortfolio={mockPortfolio}
          onProceed={jest.fn()}
          onClearSelection={jest.fn()}
        />
      );
      expect(screen.getByText('שוק סטנדרטי')).toBeInTheDocument();
    });

    it('displays the monthly repayment', () => {
      render(
        <PortfolioSelector
          selectedPortfolio={mockPortfolio}
          onProceed={jest.fn()}
          onClearSelection={jest.fn()}
        />
      );
      expect(screen.getByText(/החזר חודשי/)).toBeInTheDocument();
    });

    it('shows the proceed button', () => {
      render(
        <PortfolioSelector
          selectedPortfolio={mockPortfolio}
          onProceed={jest.fn()}
          onClearSelection={jest.fn()}
        />
      );
      expect(screen.getByLabelText('המשך לניתוח מקצועי')).toBeInTheDocument();
    });

    it('shows the clear selection button', () => {
      render(
        <PortfolioSelector
          selectedPortfolio={mockPortfolio}
          onProceed={jest.fn()}
          onClearSelection={jest.fn()}
        />
      );
      expect(screen.getByLabelText('בטל בחירה')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onProceed when proceed button is clicked', () => {
      const onProceed = jest.fn();
      render(
        <PortfolioSelector
          selectedPortfolio={mockPortfolio}
          onProceed={onProceed}
          onClearSelection={jest.fn()}
        />
      );
      fireEvent.click(screen.getByLabelText('המשך לניתוח מקצועי'));
      expect(onProceed).toHaveBeenCalledTimes(1);
    });

    it('calls onClearSelection when deselect button is clicked', () => {
      const onClearSelection = jest.fn();
      render(
        <PortfolioSelector
          selectedPortfolio={mockPortfolio}
          onProceed={jest.fn()}
          onClearSelection={onClearSelection}
        />
      );
      fireEvent.click(screen.getByLabelText('בטל בחירה'));
      expect(onClearSelection).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA region label', () => {
      render(
        <PortfolioSelector
          selectedPortfolio={mockPortfolio}
          onProceed={jest.fn()}
          onClearSelection={jest.fn()}
        />
      );
      expect(screen.getByRole('region', { name: 'תיק נבחר - המשך לניתוח' })).toBeInTheDocument();
    });

    it('has aria-live polite for dynamic content', () => {
      render(
        <PortfolioSelector
          selectedPortfolio={mockPortfolio}
          onProceed={jest.fn()}
          onClearSelection={jest.fn()}
        />
      );
      expect(screen.getByRole('region')).toHaveAttribute('aria-live', 'polite');
    });
  });
});
