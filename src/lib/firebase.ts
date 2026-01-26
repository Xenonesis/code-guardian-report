// src/firebase.ts

import { initializeApp } from "firebase/app";
import {
  enableNetwork,
  disableNetwork,
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { logger } from "@/utils/logger";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "mock-app-id",
};

// Validate Firebase configuration
const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
// Only log warning once in development (not in tests)
if (
  typeof window !== "undefined" &&
  !(window as any).__firebaseEnvWarningShown
) {
  if (
    missingVars.length > 0 &&
    firebaseConfig.apiKey === "mock-api-key" &&
    process.env.NODE_ENV !== "test" &&
    !(window as any).isTest
  ) {
    // Log debug instead of warn to reduce console noise in development
    logger.debug("Firebase: Using mock configuration (env vars not set)");
    (window as any).__firebaseEnvWarningShown = true;
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with optimized settings
import { createOptimizedFirestore } from "./firestore-config";

export const db = createOptimizedFirestore(app);
export const auth = getAuth(app);

// Configure auth persistence and settings
auth.settings.appVerificationDisabledForTesting = false;

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Configure providers for better popup handling and COOP compatibility
googleProvider.addScope("email");
googleProvider.addScope("profile");
googleProvider.setCustomParameters({
  prompt: "select_account",
  // Remove hosted domain restriction to avoid COOP issues
  hd: "",
  // Add parameters to help with COOP issues
  access_type: "online",
  include_granted_scopes: "true",
});

githubProvider.addScope("user:email");
githubProvider.setCustomParameters({
  allow_signup: "true",
});

// Configure auth for better COOP handling
if (typeof window !== "undefined") {
  // Set auth language to browser language
  auth.languageCode = navigator.language || "en";

  // Configure auth settings for better popup handling
  auth.settings.appVerificationDisabledForTesting = false;
}

// Export network control functions
export { enableNetwork, disableNetwork };
