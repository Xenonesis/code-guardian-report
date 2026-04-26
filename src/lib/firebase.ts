// src/firebase.ts

import { initializeApp } from "firebase/app";
import { enableNetwork, disableNetwork } from "firebase/firestore";
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

if (missingVars.length > 0 && process.env.NODE_ENV !== "test") {
  const message = `Firebase configuration is incomplete. Missing: ${missingVars.join(", ")}`;
  logger.error(message);
  throw new Error(message);
}

// Firebase configuration using environment variables. Test defaults are only
// used when tests do not mock this module.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "test-api-key",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "test-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "test-project-id",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "test-storage-bucket",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "test-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "test-app-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with optimized settings
import { createOptimizedFirestore } from "./firestore-config";

export const db = createOptimizedFirestore(app);

// Export network control functions
export { enableNetwork, disableNetwork };
