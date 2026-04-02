import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '🏠', label: 'Home' },
  { to: '/profile',   icon: '📊', label: 'Financial Data' },
  { to: '/upload',    icon: '📄', label: 'Offers' },
  { to: '/analysis',  icon: '🔍', label: 'Analyze' }
];

/**
 * Collapsible sidebar navigation.
 * Collapses to icon-only on mobile.
 */
export default function Sidebar({ collapsed = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch {
      toast.error('Logout failed. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <aside
      className={[
        'sidebar flex flex-col bg-navy-surface border-r border-border h-screen sticky top-0 transition-all duration-300',
        collapsed ? 'w-[60px]' : 'w-[240px]'
      ].join(' ')}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <span className="text-2xl" aria-hidden="true">🏡</span>
        {!collapsed && (
          <span className="text-xl font-bold text-gold">Morty</span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'text-gold bg-navy-elevated border-l-2 border-gold'
                  : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-navy-elevated'
              ].join(' ')
            }
            aria-label={label}
          >
            <span className="text-lg" aria-hidden="true">{icon}</span>
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-4">
        {!collapsed && user && (
          <p className="text-xs text-[#64748b] mb-2 truncate">{user.email}</p>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-red-400 transition-colors w-full"
          aria-label="Log out"
        >
          <span aria-hidden="true">🚪</span>
          {!collapsed && <span>{loggingOut ? 'Logging out...' : 'Log out'}</span>}
        </button>
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  collapsed: PropTypes.bool
};
