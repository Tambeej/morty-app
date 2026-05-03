import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WizardProvider, useWizard } from '../../context/WizardContext';
import StepLoanAmount from '../../components/wizard/StepLoanAmount';

// Helper to pre-set property price in context
function WrapperWithPrice({ children, propertyPrice = 2000000 }) {
  return (
    <WizardProvider>
      <PriceSetter price={propertyPrice} />
      {children}
    </WizardProvider>
  );
}

function PriceSetter({ price }) {
  const { updateInput } = useWizard();
  React.useEffect(() => {
    updateInput('propertyPrice', price);
  }, [price, updateInput]);
  return null;
}

describe('StepLoanAmount', () => {
  it('renders loan amount input', () => {
    render(
      <WrapperWithPrice>
        <StepLoanAmount onNext={jest.fn()} onPrev={jest.fn()} />
      </WrapperWithPrice>
    );
    expect(screen.getByLabelText(/סכום ההלוואה/i)).toBeInTheDocument();
  });

  it('shows error when submitting empty value', async () => {
    const user = userEvent.setup();
    const onNext = jest.fn();
    render(
      <WrapperWithPrice>
        <StepLoanAmount onNext={onNext} onPrev={jest.fn()} />
      </WrapperWithPrice>
    );
    await user.click(screen.getByRole('button', { name: /המשך/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(onNext).not.toHaveBeenCalled();
  });

  it('shows LTV warning when loan exceeds 75% of property price', async () => {
    const user = userEvent.setup();
    render(
      <WrapperWithPrice propertyPrice={1000000}>
        <StepLoanAmount onNext={jest.fn()} onPrev={jest.fn()} />
      </WrapperWithPrice>
    );
    const input = screen.getByLabelText(/סכום ההלוואה/i);
    await user.type(input, '800000');
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('calls onPrev when back button clicked', async () => {
    const user = userEvent.setup();
    const onPrev = jest.fn();
    render(
      <WrapperWithPrice>
        <StepLoanAmount onNext={jest.fn()} onPrev={onPrev} />
      </WrapperWithPrice>
    );
    await user.click(screen.getByRole('button', { name: /חזור/i }));
    expect(onPrev).toHaveBeenCalledTimes(1);
  });
});
