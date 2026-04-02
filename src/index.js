/**
 * Morty Application Entry Point
 *
 * Initializes the React application with:
 * - React 18 concurrent rendering
 * - Service worker registration for PWA support
 * - Global styles
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// ─── React 18 Root ────────────────────────────────────────────────────────────

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ─── PWA Service Worker Registration ─────────────────────────────────────────

/**
 * Register the service worker for PWA capabilities.
 *
 * Callbacks:
 * - onSuccess: Service worker installed, content cached for offline use
 * - onUpdate: New version available, prompt user to refresh
 * - onError: Registration failed (logged to console)
 *
 * To disable PWA, change register() to unregister().
 */
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('[Morty] App is ready for offline use!', registration);
    // Dispatch custom event so components can react to SW success
    window.dispatchEvent(
      new CustomEvent('sw-success', { detail: { registration } })
    );
  },
  onUpdate: (registration) => {
    console.log('[Morty] New version available!', registration);
    // Dispatch custom event so components can show update notification
    window.dispatchEvent(
      new CustomEvent('sw-update', { detail: { registration } })
    );
  },
  onError: (error) => {
    console.error('[Morty] Service worker registration failed:', error);
  },
});
