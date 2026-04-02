/**
 * InstallPrompt Component
 *
 * Displays a prompt encouraging users to install the Morty PWA.
 * Appears after the user has been using the app for a while.
 * Respects user dismissal and doesn't show again for 7 days.
 *
 * @module components/common/InstallPrompt
 */

import React, { useState, useEffect } from 'react';
import { usePWA } from '../../hooks/usePWA';

const DISMISSED_KEY = 'morty_install_prompt_dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * PWA Install Prompt
 *
 * Shows a card prompting the user to install the app.
 * Only shown when the app is installable and the user hasn't dismissed it recently.
 *
 * @returns {JSX.Element|null} The install prompt or null
 */
function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (!isInstallable || isInstalled) {
      setIsVisible(false);
      return;
    }

    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DURATION) {
        return; // Don't show yet
      }
    }

    // Show after a short delay (don't interrupt initial load)
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled]);

  const handleInstall = async () => {
    setIsInstalling(true);
    const outcome = await promptInstall();
    setIsInstalling(false);
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="התקן את Morty"
      aria-modal="false"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9997,
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '20px',
        width: '320px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        animation: 'slideInRight 250ms ease-out',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* App Icon */}
          <div
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: '#f59e0b',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="#0f172a"
              aria-hidden="true"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline
                points="9 22 9 12 15 12 15 22"
                fill="none"
                stroke="#0f172a"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <div>
            <p
              style={{
                margin: 0,
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: '#f8fafc',
              }}
            >
              התקן את Morty
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '0.75rem',
                color: '#94a3b8',
              }}
            >
              גישה מהירה מהמסך הראשי
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          aria-label="סגור"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#94a3b8')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
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

      {/* Benefits */}
      <ul
        style={{
          margin: '0 0 16px',
          padding: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {[
          'גישה מהירה ללא דפדפן',
          'עבודה במצב לא מקוון',
          'התראות על ניתוחים חדשים',
        ].map((benefit) => (
          <li
            key={benefit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8125rem',
              color: '#94a3b8',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {benefit}
          </li>
        ))}
      </ul>

      {/* Install Button */}
      <button
        onClick={handleInstall}
        disabled={isInstalling}
        style={{
          width: '100%',
          backgroundColor: isInstalling ? '#d97706' : '#f59e0b',
          color: '#0f172a',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 16px',
          fontSize: '0.9375rem',
          fontWeight: 600,
          cursor: isInstalling ? 'not-allowed' : 'pointer',
          transition: 'background 150ms ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          opacity: isInstalling ? 0.8 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isInstalling) e.currentTarget.style.backgroundColor = '#fbbf24';
        }}
        onMouseLeave={(e) => {
          if (!isInstalling) e.currentTarget.style.backgroundColor = '#f59e0b';
        }}
      >
        {isInstalling ? (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: 'spin 600ms linear infinite' }}
              aria-hidden="true"
            >
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
              <line x1="2" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
            </svg>
            מתקין...
          </>
        ) : (
          <>
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            התקן עכשיו
          </>
        )}
      </button>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default InstallPrompt;
