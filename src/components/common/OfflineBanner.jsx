/**
 * OfflineBanner Component
 *
 * Displays a notification banner when the user loses internet connectivity.
 * Automatically hides when the connection is restored.
 *
 * @module components/common/OfflineBanner
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePWA } from '../../hooks/usePWA';

/**
 * Offline Status Banner
 *
 * Shows a sticky banner at the bottom of the page when the user is offline.
 * Disappears automatically when connectivity is restored.
 *
 * @returns {JSX.Element|null} The offline banner or null if online
 */
function OfflineBanner() {
  const { t } = useTranslation();
  const { isOnline } = usePWA();
  const [wasOffline, setWasOffline] = useState(false);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowRestored(false);
    } else if (wasOffline && isOnline) {
      // Show "connection restored" briefly
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showRestored) return null;

  const isRestored = isOnline && showRestored;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9998,
        backgroundColor: isRestored ? '#10b981' : '#1e293b',
        border: `1px solid ${isRestored ? '#10b981' : '#334155'}`,
        borderRadius: '8px',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        animation: 'slideUp 200ms ease-out',
        whiteSpace: 'nowrap',
      }}
    >
      {/* Status Icon */}
      {isRestored ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      )}

      {/* Message */}
      <span
        style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: isRestored ? 'white' : '#f8fafc',
        }}
      >
        {isRestored ? t('common.restored') : t('common.offline')}
      </span>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default OfflineBanner;
