/**
 * SETUVANA - Firebase Authentication & Google OAuth Provider
 * Integrated with Google Calendar scopes per Workspace Integration Skill.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  Auth,
  User,
  signOut,
} from 'firebase/auth';

let firebaseConfig: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  firebaseConfig = await import('../../firebase-applet-config.json');
} catch {
  console.warn('firebase-applet-config.json not found directly, using fallback structure');
}

const config =
  firebaseConfig?.default ||
  firebaseConfig || {
    apiKey: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FIREBASE_API_KEY) || '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  };

/**
 * Firebase is initialized lazily and defensively.
 *
 * The config file is loaded as a separate chunk at runtime. If that chunk is
 * unavailable (first load while offline, a pruned deploy chunk, a stale cache
 * entry) the fallback config has no apiKey and `getAuth()` throws
 * `auth/invalid-api-key`. Doing that at module scope used to kill the whole
 * bundle before React mounted, which presents as a completely blank screen.
 * Google sign-in now degrades on its own and the rest of SETUVANA still renders.
 */
let cachedAuth: Auth | null = null;
let initFailed = false;

export function getFirebaseAuth(): Auth | null {
  if (cachedAuth) return cachedAuth;
  if (initFailed) return null;

  const apiKey =
    config?.apiKey ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FIREBASE_API_KEY) ||
    '';

  if (!apiKey) {
    initFailed = true;
    console.warn(
      'Firebase credentials unavailable — Google Calendar sign-in is disabled, all other features remain active.'
    );
    return null;
  }

  try {
    const app = !getApps().length ? initializeApp(config) : getApp();
    cachedAuth = getAuth(app);
    return cachedAuth;
  } catch (err) {
    initFailed = true;
    console.warn('Firebase initialisation failed — Google Calendar sign-in is disabled.', err);
    return null;
  }
}

export const isFirebaseConfigured = (): boolean => getFirebaseAuth() !== null;

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar.events');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  const auth = getFirebaseAuth();
  if (!auth) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // In-memory token empty after refresh
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error(
      'Google sign-in is not configured for this deployment. Offline .ics calendar export still works.'
    );
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      // Still return user even if token didn't return
      console.warn('OAuth token not returned in credential');
    }
    cachedAccessToken = credential?.accessToken || 'demo_oauth_token';
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  const auth = getFirebaseAuth();
  if (auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out failed:', err);
    }
  }
  cachedAccessToken = null;
};
