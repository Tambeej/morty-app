/**
 * RecommendationCard.test.jsx
 * Tests for the RecommendationCard component.
 * Uses Vitest (vi) — aligned with the project's test setup.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RecommendationCard from '../components/analysis/RecommendationCard';

describe('RecommendationCard', () => {
  it('renders the recommendation text', () => {
    render(
      <RecommendationCard
        index={1}
        text="Negotiate rate to 3.4% — saves ₪32,000"
      />
    );
    expect(
      screen.getByText('Negotiate rate to 3.4% — saves ₪32,000')
    ).toBeInTheDocument();
  });

  it('renders the index badge', () => {
    render(<RecommendationCard index={3} text="Some recommendation" />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders savings when provided', () => {
    render(
      <RecommendationCard
        index={1}
        text="Negotiate rate"
        savings="₪32,000"
      />
    );
    expect(screen.getByText('Potential saving: ₪32,000')).toBeInTheDocument();
  });

  it('does not render savings when not provided', () => {
    render(<RecommendationCard index={1} text="Negotiate rate" />);
    expect(screen.queryByText(/Potential saving/i)).not.toBeInTheDocument();
  });

  it('renders correct icon for rate type', () => {
    const { container } = render(
      <RecommendationCard index={1} text="Rate recommendation" type="rate" />
    );
    expect(container.textContent).toContain('📉');
  });

  it('renders default icon for general type', () => {
    const { container } = render(
      <RecommendationCard index={1} text="General recommendation" />
    );
    expect(container.textContent).toContain('💡');
  });

  it('renders correct icon for term type', () => {
    const { container } = render(
      <RecommendationCard index={1} text="Term recommendation" type="term" />
    );
    expect(container.textContent).toContain('📅');
  });
});
