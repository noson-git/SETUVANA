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

const app = !getApps().length ? initializeApp(config) : getApp();

export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar.events');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
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
  await signOut(auth);
  cachedAccessToken = null;
};
