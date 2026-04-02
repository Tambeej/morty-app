/**
 * Tests for usePWA hook
 *
 * Tests the PWA hook's ability to:
 * - Detect online/offline status
 * - Handle install prompt events
 * - Detect service worker updates
 * - Manage state correctly
 */

import { renderHook, act } from '@testing-library/react';
import { usePWA } from './usePWA';

// Mock serviceWorkerRegistration
jest.mock('../serviceWorkerRegistration', () => ({
  skipWaiting: jest.fn(),
}));

describe('usePWA', () => {
  let originalNavigatorOnLine;

  beforeEach(() => {
    originalNavigatorOnLine = navigator.onLine;
    // Reset localStorage
    localStorage.clear();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      value: originalNavigatorOnLine,
      writable: true,
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should return correct initial state when online', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true });

      const { result } = renderHook(() => usePWA());

      expect(result.current.isInstallable).toBe(false);
      expect(result.current.isOnline).toBe(true);
      expect(result.current.hasUpdate).toBe(false);
      expect(result.current.isOfflineReady).toBe(false);
      expect(typeof result.current.promptInstall).toBe('function');
      expect(typeof result.current.applyUpdate).toBe('function');
      expect(typeof result.current.dismissUpdate).toBe('function');
    });

    it('should return correct initial state when offline', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

      const { result } = renderHook(() => usePWA());

      expect(result.current.isOnline).toBe(false);
    });
  });

  describe('online/offline detection', () => {
    it('should update isOnline when going offline', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true });

      const { result } = renderHook(() => usePWA());
      expect(result.current.isOnline).toBe(true);

      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      expect(result.current.isOnline).toBe(false);
    });

    it('should update isOnline when coming back online', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

      const { result } = renderHook(() => usePWA());
      expect(result.current.isOnline).toBe(false);

      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      expect(result.current.isOnline).toBe(true);
    });
  });

  describe('install prompt', () => {
    it('should set isInstallable when beforeinstallprompt fires', () => {
      const { result } = renderHook(() => usePWA());
      expect(result.current.isInstallable).toBe(false);

      const mockPromptEvent = {
        preventDefault: jest.fn(),
        prompt: jest.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      };

      act(() => {
        window.dispatchEvent(
          Object.assign(new Event('beforeinstallprompt'), mockPromptEvent)
        );
      });

      expect(result.current.isInstallable).toBe(true);
    });

    it('should set isInstalled when appinstalled fires', () => {
      const { result } = renderHook(() => usePWA());

      act(() => {
        window.dispatchEvent(new Event('appinstalled'));
      });

      expect(result.current.isInstalled).toBe(true);
      expect(result.current.isInstallable).toBe(false);
    });

    it('should return not-available when promptInstall called without prompt', async () => {
      const { result } = renderHook(() => usePWA());

      let outcome;
      await act(async () => {
        outcome = await result.current.promptInstall();
      });

      expect(outcome).toBe('not-available');
    });
  });

  describe('service worker updates', () => {
    it('should set hasUpdate when sw-update event fires', () => {
      const { result } = renderHook(() => usePWA());
      expect(result.current.hasUpdate).toBe(false);

      act(() => {
        window.dispatchEvent(
          new CustomEvent('sw-update', { detail: { registration: {} } })
        );
      });

      expect(result.current.hasUpdate).toBe(true);
    });

    it('should set isOfflineReady when sw-success event fires', () => {
      const { result } = renderHook(() => usePWA());
      expect(result.current.isOfflineReady).toBe(false);

      act(() => {
        window.dispatchEvent(new CustomEvent('sw-success'));
      });

      expect(result.current.isOfflineReady).toBe(true);
    });

    it('should clear hasUpdate when dismissUpdate is called', () => {
      const { result } = renderHook(() => usePWA());

      act(() => {
        window.dispatchEvent(
          new CustomEvent('sw-update', { detail: { registration: {} } })
        );
      });

      expect(result.current.hasUpdate).toBe(true);

      act(() => {
        result.current.dismissUpdate();
      });

      expect(result.current.hasUpdate).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => usePWA());
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'beforeinstallprompt',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'online',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'offline',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });
});
