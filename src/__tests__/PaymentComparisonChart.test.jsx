/**
 * PaymentComparisonChart.test.jsx
 * Tests for the PaymentComparisonChart component.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import PaymentComparisonChart from '../components/analysis/PaymentComparisonChart';

// Recharts uses ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('PaymentComparisonChart', () => {
  const defaultProps = {
    principal: 1_200_000,
    yourRate: 3.8,
    marketRate: 3.6,
    recommendedRate: 3.4,
    termYears: 25,
  };

  it('renders the chart container', () => {
    render(<PaymentComparisonChart {...defaultProps} />);
    expect(
      screen.getByLabelText('Cumulative payment comparison chart')
    ).toBeInTheDocument();
  });

  it('renders the chart title', () => {
    render(<PaymentComparisonChart {...defaultProps} />);
    expect(
      screen.getByText('Cumulative Payment Comparison')
    ).toBeInTheDocument();
  });

  it('returns null when no data can be built', () => {
    const { container } = render(
      <PaymentComparisonChart
        principal={0}
        yourRate={0}
        marketRate={0}
        recommendedRate={0}
        termYears={0}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
