import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WizardProvider } from '../../context/WizardContext';
import StepStability from '../../components/wizard/StepStability';

function renderWithProvider(ui) {
  return render(<WizardProvider>{ui}</WizardProvider>);
}

describe('StepStability', () => {
  it('renders stability slider', () => {
    renderWithProvider(
      <StepStability onNext={jest.fn()} onPrev={jest.fn()} onSubmit={jest.fn()} isSubmitting={false} />
    );
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('shows stability-first note when value >= 7', () => {
    renderWithProvider(
      <StepStability onNext={jest.fn()} onPrev={jest.fn()} onSubmit={jest.fn()} isSubmitting={false} />
    );
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '8' } });
    expect(screen.getByText(/ציון 7\+/i)).toBeInTheDocument();
  });

  it('does not show stability-first note when value < 7', () => {
    renderWithProvider(
      <StepStability onNext={jest.fn()} onPrev={jest.fn()} onSubmit={jest.fn()} isSubmitting={false} />
    );
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '4' } });
    expect(screen.queryByText(/ציון 7\+/i)).not.toBeInTheDocument();
  });

  it('calls onSubmit when submit button clicked', async () => {
    const onSubmit = jest.fn();
    renderWithProvider(
      <StepStability onNext={jest.fn()} onPrev={jest.fn()} onSubmit={onSubmit} isSubmitting={false} />
    );
    screen.getByRole('button', { name: /קבל את התיקים/i }).click();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables submit button when isSubmitting is true', () => {
    renderWithProvider(
      <StepStability onNext={jest.fn()} onPrev={jest.fn()} onSubmit={jest.fn()} isSubmitting={true} />
    );
    expect(screen.getByRole('button', { name: /קבל את התיקים/i })).toBeDisabled();
  });
});
