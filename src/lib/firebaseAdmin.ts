import {
  getApps,
  initializeApp,
  cert,
  applicationDefault,
  App,
} from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let adminApp: App | undefined;
let adminDb: Firestore | undefined;

function getProjectId(): string | undefined {
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return false;
  return (
    value.includes("your_project_id") ||
    value.includes("your-service-account") ||
    value.includes("...your_private_key...") ||
    value.trim() === "your_project_id"
  );
}

function getServiceAccountCredentials(): {
  projectId: string;
  clientEmail: string;
  privateKey: string;
} | null {
  const projectId = getProjectId();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) return null;

  if (
    isPlaceholder(projectId) ||
    isPlaceholder(clientEmail) ||
    isPlaceholder(privateKey)
  ) {
    return null;
  }

  if (
    !clientEmail.includes(".iam.gserviceaccount.com") ||
    !privateKey.includes("-----BEGIN PRIVATE KEY-----")
  ) {
    return null;
  }

  return { projectId, clientEmail, privateKey };
}

function canUseApplicationDefaultCredentials(): boolean {
  return Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.K_SERVICE ||
    process.env.FUNCTION_TARGET ||
    process.env.FUNCTIONS_EMULATOR ||
    process.env.FIREBASE_CONFIG
  );
}

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

  const projectId = getProjectId();
  const serviceAccount = getServiceAccountCredentials();

  if (!projectId) {
    throw new Error(
      "Firebase Admin: FIREBASE_PROJECT_ID, GOOGLE_CLOUD_PROJECT, GCLOUD_PROJECT, or NEXT_PUBLIC_FIREBASE_PROJECT_ID is required"
    );
  }

  if (serviceAccount) {
    adminApp = initializeApp({
      credential: cert({
        projectId: serviceAccount.projectId,
        clientEmail: serviceAccount.clientEmail,
        privateKey: serviceAccount.privateKey,
      }),
    });
  } else if (canUseApplicationDefaultCredentials()) {
    adminApp = initializeApp({
      credential: applicationDefault(),
      projectId,
    });
  } else {
    console.warn(
      "Firebase Admin: No usable service account or application default credentials found. " +
        "Firebase CLI login does not provide Admin SDK credentials for Next.js API routes."
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
  const projectId = getProjectId();
  return Boolean(
    projectId &&
    (getServiceAccountCredentials() || canUseApplicationDefaultCredentials())
  );
}
