import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WizardProvider, useWizard } from '../../context/WizardContext';

// Test component that uses the wizard context
function TestConsumer() {
  const {
    currentStep,
    inputs,
    nextStep,
    prevStep,
    updateInput,
    resetWizard,
  } = useWizard();

  return (
    <div>
      <div data-testid="step">{currentStep}</div>
      <div data-testid="propertyPrice">{inputs.propertyPrice}</div>
      <div data-testid="consent">{String(inputs.consent)}</div>
      <button onClick={nextStep}>Next</button>
      <button onClick={prevStep}>Prev</button>
      <button onClick={() => updateInput('propertyPrice', 1500000)}>Set Price</button>
      <button onClick={() => updateInput('consent', true)}>Set Consent</button>
      <button onClick={resetWizard}>Reset</button>
    </div>
  );
}

describe('WizardContext', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('provides default values', () => {
    render(
      <WizardProvider>
        <TestConsumer />
      </WizardProvider>
    );
    expect(screen.getByTestId('step').textContent).toBe('0');
    expect(screen.getByTestId('propertyPrice').textContent).toBe('');
    expect(screen.getByTestId('consent').textContent).toBe('false');
  });

  it('advances step on nextStep', async () => {
    const user = userEvent.setup();
    render(
      <WizardProvider>
        <TestConsumer />
      </WizardProvider>
    );
    await user.click(screen.getByText('Next'));
    expect(screen.getByTestId('step').textContent).toBe('1');
  });

  it('does not go below step 0 on prevStep', async () => {
    const user = userEvent.setup();
    render(
      <WizardProvider>
        <TestConsumer />
      </WizardProvider>
    );
    await user.click(screen.getByText('Prev'));
    expect(screen.getByTestId('step').textContent).toBe('0');
  });

  it('updates input values', async () => {
    const user = userEvent.setup();
    render(
      <WizardProvider>
        <TestConsumer />
      </WizardProvider>
    );
    await user.click(screen.getByText('Set Price'));
    expect(screen.getByTestId('propertyPrice').textContent).toBe('1500000');
  });

  it('updates consent', async () => {
    const user = userEvent.setup();
    render(
      <WizardProvider>
        <TestConsumer />
      </WizardProvider>
    );
    await user.click(screen.getByText('Set Consent'));
    expect(screen.getByTestId('consent').textContent).toBe('true');
  });

  it('resets wizard state', async () => {
    const user = userEvent.setup();
    render(
      <WizardProvider>
        <TestConsumer />
      </WizardProvider>
    );
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Set Price'));
    await user.click(screen.getByText('Reset'));
    expect(screen.getByTestId('step').textContent).toBe('0');
    expect(screen.getByTestId('propertyPrice').textContent).toBe('');
  });

  it('throws when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow();
    consoleSpy.mockRestore();
  });
});
