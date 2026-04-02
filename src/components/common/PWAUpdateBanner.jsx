/**
 * PWAUpdateBanner Component
 *
 * Displays a notification banner when a new version of the app is available.
 * Allows users to apply the update immediately or dismiss the notification.
 *
 * @module components/common/PWAUpdateBanner
 */

import React from 'react';
import { usePWA } from '../../hooks/usePWA';

/**
 * PWA Update Banner
 *
 * Shows a sticky banner at the top of the page when a service worker update
 * is available. Users can click "Update" to reload with the new version.
 *
 * @returns {JSX.Element|null} The update banner or null if no update available
 */
function PWAUpdateBanner() {
  const { hasUpdate, applyUpdate, dismissUpdate } = usePWA();

  if (!hasUpdate) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Update Icon */}
        <div
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </div>

        {/* Message */}
        <div>
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#f8fafc',
            }}
          >
            עדכון חדש זמין
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '0.75rem',
              color: '#94a3b8',
            }}
          >
            גרסה חדשה של Morty זמינה. עדכן כדי לקבל את התכונות האחרונות.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={applyUpdate}
          style={{
            backgroundColor: '#f59e0b',
            color: '#0f172a',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 150ms ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#fbbf24')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#f59e0b')}
        >
          עדכן עכשיו
        </button>

        <button
          onClick={dismissUpdate}
          aria-label="סגור התראת עדכון"
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '8px',
            cursor: 'pointer',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 150ms ease, color 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#f59e0b';
            e.currentTarget.style.color = '#f8fafc';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#334155';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default PWAUpdateBanner;
