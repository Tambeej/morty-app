/**
 * Tests for OfflineBanner component
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import OfflineBanner from './OfflineBanner';
import { usePWA } from '../../hooks/usePWA';

// Mock the usePWA hook
jest.mock('../../hooks/usePWA');

describe('OfflineBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not render when online and never was offline', () => {
    usePWA.mockReturnValue({ isOnline: true });

    const { container } = render(<OfflineBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('should render offline message when offline', () => {
    usePWA.mockReturnValue({ isOnline: false });

    render(<OfflineBanner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.getByText('אין חיבור לאינטרנט — מצב לא מקוון')
    ).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    usePWA.mockReturnValue({ isOnline: false });

    render(<OfflineBanner />);
    const banner = screen.getByRole('status');
    expect(banner).toHaveAttribute('aria-live', 'polite');
  });
});
