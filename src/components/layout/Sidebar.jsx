import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '🏠', labelKey: 'sidebar.home' },
  { to: '/profile',   icon: '📊', labelKey: 'sidebar.financialData' },
  { to: '/upload',    icon: '📄', labelKey: 'sidebar.offers' },
  { to: '/analysis',  icon: '🔍', labelKey: 'sidebar.analyze' }
];

/**
 * Collapsible sidebar navigation.
 * Collapses to icon-only on mobile.
 */
export default function Sidebar({ collapsed = false }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch {
      toast.error(t('sidebar.logoutError'));
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
        {NAV_ITEMS.map(({ to, icon, labelKey }) => (
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
            aria-label={t(labelKey)}
          >
            <span className="text-lg" aria-hidden="true">{icon}</span>
            {!collapsed && <span>{t(labelKey)}</span>}
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
          aria-label={t('sidebar.logOut')}
        >
          <span aria-hidden="true">🚪</span>
          {!collapsed && <span>{loggingOut ? t('sidebar.loggingOut') : t('sidebar.logOut')}</span>}
        </button>
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  collapsed: PropTypes.bool
};
