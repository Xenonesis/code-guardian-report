// src/firebase.ts
// Firebase is now OPTIONAL - app uses NextAuth + Prisma instead
// This file provides Firestore with fallback mock when config is missing

import { initializeApp, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, enableNetwork, disableNetwork, type Firestore } from "firebase/firestore";
import { logger } from "@/utils/logger";

const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
const hasFirebaseConfig = missingVars.length === 0;

// Warn but don't throw - Firebase is optional now
if (!hasFirebaseConfig && process.env.NODE_ENV !== "test") {
  logger.warn("Firebase configuration incomplete (optional). Missing: " + missingVars.join(", "));
}

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "test-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "test-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "test-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "test-storage-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "test-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "test-app-id",
};

// Initialize Firebase with fallback config if real config is missing
// This ensures db is always defined for backward compatibility
let app: FirebaseApp;
let db: Firestore;

try {
  app = initializeApp(firebaseConfig);
} catch {
  // If already initialized, get the existing app
  app = getApp();
}

db = getFirestore(app);

// Export db (always defined)
export { db, enableNetwork, disableNetwork };
