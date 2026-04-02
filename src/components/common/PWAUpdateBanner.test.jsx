/**
 * Tests for PWAUpdateBanner component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PWAUpdateBanner from './PWAUpdateBanner';
import { usePWA } from '../../hooks/usePWA';

// Mock the usePWA hook
jest.mock('../../hooks/usePWA');

describe('PWAUpdateBanner', () => {
  const mockApplyUpdate = jest.fn();
  const mockDismissUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when hasUpdate is false', () => {
    usePWA.mockReturnValue({
      hasUpdate: false,
      applyUpdate: mockApplyUpdate,
      dismissUpdate: mockDismissUpdate,
    });

    const { container } = render(<PWAUpdateBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when hasUpdate is true', () => {
    usePWA.mockReturnValue({
      hasUpdate: true,
      applyUpdate: mockApplyUpdate,
      dismissUpdate: mockDismissUpdate,
    });

    render(<PWAUpdateBanner />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('עדכון חדש זמין')).toBeInTheDocument();
  });

  it('should call applyUpdate when update button is clicked', () => {
    usePWA.mockReturnValue({
      hasUpdate: true,
      applyUpdate: mockApplyUpdate,
      dismissUpdate: mockDismissUpdate,
    });

    render(<PWAUpdateBanner />);
    fireEvent.click(screen.getByText('עדכן עכשיו'));
    expect(mockApplyUpdate).toHaveBeenCalledTimes(1);
  });

  it('should call dismissUpdate when close button is clicked', () => {
    usePWA.mockReturnValue({
      hasUpdate: true,
      applyUpdate: mockApplyUpdate,
      dismissUpdate: mockDismissUpdate,
    });

    render(<PWAUpdateBanner />);
    fireEvent.click(screen.getByLabelText('סגור התראת עדכון'));
    expect(mockDismissUpdate).toHaveBeenCalledTimes(1);
  });

  it('should have proper accessibility attributes', () => {
    usePWA.mockReturnValue({
      hasUpdate: true,
      applyUpdate: mockApplyUpdate,
      dismissUpdate: mockDismissUpdate,
    });

    render(<PWAUpdateBanner />);
    const banner = screen.getByRole('alert');
    expect(banner).toHaveAttribute('aria-live', 'polite');
  });
});
