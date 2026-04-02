/**
 * ProgressBar Component Tests
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  it('renders with correct value', () => {
    render(<ProgressBar value={50} label="Progress" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
  });

  it('clamps value to 0-100 range', () => {
    render(<ProgressBar value={150} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');
  });

  it('clamps negative values to 0', () => {
    render(<ProgressBar value={-10} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
  });

  it('displays label when provided', () => {
    render(<ProgressBar value={75} label="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
