// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
  messurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "demo-measurement-id",
};

console.log("Firebase Config:", {
  apiKey: firebaseConfig.apiKey ? "Set" : "Missing",
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId,
});

// Only throw error if all critical configs are missing
const hasCriticalConfig = firebaseConfig.apiKey && 
                         firebaseConfig.projectId && 
                         firebaseConfig.appId &&
                         !firebaseConfig.apiKey.includes("demo");

if (!hasCriticalConfig) {
  console.warn("Firebase configuration missing or using demo values. Please set up your .env file with proper Firebase credentials.");
  console.warn("For development, you can use Firebase emulator or set up proper credentials.");
}

let app, auth, db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // Create mock objects for development
  if (import.meta.env.DEV) {
    console.warn("Using mock Firebase objects for development");
    auth = {
      currentUser: null,
      signInWithEmailAndPassword: () => Promise.reject(new Error("Firebase not configured")),
      createUserWithEmailAndPassword: () => Promise.reject(new Error("Firebase not configured")),
      signOut: () => Promise.resolve(),
      onAuthStateChanged: (callback) => {
        callback(null);
        return () => {};
      }
    };
    db = {
      collection: () => ({
        doc: () => ({
          get: () => Promise.resolve({ exists: () => false, data: () => null }),
          set: () => Promise.resolve(),
          update: () => Promise.resolve(),
          onSnapshot: (callback) => {
            // Simulate empty data
            callback({ exists: () => false, data: () => null });
            return () => {};
          }
        })
      }),
      doc: () => ({
        get: () => Promise.resolve({ exists: () => false, data: () => null }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve(),
        onSnapshot: (callback) => {
          // Simulate empty data
          callback({ exists: () => false, data: () => null });
          return () => {};
        }
      })
    };
  } else {
    throw error;
  }
}

export { auth, db };