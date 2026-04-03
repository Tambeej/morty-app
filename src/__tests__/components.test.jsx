/**
 * Tests for common UI components.
 * Uses Vitest (vi) — aligned with the project's test setup.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ProgressBar from '../components/common/ProgressBar';
import Skeleton from '../components/common/Skeleton';
import Spinner from '../components/common/Spinner';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Test content</Card>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies interactive class when interactive prop is true', () => {
    const { container } = render(<Card interactive>Content</Card>);
    expect(container.firstChild).toHaveClass('hover:-translate-y-0.5');
  });

  it('applies gold top border when goldTop is true', () => {
    const { container } = render(<Card goldTop>Content</Card>);
    // goldTop adds border-t-[3px] border-t-gold classes
    expect(container.firstChild.className).toContain('border-t-gold');
  });

  it('renders without optional props', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick handler', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders ghost variant with border class', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>);
    expect(container.firstChild.className).toContain('border');
  });

  it('renders danger variant with red background', () => {
    const { container } = render(<Button variant="danger">Delete</Button>);
    // danger variant uses bg-red-500
    expect(container.firstChild.className).toContain('bg-red-500');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('renders prefix', () => {
    render(<Input label="Amount" prefix="₪" />);
    expect(screen.getByText('₪')).toBeInTheDocument();
  });

  it('renders without label', () => {
    const { container } = render(<Input placeholder="Enter value" />);
    expect(container.querySelector('input')).toBeInTheDocument();
  });
});

describe('ProgressBar', () => {
  it('renders with correct aria attributes', () => {
    render(<ProgressBar value={67} label="Profile Completion" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '67');
  });

  it('clamps value to 0-100', () => {
    render(<ProgressBar value={150} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
  });

  it('shows label', () => {
    render(<ProgressBar value={50} label="Progress" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Progress');
  });

  it('clamps negative values to 0', () => {
    render(<ProgressBar value={-10} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
  });
});

describe('Skeleton', () => {
  it('renders with aria-hidden', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('Spinner', () => {
  it('renders with role status', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders different sizes', () => {
    const { container: sm } = render(<Spinner size="sm" />);
    expect(sm.firstChild).toHaveClass('w-4');
    const { container: lg } = render(<Spinner size="lg" />);
    expect(lg.firstChild).toHaveClass('w-10');
  });

  it('renders default medium size', () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).toHaveClass('w-6');
  });
});
