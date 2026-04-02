/**
 * Morty App Entry Point
 * Initializes React app with service worker registration
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/globals.css';
import App from './App';
import { register as registerServiceWorker } from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA functionality
registerServiceWorker({
  onSuccess: () => console.log('[Morty] App cached for offline use.'),
  onUpdate: () => console.log('[Morty] New version available. Refresh to update.'),
});

// Report web vitals for performance monitoring
reportWebVitals();
