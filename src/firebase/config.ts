import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: String(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: String(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: String(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: String(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: String(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: String(import.meta.env.VITE_FIREBASE_APP_ID),
  measurementId: String(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID)
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);

// Set persistence and export the promise so consumers can await it
export const persistenceReady = setPersistence(auth, browserLocalPersistence).catch((error: unknown) => {
    console.error("Failed to set auth persistence:", error);
});

export const googleProvider = new GoogleAuthProvider();

// HMR-safe Firestore initialization
let dbInstance;
try {
    dbInstance = initializeFirestore(app, {
        localCache: persistentLocalCache(),
        ignoreUndefinedProperties: true
    }, 'default');
} catch {
    // If already initialized (common in HMR), use existing instance
    dbInstance = getFirestore(app, 'default');
}

export const db = dbInstance;
export const storage = getStorage(app);

if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    if (import.meta.env.DEV) console.log('Firebase Emulators Connected');
}

export default app;
