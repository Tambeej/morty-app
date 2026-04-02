/**
 * PWAStatus Component
 *
 * Displays the current PWA status in the app (for debugging/info purposes).
 * Shows online/offline status, install state, and update availability.
 * Can be included in the app footer or settings page.
 *
 * @module components/common/PWAStatus
 */

import React from 'react';
import { usePWA } from '../../hooks/usePWA';

/**
 * PWA Status Indicator
 *
 * A small status badge showing the current PWA state.
 * Useful for the settings page or footer.
 *
 * @returns {JSX.Element} Status indicator
 */
function PWAStatus() {
  const { isOnline, isInstalled, isOfflineReady, hasUpdate } = usePWA();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}
      aria-label="סטטוס PWA"
    >
      {/* Online Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          color: '#94a3b8',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isOnline ? '#10b981' : '#ef4444',
            display: 'inline-block',
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
        {isOnline ? 'מחובר' : 'לא מקוון'}
      </div>

      {/* Offline Ready */}
      {isOfflineReady && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: '#94a3b8',
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          מוכן לשימוש לא מקוון
        </div>
      )}

      {/* Installed */}
      {isInstalled && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: '#94a3b8',
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          מותקן
        </div>
      )}

      {/* Update Available */}
      {hasUpdate && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: '#f59e0b',
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          עדכון זמין
        </div>
      )}
    </div>
  );
}

export default PWAStatus;
