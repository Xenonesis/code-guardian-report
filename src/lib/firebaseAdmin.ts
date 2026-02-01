import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let adminApp: App | undefined;
let adminDb: Firestore | undefined;

/**
 * Initialize Firebase Admin SDK for server-side operations
 * Used by API routes for Firestore access
 */
export function getFirebaseAdmin(): { app: App; db: Firestore } {
  if (adminApp && adminDb) {
    return { app: adminApp, db: adminDb };
  }

  const existingApps = getApps();

  if (existingApps.length > 0) {
    adminApp = existingApps[0];
    adminDb = getFirestore(adminApp);
    return { app: adminApp, db: adminDb };
  }

  // Check for required environment variables
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId) {
    throw new Error(
      "Firebase Admin: FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID is required"
    );
  }

  // Initialize with service account if credentials are available
  if (clientEmail && privateKey) {
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    // Initialize without credentials (works in Google Cloud environments with default credentials)
    // In development, this will fail if not running in a Google Cloud environment
    console.warn(
      "Firebase Admin: No service account credentials provided. " +
        "Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY for full functionality."
    );
    adminApp = initializeApp({
      projectId,
    });
  }

  adminDb = getFirestore(adminApp);
  return { app: adminApp, db: adminDb };
}

/**
 * Check if Firebase Admin is properly configured
 */
export function isFirebaseAdminConfigured(): boolean {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  return !!(projectId && clientEmail && privateKey);
}
