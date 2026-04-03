/**
 * Compatibility shim — re-exports apiService so AuthContext.jsx
 * can import it without a circular dependency on services/api.js.
 *
 * This file exists solely to satisfy the import in AuthContext.jsx
 * while keeping the real implementation in services/api.js.
 */
export { apiService } from '../services/api';
