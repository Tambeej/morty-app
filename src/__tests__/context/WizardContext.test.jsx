/**
 * WizardContext.test.jsx
 * Tests for the WizardContext provider and useWizard hook.
 */
import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { WizardProvider, useWizard } from '../../context/WizardContext';

// Test component that exposes context values
function TestConsumer() {
  const {
    currentStep,
    inputs,
    portfolios,
    selectedPortfolioId,
    nextStep,
    prevStep,
    updateInput,
    setPortfolios,
    setSelectedPortfolioId,
    resetWizard,
  } = useWizard();

  return (
    <div>
      <span data-testid="step">{currentStep}</span>
      <span data-testid="consent">{String(inputs.consent)}</span>
      <span data-testid="portfolios">{portfolios ? portfolios.length : 'null'}</span>
      <span data-testid="selected">{selectedPortfolioId || 'none'}</span>
      <button onClick={nextStep} data-testid="next">Next</button>
      <button onClick={prevStep} data-testid="prev">Prev</button>
      <button
        onClick={() => updateInput('consent', true)}
        data-testid="consent-btn"
      >
        Set Consent
      </button>
      <button
        onClick={() => setPortfolios([{ id: 'p1', name: 'Test' }])}
        data-testid="set-portfolios"
      >
        Set Portfolios
      </button>
      <button
        onClick={() => setSelectedPortfolioId('p1')}
        data-testid="select-portfolio"
      >
        Select Portfolio
      </button>
      <button onClick={resetWizard} data-testid="reset">Reset</button>
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
    expect(screen.getByTestId('consent').textContent).toBe('false');
    expect(screen.getByTestId('portfolios').textContent).toBe('null');
    expect(screen.getByTestId('selected').textContent).toBe('none');
  });

  it('advances step on nextStep', () => {
    render(
      <WizardProvider>
        <TestConsumer />
      </WizardProvider>
    );
    act(() => {
      fireEvent.click(screen.getByTestId('next'));
    });
    expect(screen.getByTestId('step').textContent).toBe('1');
  });

  it('does not go below step 0 on prevStep', () => {
    render(
      <WizardProvider>
        <TestConsumer />
      </WizardProvider>
    );
    act(() => {
      fireEvent.click(screen.getByTestId('prev'));
    });
    expect(screen.getByTestId('step').textContent).toBe('0');
  });

  it('does not exceed step 5 on nextStep', () => {
    render(
      <WizardProvider>
        <TestConsumer />
      </WizardProvider>
    );
    // Click next 10 times
    for (let i = 0; i < 10; i++) {
      act(() => {
        fireEvent.click(screen.getByTestId('next'));
      });
    }
    expect(screen.getByTestId('step').textContent).toBe('5');
  });

  it('updates input values', () => {
    render(
      <WizardProvider>
        <TestConsumer />
      </WizardProvider>
    );
    act(() => {
      fireEvent.click(screen.getByTestId('consent-btn'));
    });
    expect(screen.getByTestId('consent').textContent).toBe('true');
  });

  it('sets portfolios', () => {
    render(
      <WizardProvider>
        <TestConsumer />
      </WizardProvider>
    );
    act(() => {
      fireEvent.click(screen.getByTestId('set-portfolios'));
    });
    expect(screen.getByTestId('portfolios').textContent).toBe('1');
  });

  it('sets selected portfolio ID and persists to sessionStorage', () => {
    render(
      <WizardProvider>
        <TestConsumer />
      </WizardProvider>
    );
    // First set portfolios
    act(() => {
      fireEvent.click(screen.getByTestId('set-portfolios'));
    });
    // Then select
    act(() => {
      fireEvent.click(screen.getByTestId('select-portfolio'));
    });
    expect(screen.getByTestId('selected').textContent).toBe('p1');
  });

  it('resets all state on resetWizard', () => {
    render(
      <WizardProvider>
        <TestConsumer />
      </WizardProvider>
    );
    // Advance state
    act(() => {
      fireEvent.click(screen.getByTestId('next'));
      fireEvent.click(screen.getByTestId('consent-btn'));
      fireEvent.click(screen.getByTestId('set-portfolios'));
    });
    // Reset
    act(() => {
      fireEvent.click(screen.getByTestId('reset'));
    });
    expect(screen.getByTestId('step').textContent).toBe('0');
    expect(screen.getByTestId('consent').textContent).toBe('false');
    expect(screen.getByTestId('portfolios').textContent).toBe('null');
    expect(screen.getByTestId('selected').textContent).toBe('none');
  });

  it('throws when useWizard is used outside WizardProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useWizard must be used within a WizardProvider');
    consoleError.mockRestore();
  });
});
