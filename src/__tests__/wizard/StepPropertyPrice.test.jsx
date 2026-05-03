import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WizardProvider } from '../../context/WizardContext';
import StepPropertyPrice from '../../components/wizard/StepPropertyPrice';

function renderWithProvider(ui) {
  return render(<WizardProvider>{ui}</WizardProvider>);
}

describe('StepPropertyPrice', () => {
  it('renders the property price input', () => {
    renderWithProvider(<StepPropertyPrice onNext={jest.fn()} />);
    expect(screen.getByLabelText(/מחיר הנכס/i)).toBeInTheDocument();
  });

  it('shows error when submitting empty value', async () => {
    const user = userEvent.setup();
    const onNext = jest.fn();
    renderWithProvider(<StepPropertyPrice onNext={onNext} />);
    await user.click(screen.getByRole('button', { name: /המשך/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(onNext).not.toHaveBeenCalled();
  });

  it('formats currency input with commas', async () => {
    const user = userEvent.setup();
    renderWithProvider(<StepPropertyPrice onNext={jest.fn()} />);
    const input = screen.getByLabelText(/מחיר הנכס/i);
    await user.type(input, '1500000');
    expect(input.value).toMatch(/1,500,000/);
  });

  it('calls onNext when valid price is entered', async () => {
    const user = userEvent.setup();
    const onNext = jest.fn();
    renderWithProvider(<StepPropertyPrice onNext={onNext} />);
    const input = screen.getByLabelText(/מחיר הנכס/i);
    await user.type(input, '1500000');
    await user.click(screen.getByRole('button', { name: /המשך/i }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('shows error for price below minimum', async () => {
    const user = userEvent.setup();
    const onNext = jest.fn();
    renderWithProvider(<StepPropertyPrice onNext={onNext} />);
    const input = screen.getByLabelText(/מחיר הנכס/i);
    await user.type(input, '50000');
    await user.click(screen.getByRole('button', { name: /המשך/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(onNext).not.toHaveBeenCalled();
  });
});
