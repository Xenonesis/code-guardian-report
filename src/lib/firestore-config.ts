// src/lib/firestore-config.ts
import { 
  getFirestore,
  connectFirestoreEmulator,
  Firestore
} from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';

export function createOptimizedFirestore(app: FirebaseApp): Firestore {
  console.log('Using default Firestore configuration to avoid connection issues');
  
  const db = getFirestore(app);
  
  // Connect to emulator if in development
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('Connected to Firestore emulator');
    } catch (error) {
      console.log('Firestore emulator not available, using production');
    }
  }
  
  return db;
}

// Utility functions for WebChannel failure tracking (kept for compatibility)
export function recordWebChannelFailure(): void {
  // No-op since we're using default Firestore config
}

export function clearWebChannelFailures(): void {
  // No-op since we're using default Firestore config
}