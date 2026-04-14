import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Top navigation bar with search, notifications, and user avatar.
 *
 * Firestore user shape: { id: string, email: string, phone: string, verified: boolean }
 * Note: Firestore users do NOT have a `name` field — avatar initials are derived
 * from email prefix when name is absent.
 */
export default function Navbar({ onMenuToggle }) {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  function toggleLang() {
    const next = currentLang === 'en' ? 'he' : 'en';
    i18n.changeLanguage(next);
  }

  /**
   * Derive avatar initials from the user object.
   *
   * Priority:
   *   1. user.name (legacy / optional field)
   *   2. user.displayName (optional field)
   *   3. user.email prefix (Firestore shape — most common)
   *   4. Fallback: 'U'
   *
   * @returns {string} 1–2 uppercase characters
   */
  function getInitials() {
    if (!user) return 'U';
    // Try name fields first
    const name = user.name || user.displayName;
    if (name && name.trim()) {
      return name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    // Fall back to email prefix (Firestore shape has no name)
    if (user.email) {
      const prefix = user.email.split('@')[0];
      return prefix.slice(0, 2).toUpperCase();
    }
    return 'U';
  }

  /**
   * Get a display label for the user (for aria-label).
   * Uses email when name is absent (Firestore shape).
   */
  function getUserLabel() {
    if (!user) return 'Unknown';
    return user.name || user.displayName || user.email || 'Unknown';
  }

  const initials = getInitials();

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-navy-surface border-b border-border sticky top-0 z-10">
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuToggle}
        className="md:hidden text-[#94a3b8] hover:text-[#f8fafc] p-1"
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Search */}
      <div className="hidden md:flex flex-1 max-w-sm">
        <input
          type="search"
          placeholder="Search..."
          className="w-full h-9 rounded-input bg-navy-elevated border border-border px-4 text-sm text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-gold"
          aria-label="Search"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="text-xs font-medium text-[#94a3b8] hover:text-gold transition-colors"
          aria-label="Toggle language"
        >
          {currentLang === 'en' ? 'עברית' : 'EN'}
        </button>

        {/* Notification bell */}
        <button
          className="relative text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
          aria-label="Notifications"
        >
          🔔
        </button>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-navy text-xs font-bold cursor-pointer"
          aria-label={`User: ${getUserLabel()}`}
          title={getUserLabel()}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}

Navbar.propTypes = {
  onMenuToggle: PropTypes.func
};
