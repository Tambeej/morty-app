/**
 * PaywallFeatureList.test.jsx
 * Tests for the PaywallFeatureList component.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaywallFeatureList from '../components/paywall/PaywallFeatureList';

describe('PaywallFeatureList', () => {
  it('renders the heading', () => {
    render(<PaywallFeatureList />);
    expect(screen.getByText('מה תקבל בניתוח המקצועי')).toBeInTheDocument();
  });

  it('renders all 4 features', () => {
    render(<PaywallFeatureList />);
    expect(screen.getByText('השוואת הצעה בנקאית')).toBeInTheDocument();
    expect(screen.getByText('טריקי משכנתא')).toBeInTheDocument();
    expect(screen.getByText(/סקריפט מו"מ בעברית/)).toBeInTheDocument();
    expect(screen.getByText('תובנות AI אסטרטגיות')).toBeInTheDocument();
  });

  it('renders the default price', () => {
    render(<PaywallFeatureList />);
    expect(screen.getByText('₪149')).toBeInTheDocument();
  });

  it('renders a custom price', () => {
    render(<PaywallFeatureList price={199} />);
    expect(screen.getByText('₪199')).toBeInTheDocument();
  });

  it('renders trust badges', () => {
    render(<PaywallFeatureList />);
    expect(screen.getByText('SSL מאובטח')).toBeInTheDocument();
    expect(screen.getByText('Stripe מאובטח')).toBeInTheDocument();
    expect(screen.getByText('ביטול בכל עת')).toBeInTheDocument();
    expect(screen.getByText('אחריות 7 ימים')).toBeInTheDocument();
  });

  it('renders portfolio summary when portfolio is provided', () => {
    const portfolio = {
      id: 'p-1',
      name: 'Market Standard',
      nameHe: 'שוק סטנדרטי',
      termYears: 30,
    };
    render(<PaywallFeatureList portfolio={portfolio} />);
    expect(screen.getByText('שוק סטנדרטי')).toBeInTheDocument();
    expect(screen.getByText('30 שנה')).toBeInTheDocument();
  });

  it('does not render portfolio section when no portfolio', () => {
    render(<PaywallFeatureList />);
    expect(screen.queryByText('תיק נבחר')).not.toBeInTheDocument();
  });

  it('renders shield icon', () => {
    render(<PaywallFeatureList />);
    // Shield SVG is present in the DOM
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });
});
