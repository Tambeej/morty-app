/**
 * Sidebar.jsx
 * Collapsible navigation sidebar for authenticated users.
 * Desktop: 240px fixed. Mobile: hidden, slides in as overlay.
 */
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/profile', label: 'Financial Data', icon: '📊' },
  { to: '/upload', label: 'Upload Offer', icon: '📤' },
  { to: '/analysis', label: 'Analysis', icon: '🔍' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
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
    <aside
      aria-label="Main navigation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '240px',
        background: '#1e293b',
        borderRight: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        transform: isOpen ? 'translateX(0)' : undefined,
        transition: 'transform 250ms ease',
      }}
      className="sidebar"
    >
      {/* Logo */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>🏡</span>
        <span
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#f59e0b',
            letterSpacing: '-0.02em',
          }}
        >
          Morty
        </span>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              color: isActive ? '#f8fafc' : '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.9375rem',
              fontWeight: isActive ? 600 : 400,
              background: isActive ? 'rgba(245,158,11,0.08)' : 'transparent',
              borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent',
              transition: 'all 150ms ease',
            })}
          >
            <span style={{ fontSize: '1.1rem' }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#f59e0b',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.875rem',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: '#f8fafc',
              fontSize: '0.875rem',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user?.fullName || user?.email || 'User'}
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              fontSize: '0.75rem',
              padding: 0,
              textAlign: 'left',
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile: hide sidebar by default */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            transform: ${isOpen ? 'translateX(0)' : 'translateX(-100%)'};
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
