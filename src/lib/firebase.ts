// src/firebase.ts

import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  connectFirestoreEmulator, 
  enableNetwork, 
  disableNetwork,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, connectAuthEmulator } from "firebase/auth";

// Firebase configuration using .env.local variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate Firebase configuration
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
if (missingVars.length > 0) {
  console.error('Missing Firebase environment variables:', missingVars);
  throw new Error(`Missing Firebase configuration: ${missingVars.join(', ')}`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with optimized settings
import { createOptimizedFirestore } from './firestore-config';

export const db = createOptimizedFirestore(app);
export const auth = getAuth(app);

// Configure auth persistence and settings
auth.settings.appVerificationDisabledForTesting = false;

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Configure providers for better popup handling and COOP compatibility
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // Remove hosted domain restriction to avoid COOP issues
  hd: '',
  // Add parameters to help with COOP issues
  access_type: 'online',
  include_granted_scopes: 'true'
});

githubProvider.addScope('user:email');
githubProvider.setCustomParameters({
  allow_signup: 'true'
});

// Configure auth for better COOP handling
if (typeof window !== 'undefined') {
  // Set auth language to browser language
  auth.languageCode = navigator.language || 'en';
  
  // Configure auth settings for better popup handling
  auth.settings.appVerificationDisabledForTesting = false;
}

// Export network control functions
export { enableNetwork, disableNetwork };
