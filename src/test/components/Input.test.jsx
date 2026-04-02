import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Input from '../../components/common/Input.jsx';

describe('Input component', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('renders prefix', () => {
    render(<Input label="Amount" prefix="₪" />);
    expect(screen.getByText('₪')).toBeInTheDocument();
  });

  it('has aria-invalid when error is present', () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });
});
