/**
 * useAuth — convenience re-export of the auth hook.
 *
 * Import from here or directly from context/AuthContext.
 * The canonical implementation is in context/AuthContext.jsx.
 *
 * Provides:
 *   user            — { id: string, email, phone, verified } (Firestore shape, string ID)
 *   token           — JWT access token string | null
 *   isAuthenticated — boolean
 *   isLoading       — boolean
 *   loading         — boolean (legacy alias for isLoading)
 *   error           — string | null
 *
 *   loginUser       — async (credentials: { email, password }) => { success, user?, error? }
 *   registerUser    — async (userData: { email, password, phone? }) => { success, user?, error? }
 *   googleLoginUser — async () => null | { success, user?, error? }
 *                     Opens Firebase Google popup, exchanges ID token for Morty JWTs,
 *                     updates AuthContext state. Returns null if user dismissed popup.
 *   logoutUser      — async () => void
 *   clearError      — () => void
 *
 *   login           — legacy alias for loginUser
 *   register        — legacy alias for registerUser
 *   logout          — legacy alias for logoutUser
 *   googleLogin     — legacy alias for googleLoginUser
 */
export { useAuth } from '../context/AuthContext.jsx';
