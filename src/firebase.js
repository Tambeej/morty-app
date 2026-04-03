/**
 * Firebase Client SDK initialization for Morty.
 *
 * Initializes the Firebase app (singleton) and exports the Auth instance
 * and GoogleAuthProvider for use throughout the application.
 *
 * Configuration is read from Vite environment variables (VITE_ prefix).
 * All variables are optional at module load time so that the module can be
 * imported in test environments without throwing; a warning is logged when
 * any required key is missing.
 *
 * Required env vars (set in .env / CI secrets):
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_STORAGE_BUCKET   (optional but recommended)
 *   VITE_FIREBASE_MESSAGING_SENDER_ID (optional)
 *   VITE_FIREBASE_APP_ID
 *
 * Usage:
 *   import { auth, googleProvider } from '../firebase';
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

/** Firebase web app configuration sourced from Vite env vars. */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Warn in development if critical config keys are missing.
if (import.meta.env.DEV) {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingKeys = requiredKeys.filter((k) => !firebaseConfig[k]);
  if (missingKeys.length > 0) {
    console.warn(
      `[Firebase] Missing required env vars: ${missingKeys
        .map((k) => `VITE_FIREBASE_${k.replace(/([A-Z])/g, '_$1').toUpperCase()}`)
        .join(', ')}. ` +
        'Google sign-in will not work until these are set.'
    );
  }
}

/**
 * Initialize Firebase app as a singleton.
 *
 * `getApps()` returns the list of already-initialized apps; if one exists
 * we reuse it (important for HMR / test environments that re-import modules).
 */
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * Firebase Auth instance.
 * Use this to call signInWithPopup, signOut, onAuthStateChanged, etc.
 */
export const auth = getAuth(app);

/**
 * Pre-configured Google OAuth provider.
 *
 * Requests the user's profile and email scopes by default.
 * Additional scopes can be added via `googleProvider.addScope()`.
 */
export const googleProvider = new GoogleAuthProvider();

// Request email and profile scopes explicitly (these are included by default
// but listed here for clarity and future extensibility).
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Always prompt the account chooser so users can switch accounts.
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export default app;
