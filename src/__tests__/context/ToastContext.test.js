/**
 * Tests for ToastContext provider and useToast hook.
 */
import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '../../context/ToastContext';

const TestComponent = () => {
  const { toasts, showSuccess, showError, showInfo, removeToast } = useToast();
  return (
    <div>
      <div data-testid="toast-count">{toasts.length}</div>
      {toasts.map((t) => (
        <div key={t.id} data-testid={`toast-${t.type}`}>
          {t.message}
        </div>
      ))}
      <button onClick={() => showSuccess('Success message')}>Show Success</button>
      <button onClick={() => showError('Error message')}>Show Error</button>
      <button onClick={() => showInfo('Info message', 0)}>Show Info (no dismiss)</button>
      {toasts.length > 0 && (
        <button onClick={() => removeToast(toasts[0].id)}>Remove First</button>
      )}
    </div>
  );
};

const renderWithToast = () =>
  render(
    <ToastProvider>
      <TestComponent />
    </ToastProvider>
  );

describe('ToastContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should start with no toasts', () => {
    renderWithToast();
    expect(screen.getByTestId('toast-count').textContent).toBe('0');
  });

  it('should show a success toast', async () => {
    renderWithToast();
    await act(async () => { userEvent.click(screen.getByText('Show Success')); });
    expect(screen.getByTestId('toast-success').textContent).toBe('Success message');
    expect(screen.getByTestId('toast-count').textContent).toBe('1');
  });

  it('should show an error toast', async () => {
    renderWithToast();
    await act(async () => { userEvent.click(screen.getByText('Show Error')); });
    expect(screen.getByTestId('toast-error').textContent).toBe('Error message');
  });

  it('should auto-dismiss toasts after duration', async () => {
    renderWithToast();
    await act(async () => { userEvent.click(screen.getByText('Show Success')); });
    expect(screen.getByTestId('toast-count').textContent).toBe('1');

    act(() => { jest.advanceTimersByTime(4001); });
    await waitFor(() => {
      expect(screen.getByTestId('toast-count').textContent).toBe('0');
    });
  });

  it('should not auto-dismiss when duration is 0', async () => {
    renderWithToast();
    await act(async () => { userEvent.click(screen.getByText('Show Info (no dismiss)')); });
    expect(screen.getByTestId('toast-count').textContent).toBe('1');

    act(() => { jest.advanceTimersByTime(10000); });
    expect(screen.getByTestId('toast-count').textContent).toBe('1');
  });

  it('should manually remove a toast', async () => {
    renderWithToast();
    await act(async () => { userEvent.click(screen.getByText('Show Info (no dismiss)')); });
    expect(screen.getByTestId('toast-count').textContent).toBe('1');

    await act(async () => { userEvent.click(screen.getByText('Remove First')); });
    expect(screen.getByTestId('toast-count').textContent).toBe('0');
  });

  it('should throw when useToast is used outside ToastProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      'useToast must be used within a ToastProvider'
    );
    consoleError.mockRestore();
  });
});
