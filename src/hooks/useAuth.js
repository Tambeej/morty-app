import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth hook — access authentication state and actions.
 * Must be used within an AuthProvider.
 *
 * @returns {{ user, token, loading, login, logout, register }}
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
