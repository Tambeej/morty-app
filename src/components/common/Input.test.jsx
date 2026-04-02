/**
 * Input Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from './Input';

describe('Input Component', () => {
  test('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  test('shows error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
  });

  test('shows prefix', () => {
    render(<Input label="Amount" prefix="₪" />);
    expect(screen.getByText('₪')).toBeInTheDocument();
  });

  test('toggles password visibility', () => {
    render(<Input label="Password" type="password" showPasswordToggle />);
    const input = screen.getByLabelText(/password/i);
    expect(input).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByLabelText(/show password/i);
    fireEvent.click(toggleBtn);
    expect(input).toHaveAttribute('type', 'text');
  });

  test('marks input as invalid when error exists', () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'true');
  });
});
