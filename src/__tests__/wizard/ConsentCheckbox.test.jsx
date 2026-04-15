import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WizardProvider } from '../../context/WizardContext';
import ConsentCheckbox from '../../components/wizard/ConsentCheckbox';

function renderWithProvider(ui) {
  return render(<WizardProvider>{ui}</WizardProvider>);
}

describe('ConsentCheckbox', () => {
  it('renders unchecked by default', () => {
    renderWithProvider(<ConsentCheckbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('can be checked', async () => {
    const user = userEvent.setup();
    renderWithProvider(<ConsentCheckbox />);
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('opens privacy modal when "קרא עוד" is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider(<ConsentCheckbox />);
    await user.click(screen.getByRole('button', { name: /קרא עוד/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes privacy modal when close button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider(<ConsentCheckbox />);
    await user.click(screen.getByRole('button', { name: /קרא עוד/i }));
    await user.click(screen.getByRole('button', { name: /הבנתי/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
