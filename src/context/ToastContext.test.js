/**
 * ToastContext.test.js - Tests for the unified Toast system.
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from './ToastContext.jsx';

function ToastTrigger({ message, type }) {
  const { addToast } = useToast();
  return (
    <button onClick={() => addToast(message, type)} data-testid="trigger">
      Show Toast
    </button>
  );
}

describe('ToastContext', () => {
  it('renders toast when addToast is called', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastTrigger message="Test notification" type="success" />
      </ToastProvider>
    );

    await user.click(screen.getByTestId('trigger'));
    expect(screen.getByText('Test notification')).toBeInTheDocument();
  });

  it('renders error toast with correct styling', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastTrigger message="Error occurred" type="error" />
      </ToastProvider>
    );

    await user.click(screen.getByTestId('trigger'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });

  it('removes toast when close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastTrigger message="Dismissible" type="info" />
      </ToastProvider>
    );

    await user.click(screen.getByTestId('trigger'));
    expect(screen.getByText('Dismissible')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close notification');
    await user.click(closeBtn);
    expect(screen.queryByText('Dismissible')).not.toBeInTheDocument();
  });

  it('throws when used outside ToastProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    function BadComponent() {
      useToast();
      return null;
    }
    expect(() => render(<BadComponent />)).toThrow(
      'useToast must be used within a ToastProvider'
    );
    consoleError.mockRestore();
  });
});
