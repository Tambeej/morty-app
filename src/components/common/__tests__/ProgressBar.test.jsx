import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressBar from '../ProgressBar';

describe('ProgressBar', () => {
  it('renders with default props', () => {
    render(<ProgressBar value={50} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-valuenow', '50');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('shows percentage text by default', () => {
    render(<ProgressBar value={75} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('hides percentage when showPercent is false', () => {
    render(<ProgressBar value={75} showPercent={false} />);
    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });

  it('shows label when provided', () => {
    render(<ProgressBar value={50} label="Uploading..." />);
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
  });

  it('clamps value to 0-100 range', () => {
    const { rerender } = render(<ProgressBar value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');

    rerender(<ProgressBar value={-10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('uses aria-label from label prop', () => {
    render(<ProgressBar value={50} label="Upload progress" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-label',
      'Upload progress'
    );
  });

  it('uses default aria-label when no label provided', () => {
    render(<ProgressBar value={50} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-label',
      'Progress'
    );
  });
});
