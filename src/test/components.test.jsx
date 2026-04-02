import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';
import ProgressBar from '../components/common/ProgressBar';

describe('Button component', () => {
  it('renders with primary variant by default', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-gold');
  });

  it('renders ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button', { name: 'Ghost' })).toHaveClass('border-border');
  });

  it('renders danger variant', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('bg-error');
  });

  it('shows loading state', () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders full width', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });
});

describe('Input component', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows hint text when no error', () => {
    render(<Input label="Phone" hint="Israeli format" />);
    expect(screen.getByText('Israeli format')).toBeInTheDocument();
  });

  it('renders with prefix', () => {
    render(<Input label="Amount" prefix="\u20AA" />);
    expect(screen.getByText('\u20AA')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Input label="Test" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

describe('Card component', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies interactive styles', () => {
    const { container } = render(<Card interactive>Interactive</Card>);
    expect(container.firstChild).toHaveClass('cursor-pointer');
  });

  it('applies gold top border', () => {
    const { container } = render(<Card goldTop>Gold Top</Card>);
    expect(container.firstChild).toHaveClass('border-t-gold');
  });
});

describe('Spinner component', () => {
  it('renders with correct role', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders different sizes', () => {
    const { rerender, container } = render(<Spinner size="sm" />);
    expect(container.firstChild).toHaveClass('w-4');
    rerender(<Spinner size="lg" />);
    expect(container.firstChild).toHaveClass('w-10');
  });
});

describe('ProgressBar component', () => {
  it('renders with correct aria attributes', () => {
    render(<ProgressBar value={60} label="Progress" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '60');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps value between 0 and 100', () => {
    render(<ProgressBar value={150} label="Over" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('shows label when showLabel is true', () => {
    render(<ProgressBar value={75} label="Upload" showLabel />);
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
});
