/**
 * Top Navigation Bar Component
 * Search, notifications, language switcher, and user avatar
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';

function Navbar({ onMenuToggle, sidebarCollapsed }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'he' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  return (
    <header
      className="fixed top-0 right-0 rtl:right-auto rtl:left-0 z-30 h-16 bg-navy-surface border-b border-border"
      style={{
        left: sidebarCollapsed ? '4rem' : '15rem',
        right: 0,
      }}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-navy-elevated rounded-lg px-3 py-2 w-64">
          <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search..."
            className="bg-transparent text-sm text-text-primary placeholder-text-muted focus:outline-none w-full"
            aria-label="Search"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="text-xs font-medium text-text-secondary hover:text-gold transition-colors px-2 py-1 rounded border border-border hover:border-gold"
            aria-label="Toggle language"
          >
            {i18n.language === 'en' ? '\u05e2\u05d1\u05e8\u05d9\u05ea' : 'EN'}
          </button>

          {/* Notifications */}
          <button
            className="relative text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold rounded-full" aria-hidden="true" />
          </button>

          {/* User avatar */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="User menu"
              aria-expanded={showUserMenu}
            >
              <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center">
                <span className="text-gold text-sm font-semibold">
                  {user?.fullName ? user.fullName[0].toUpperCase() : user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-2 w-48 bg-navy-surface border border-border rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {user?.fullName || user?.email}
                  </p>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                </div>
                <button
                  className="w-full text-left rtl:text-right px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-navy-elevated transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  {t('nav.profile')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
