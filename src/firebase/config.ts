import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA_extiKYUhQ4sAi705Jo6DCXAejxXCgqA",
  authDomain: "sport-e35a2.firebaseapp.com",
  projectId: "sport-e35a2",
  storageBucket: "sport-e35a2.firebasestorage.app",
  messagingSenderId: "398990731473",
  appId: "1:398990731473:web:91579ca19a65679d8bbdf0",
  measurementId: "G-9Q7XSSH558"
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
    console.log('Firebase Emulators Connected');
}

export default app;
