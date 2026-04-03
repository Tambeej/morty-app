/**
 * ProgressBar.test.jsx
 * Tests for the ProgressBar component.
 * Uses Vitest (vi) — aligned with the project's test setup.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProgressBar from '../ProgressBar';

describe('ProgressBar', () => {
  it('renders with correct aria attributes', () => {
    render(<ProgressBar value={67} label="Profile Completion" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '67');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps value to 100 when over', () => {
    render(<ProgressBar value={150} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
  });

  it('clamps value to 0 when negative', () => {
    render(<ProgressBar value={-10} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
  });

  it('shows label via aria-label', () => {
    render(<ProgressBar value={50} label="Progress" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Progress');
  });

  it('renders with default value of 0', () => {
    render(<ProgressBar />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
  });
});
