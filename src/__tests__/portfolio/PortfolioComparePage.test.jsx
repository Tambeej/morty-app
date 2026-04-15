/**
 * Tests for PortfolioComparePage.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

// Mock WizardContext
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockPortfolios = [
  {
    id: 'p1',
    type: 'market_standard',
    name: 'Market Standard',
    nameHe: 'שוק סטנדרטי',
    termYears: 30,
    tracks: [
      { type: 'fixed', name: 'קל"צ', percentage: 40, rate: 3.8, rateDisplay: '3.80%' },
      { type: 'prime', name: 'פריים', percentage: 30, rate: 1.5, rateDisplay: 'P-0.5%' },
      { type: 'cpi', name: 'צמוד מדד', percentage: 30, rate: 2.1, rateDisplay: '2.10%' },
    ],
    monthlyRepayment: 7500,
    totalCost: 2700000,
    totalInterest: 1200000,
    interestSavings: 0,
    fitnessScore: 80,
    recommended: true,
  },
  {
    id: 'p2',
    type: 'fast_track',
    name: 'Fast Track',
    nameHe: 'מסלול מהיר',
    termYears: 20,
    tracks: [
      { type: 'fixed', name: 'קל"צ', percentage: 50, rate: 3.8, rateDisplay: '3.80%' },
      { type: 'prime', name: 'פריים', percentage: 50, rate: 1.5, rateDisplay: 'P-0.5%' },
    ],
    monthlyRepayment: 9200,
    totalCost: 2200000,
    totalInterest: 700000,
    interestSavings: 500000,
    fitnessScore: 75,
    recommended: false,
  },
];

let mockWizardState = {
  portfolios: mockPortfolios,
  communityTips: [],
  selectedPortfolioId: null,
  setSelectedPortfolioId: jest.fn(),
  inputs: {},
};

jest.mock('../../context/WizardContext', () => ({
  WizardProvider: ({ children }) => <div>{children}</div>,
  useWizard: () => mockWizardState,
}));

jest.mock('../../utils/formatters', () => ({
  formatCurrency: (amount) => `₪${amount?.toLocaleString() || '0'}`,
}));

import PortfolioComparePage from '../../pages/PortfolioComparePage';

describe('PortfolioComparePage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockWizardState.setSelectedPortfolioId.mockClear();
    mockWizardState.portfolios = mockPortfolios;
    mockWizardState.selectedPortfolioId = null;
  });

  it('renders the page header', () => {
    render(
      <MemoryRouter>
        <PortfolioComparePage />
      </MemoryRouter>
    );
    expect(screen.getByText(/תיקי משכנתא מותאמים אישית/)).toBeInTheDocument();
  });

  it('renders portfolio cards', () => {
    render(
      <MemoryRouter>
        <PortfolioComparePage />
      </MemoryRouter>
    );
    expect(screen.getByText('שוק סטנדרטי')).toBeInTheDocument();
    expect(screen.getByText('מסלול מהיר')).toBeInTheDocument();
  });

  it('renders the Morty logo', () => {
    render(
      <MemoryRouter>
        <PortfolioComparePage />
      </MemoryRouter>
    );
    expect(screen.getByText('Morty')).toBeInTheDocument();
  });

  it('renders the legal disclaimer footer', () => {
    render(
      <MemoryRouter>
        <PortfolioComparePage />
      </MemoryRouter>
    );
    expect(screen.getByText(/Morty הינו כלי תמיכה/)).toBeInTheDocument();
  });

  it('redirects to wizard when no portfolios', () => {
    mockWizardState.portfolios = [];
    render(
      <MemoryRouter>
        <PortfolioComparePage />
      </MemoryRouter>
    );
    // Should show skeleton/loading state
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders navigation back button', () => {
    render(
      <MemoryRouter>
        <PortfolioComparePage />
      </MemoryRouter>
    );
    expect(screen.getByText('← חזור לאשף')).toBeInTheDocument();
  });

  it('renders login button in navbar', () => {
    render(
      <MemoryRouter>
        <PortfolioComparePage />
      </MemoryRouter>
    );
    expect(screen.getByText('כניסה')).toBeInTheDocument();
  });

  it('renders Bank of Israel attribution', () => {
    render(
      <MemoryRouter>
        <PortfolioComparePage />
      </MemoryRouter>
    );
    expect(screen.getByText(/נתוני בנק ישראל/)).toBeInTheDocument();
  });
});
