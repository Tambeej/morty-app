/**
 * Navbar - Top navigation bar for authenticated pages.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Navbar({ title }) {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      addToast('Logout failed.', 'error');
    }
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <header
      className="flex items-center justify-between px-6"
      style={{
        height: '64px',
        background: '#1e293b',
        borderBottom: '1px solid #334155',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      {title && (
        <h1 className="text-lg font-semibold" style={{ color: '#f8fafc' }}>
          {title}
        </h1>
      )}

      <div className="flex items-center gap-4 ml-auto">
        {/* Notification Bell */}
        <button
          aria-label="Notifications"
          style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f8fafc')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        {/* Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: '#f59e0b', color: '#0f172a' }}
            >
              {initials}
            </div>
            <svg
              className="w-4 h-4"
              style={{ color: '#64748b' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-lg py-1"
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                zIndex: 50,
              }}
              role="menu"
            >
              <div className="px-4 py-2" style={{ borderBottom: '1px solid #334155' }}>
                <p className="text-sm font-medium" style={{ color: '#f8fafc' }}>
                  {user?.fullName || 'User'}
                </p>
                <p className="text-xs" style={{ color: '#64748b' }}>
                  {user?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm transition-colors"
                style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#273549';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#94a3b8';
                }}
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
}

Navbar.propTypes = {
  title: PropTypes.string,
};
