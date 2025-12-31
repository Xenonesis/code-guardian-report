// src/lib/firestore-config.ts
import { 
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';

import { logger } from '@/utils/logger';
export function createOptimizedFirestore(app: FirebaseApp): Firestore {
  let db: Firestore;

  try {
    // Initialize with long polling to fix 404/transport errors
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
    logger.debug('Firestore initialized with long polling and persistence');
  } catch (error) {
    // Fallback if already initialized
    logger.debug('Firestore already initialized, using existing instance', error);
    db = getFirestore(app);
  }
  
  // Connect to emulator if in development
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
      logger.debug('Connected to Firestore emulator');
    } catch (error) {
      logger.debug('Firestore emulator not available, using production', error);
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