import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.localStorage = localStorageMock as Storage;

// Mock sessionStorage
global.sessionStorage = localStorageMock as Storage;

// Mock crypto.getRandomValues - don't override the whole crypto object
if (typeof global.crypto === "undefined") {
  Object.defineProperty(global, "crypto", {
    value: {
      subtle: {
        importKey: vi.fn(),
        deriveKey: vi.fn(),
        encrypt: vi.fn(),
        decrypt: vi.fn(),
      },
      getRandomValues: vi.fn((arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      }),
    },
    writable: true,
    configurable: true,
  });
}

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Suppress console errors in tests
vi.spyOn(console, "error").mockImplementation(() => {});
vi.spyOn(console, "warn").mockImplementation(() => {});

// Mock Firebase Firestore
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi
    .fn()
    .mockRejectedValue(new Error("Firebase not available in test")),
  setDoc: vi
    .fn()
    .mockRejectedValue(new Error("Firebase not available in test")),
  getDoc: vi
    .fn()
    .mockRejectedValue(new Error("Firebase not available in test")),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  addDoc: vi
    .fn()
    .mockRejectedValue(new Error("Firebase not available in test")),
  updateDoc: vi
    .fn()
    .mockRejectedValue(new Error("Firebase not available in test")),
  deleteDoc: vi
    .fn()
    .mockRejectedValue(new Error("Firebase not available in test")),
  onSnapshot: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ toDate: () => new Date() })),
    fromDate: vi.fn((date: Date) => ({ toDate: () => date })),
  },
  enableNetwork: vi.fn().mockResolvedValue(undefined),
  disableNetwork: vi.fn().mockResolvedValue(undefined),
}));

// Mock Firebase Auth
vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({})),
  signInWithPopup: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  GithubAuthProvider: vi.fn(),
  linkWithCredential: vi.fn(),
  fetchSignInMethodsForEmail: vi.fn(),
}));

// Mock Firebase App
vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
  getApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
}));

// Mock the firebase lib
vi.mock("@/lib/firebase", () => ({
  db: {},
  auth: {},
  app: {},
}));
