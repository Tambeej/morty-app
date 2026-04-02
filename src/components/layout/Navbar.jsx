/**
 * Navbar.jsx
 * Top navigation bar for authenticated pages.
 * Shows hamburger (mobile), search, notification bell, and user avatar dropdown.
 */
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    addToast('You have been signed out.', 'info');
    navigate('/login');
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?';

  return (
    <header
      style={{
        height: '64px',
        background: '#1e293b',
        borderBottom: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Hamburger (mobile only) */}
      <button
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#94a3b8',
          fontSize: '1.25rem',
          padding: '4px',
          display: 'none',
        }}
        className="navbar-hamburger"
      >
        ☰
      </button>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: '400px' }}>
        <input
          type="search"
          placeholder="Search..."
          aria-label="Search"
          style={{
            width: '100%',
            background: '#273549',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '8px 16px',
            color: '#f8fafc',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Bell */}
      <button
        aria-label="Notifications"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#94a3b8',
          fontSize: '1.25rem',
          padding: '4px',
          position: 'relative',
        }}
      >
        🔔
      </button>

      {/* Avatar dropdown */}
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          aria-label="User menu"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#f59e0b',
            color: '#0f172a',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {initials}
        </button>

        {dropdownOpen && (
          <div
            role="menu"
            style={{
              position: 'absolute',
              top: '44px',
              right: 0,
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              minWidth: '180px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              overflow: 'hidden',
              zIndex: 50,
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #334155',
                color: '#94a3b8',
                fontSize: '0.8125rem',
              }}
            >
              {user?.email}
            </div>
            <button
              role="menuitem"
              onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#f8fafc',
                fontSize: '0.875rem',
                textAlign: 'left',
              }}
            >
              Financial Profile
            </button>
            <button
              role="menuitem"
              onClick={handleLogout}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#ef4444',
                fontSize: '0.875rem',
                textAlign: 'left',
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .navbar-hamburger { display: block !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
