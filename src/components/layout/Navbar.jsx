import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Top navigation bar with search, notifications, and user avatar.
 */
export default function Navbar({ onMenuToggle }) {
  const { user } = useAuth();
  const [lang, setLang] = useState('EN');

  function toggleLang() {
    const next = lang === 'EN' ? 'HE' : 'EN';
    setLang(next);
    document.documentElement.dir = next === 'HE' ? 'rtl' : 'ltr';
    document.documentElement.lang = next === 'HE' ? 'he' : 'en';
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

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
          {lang === 'EN' ? 'עברית' : 'EN'}
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
          aria-label={`User: ${user?.name || 'Unknown'}`}
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
