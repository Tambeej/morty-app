/**
 * Morty App - Entry Point
 * Renders the React app and registers the service worker for PWA support
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { register as registerServiceWorker } from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA support
// Cache-First for static assets, Network-First for API calls
registerServiceWorker({
  onSuccess: (registration) => {
    console.log('Morty is ready for offline use.');
  },
  onUpdate: (registration) => {
    console.log('New version of Morty is available. Refresh to update.');
  },
});

// Report web vitals for performance monitoring
reportWebVitals();
