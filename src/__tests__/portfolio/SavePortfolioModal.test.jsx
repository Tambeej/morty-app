/**
 * SavePortfolioModal.test.jsx
 * Tests for the SavePortfolioModal component.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SavePortfolioModal from '../../components/portfolio/SavePortfolioModal';
import * as portfolioService from '../../services/portfolioService';
import * as storage from '../../utils/storage';

// Mock dependencies
jest.mock('../../services/portfolioService');
jest.mock('../../utils/storage');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const mockPortfolio = {
  id: 'portfolio-1',
  name: 'Market Standard',
  nameHe: 'שוק סטנדרטי',
  termYears: 30,
  monthlyRepayment: 5500,
  totalInterest: 480000,
  totalCost: 1480000,
};

const renderModal = (props = {}) => {
  const defaultProps = {
    portfolio: mockPortfolio,
    isOpen: true,
    onClose: jest.fn(),
    ...props,
  };
  return render(
    <MemoryRouter>
      <SavePortfolioModal {...defaultProps} />
    </MemoryRouter>
  );
};

describe('SavePortfolioModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    portfolioService.storeSelectedPortfolio.mockImplementation(() => {});
    portfolioService.savePortfolio.mockResolvedValue({ saved: true });
  });

  describe('Rendering', () => {
    it('renders nothing when isOpen is false', () => {
      renderModal({ isOpen: false });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders nothing when portfolio is null', () => {
      renderModal({ portfolio: null });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders the modal when isOpen is true', () => {
      renderModal();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('displays the portfolio name', () => {
      renderModal();
      expect(screen.getByText('שוק סטנדרטי')).toBeInTheDocument();
    });

    it('displays the modal title', () => {
      renderModal();
      expect(screen.getByText('שמור תיק ועבור לניתוח')).toBeInTheDocument();
    });

    it('shows trust indicators', () => {
      renderModal();
      expect(screen.getByText(/SSL מאובטח/)).toBeInTheDocument();
      expect(screen.getByText(/ללא כרטיס אשראי/)).toBeInTheDocument();
    });
  });

  describe('Unauthenticated flow', () => {
    beforeEach(() => {
      storage.isAuthenticated.mockReturnValue(false);
    });

    it('shows signup CTA for unauthenticated users', () => {
      renderModal();
      expect(screen.getByText('צור חשבון והמשך')).toBeInTheDocument();
    });

    it('shows login button for unauthenticated users', () => {
      renderModal();
      expect(screen.getByText('יש לי כבר חשבון — כניסה')).toBeInTheDocument();
    });

    it('shows unauthenticated description text', () => {
      renderModal();
      expect(screen.getByText(/צור חשבון חינמי/)).toBeInTheDocument();
    });
  });

  describe('Authenticated flow', () => {
    beforeEach(() => {
      storage.isAuthenticated.mockReturnValue(true);
    });

    it('shows save CTA for authenticated users', () => {
      renderModal();
      expect(screen.getByText('שמור ועבור לניתוח מקצועי')).toBeInTheDocument();
    });

    it('does not show login button for authenticated users', () => {
      renderModal();
      expect(screen.queryByText('יש לי כבר חשבון — כניסה')).not.toBeInTheDocument();
    });

    it('shows authenticated description text', () => {
      renderModal();
      expect(screen.getByText(/שמור את התיק הנבחר לחשבונך/)).toBeInTheDocument();
    });
  });

  describe('Close behavior', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = jest.fn();
      storage.isAuthenticated.mockReturnValue(false);
      renderModal({ onClose });
      fireEvent.click(screen.getByLabelText('סגור'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', () => {
      const onClose = jest.fn();
      storage.isAuthenticated.mockReturnValue(false);
      renderModal({ onClose });
      // Click the backdrop (first div with onClick)
      const backdrop = document.querySelector('[aria-hidden="true"]');
      if (backdrop) fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when ESC key is pressed', () => {
      const onClose = jest.fn();
      storage.isAuthenticated.mockReturnValue(false);
      renderModal({ onClose });
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when cancel button is clicked', () => {
      const onClose = jest.fn();
      storage.isAuthenticated.mockReturnValue(false);
      renderModal({ onClose });
      fireEvent.click(screen.getByLabelText('ביטול'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('What you get section', () => {
    it('displays all feature items', () => {
      storage.isAuthenticated.mockReturnValue(false);
      renderModal();
      expect(screen.getByText(/השוואת ההצעה הבנקאית/)).toBeInTheDocument();
      expect(screen.getByText(/טריקי משכנתא/)).toBeInTheDocument();
      expect(screen.getByText(/סקריפט מו"מ/)).toBeInTheDocument();
      expect(screen.getByText(/תובנות AI/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      storage.isAuthenticated.mockReturnValue(false);
      renderModal();
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'save-modal-title');
    });

    it('has a labeled close button', () => {
      storage.isAuthenticated.mockReturnValue(false);
      renderModal();
      expect(screen.getByLabelText('סגור')).toBeInTheDocument();
    });
  });
});
