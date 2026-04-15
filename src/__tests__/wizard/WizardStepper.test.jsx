import React from 'react';
import { render, screen } from '@testing-library/react';
import WizardStepper from '../../components/wizard/WizardStepper';

describe('WizardStepper', () => {
  it('renders 6 step indicators', () => {
    render(<WizardStepper currentStep={0} />);
    // 6 step labels should be visible
    expect(screen.getByText('מחיר נכס')).toBeInTheDocument();
    expect(screen.getByText('סכום הלוואה')).toBeInTheDocument();
    expect(screen.getByText('הכנסה')).toBeInTheDocument();
    expect(screen.getByText('החזר יעד')).toBeInTheDocument();
    expect(screen.getByText('כספים עתידיים')).toBeInTheDocument();
    expect(screen.getByText('יציבות')).toBeInTheDocument();
  });

  it('has correct aria attributes', () => {
    render(<WizardStepper currentStep={2} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '3');
    expect(progressbar).toHaveAttribute('aria-valuemin', '1');
    expect(progressbar).toHaveAttribute('aria-valuemax', '6');
  });
});
