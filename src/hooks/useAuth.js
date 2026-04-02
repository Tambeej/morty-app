import { useAuthContext } from '../context/AuthContext';

/**
 * useAuth - Custom hook for accessing authentication state and actions.
 * Must be used within an AuthProvider.
 *
 * @returns {Object} auth state and actions
 * @returns {Object|null} .user - Current user object or null
 * @returns {string|null} .token - JWT access token or null
 * @returns {boolean} .loading - Whether auth state is being initialized
 * @returns {boolean} .isAuthenticated - Whether user is logged in
 * @returns {Function} .login - Login function
 * @returns {Function} .register - Register function
 * @returns {Function} .logout - Logout function
 */
const useAuth = () => {
  return useAuthContext();
};

export default useAuth;
