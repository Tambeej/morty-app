import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Top navigation bar with search, notifications, and user avatar dropdown.
 */
const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-navy-surface border-b border-border flex items-center px-6 gap-4 flex-shrink-0">
      {/* Mobile menu toggle */}
      {onMenuToggle && (
        <button
          onClick={onMenuToggle}
          className="md:hidden text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search..."
            className="w-full h-9 bg-navy-elevated border border-border rounded-input pl-9 pr-4 text-sm
              text-text-primary placeholder-text-muted focus:outline-none focus:border-gold
              focus:ring-2 focus:ring-gold/20 transition-all"
            aria-label="Search"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications bell */}
        <button
          className="relative p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-navy-elevated"
          aria-label="Notifications"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full" aria-hidden="true" />
        </button>

        {/* Avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-navy-elevated transition-colors"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
              <span className="text-gold text-sm font-semibold">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-navy-surface border border-border rounded-card shadow-card z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-xs text-text-muted truncate">{user?.email}</p>
              </div>
              <ul className="py-1">
                <li>
                  <button
                    onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-navy-elevated transition-colors"
                  >
                    Financial Profile
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-navy-elevated transition-colors"
                  >
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

Navbar.propTypes = {
  onMenuToggle: PropTypes.func,
};

export default Navbar;
