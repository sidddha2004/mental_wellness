// firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Initialize Firebase app only if it's not already initialized.
// This prevents re-initialization on hot reloads in development.
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error("❌ Failed to initialize Firebase:", error);
    throw error; // Re-throw to prevent further initialization
  }
} else {
  app = getApps()[0];
  console.log('✅ Firebase already initialized');
}

// Initialize and export services only after app is guaranteed to exist
try {
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('✅ Firebase services initialized');
} catch (error) {
  console.error("❌ Failed to initialize Firebase services:", error);
  throw error;
}

// NOTE: You can add connectAuthEmulator and connectFirestoreEmulator calls
// here if you are using the Firebase emulators for local development.

export { app, auth, db };