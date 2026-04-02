import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-navy-surface border-b border-border flex items-center px-4 lg:px-6 gap-4">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-elevated transition-colors"
        aria-label="Toggle navigation menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div className="flex-1 max-w-md">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search..."
            className="w-full h-9 bg-navy-elevated border border-border rounded-input pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/20 transition-all"
            aria-label="Search"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-elevated transition-colors" aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full" aria-hidden="true" />
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-navy-elevated transition-colors"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
              <span className="text-gold text-sm font-semibold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
            <svg
              className={clsx('text-slate-400 transition-transform duration-150', isDropdownOpen && 'rotate-180')}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-navy-surface border border-border rounded-card shadow-card z-50 animate-fade-in" role="menu">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setIsDropdownOpen(false); navigate('/profile'); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-navy-elevated transition-colors"
                  role="menuitem"
                >
                  Financial Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-error hover:bg-navy-elevated transition-colors"
                  role="menuitem"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
