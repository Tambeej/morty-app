/**
 * usePWA Hook
 *
 * Manages PWA-related functionality:
 * - Install prompt (beforeinstallprompt event)
 * - Service worker update detection
 * - Online/offline status
 * - Push notification permission
 *
 * @module hooks/usePWA
 */

import { useState, useEffect, useCallback } from 'react';
import { skipWaiting } from '../serviceWorkerRegistration';

/**
 * @typedef {Object} PWAState
 * @property {boolean} isInstallable - Whether the app can be installed
 * @property {boolean} isInstalled - Whether the app is running as installed PWA
 * @property {boolean} isOnline - Whether the user is online
 * @property {boolean} hasUpdate - Whether a new service worker version is available
 * @property {boolean} isOfflineReady - Whether the app is cached for offline use
 * @property {Function} promptInstall - Trigger the install prompt
 * @property {Function} applyUpdate - Apply the pending service worker update
 * @property {Function} dismissUpdate - Dismiss the update notification
 */

/**
 * Hook for managing PWA features.
 *
 * @returns {PWAState} PWA state and actions
 *
 * @example
 * const { isInstallable, promptInstall, hasUpdate, applyUpdate } = usePWA();
 *
 * if (isInstallable) {
 *   return <button onClick={promptInstall}>Install Morty</button>;
 * }
 */
export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [updateRegistration, setUpdateRegistration] = useState(null);

  useEffect(() => {
    // ── Detect if running as installed PWA ──────────────────────────────────
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalled(isStandalone);

    // ── Install Prompt ──────────────────────────────────────────────────────
    const handleBeforeInstallPrompt = (event) => {
      // Prevent the default mini-infobar from appearing on mobile
      event.preventDefault();
      // Store the event for later use
      setInstallPrompt(event);
      setIsInstallable(true);
      console.log('[Morty PWA] App is installable');
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setIsInstalled(true);
      setInstallPrompt(null);
      console.log('[Morty PWA] App was installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // ── Online/Offline Status ───────────────────────────────────────────────
    const handleOnline = () => {
      setIsOnline(true);
      console.log('[Morty PWA] App is online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('[Morty PWA] App is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // ── Service Worker Update Detection ────────────────────────────────────
    const handleSWUpdate = (event) => {
      setHasUpdate(true);
      setUpdateRegistration(event.detail?.registration || null);
      console.log('[Morty PWA] New version available');
    };

    const handleSWSuccess = () => {
      setIsOfflineReady(true);
      console.log('[Morty PWA] App ready for offline use');
    };

    window.addEventListener('sw-update', handleSWUpdate);
    window.addEventListener('sw-success', handleSWSuccess);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sw-update', handleSWUpdate);
      window.removeEventListener('sw-success', handleSWSuccess);
    };
  }, []);

  /**
   * Trigger the PWA install prompt.
   * Only works if the app is installable (beforeinstallprompt was fired).
   *
   * @returns {Promise<string>} 'accepted' or 'dismissed'
   */
  const promptInstall = useCallback(async () => {
    if (!installPrompt) {
      console.warn('[Morty PWA] Install prompt not available');
      return 'not-available';
    }

    // Show the install prompt
    installPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await installPrompt.userChoice;
    console.log(`[Morty PWA] User ${outcome} the install prompt`);

    // Clear the prompt — it can only be used once
    setInstallPrompt(null);
    setIsInstallable(false);

    return outcome;
  }, [installPrompt]);

  /**
   * Apply the pending service worker update.
   * Sends SKIP_WAITING message and reloads the page.
   */
  const applyUpdate = useCallback(() => {
    if (updateRegistration && updateRegistration.waiting) {
      // Tell the waiting service worker to skip waiting
      updateRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      // Fallback: use the exported skipWaiting function
      skipWaiting();
    }

    // Reload the page to activate the new service worker
    window.location.reload();
  }, [updateRegistration]);

  /**
   * Dismiss the update notification without applying the update.
   */
  const dismissUpdate = useCallback(() => {
    setHasUpdate(false);
    setUpdateRegistration(null);
  }, []);

  return {
    isInstallable,
    isInstalled,
    isOnline,
    hasUpdate,
    isOfflineReady,
    promptInstall,
    applyUpdate,
    dismissUpdate,
  };
}

export default usePWA;
