/**
 * Application entry point.
 * Renders the React app, registers the service worker for PWA support.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA offline support
// Change to serviceWorkerRegistration.unregister() to disable PWA
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('[SW] Content is cached for offline use.');
  },
  onUpdate: (registration) => {
    console.log('[SW] New content is available; please refresh.');
    // Optionally notify user of update
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  },
});
