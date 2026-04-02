/**
 * Top Navigation Bar Component
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * @param {Function} onMenuToggle - Toggle mobile sidebar
 */
const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-navy-surface border-b border-border flex items-center px-6 gap-4">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
        aria-label="Toggle navigation menu"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search..."
            className="w-full h-9 pl-9 pr-4 bg-navy-elevated border border-border rounded-lg text-sm text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20"
            aria-label="Search"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <button
          className="relative text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
          aria-label="Notifications"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold rounded-full" aria-hidden="true" />
        </button>

        {/* Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
            aria-label="User menu"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center">
              <span className="text-gold text-sm font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-48 bg-navy-surface border border-border rounded-lg shadow-card z-50"
              role="menu"
            >
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-[#f8fafc]">{user?.name}</p>
                <p className="text-xs text-[#64748b]">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-[#94a3b8] hover:bg-navy-elevated hover:text-error transition-colors"
                role="menuitem"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
