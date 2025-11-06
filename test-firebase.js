// Test script to verify Firebase setup
// Run this in your browser console to test Firebase connection

console.log("=== Firebase Test ===");

// Test 1: Check environment variables
console.log("Environment variables:");
console.log("- VITE_FIREBASE_PROJECT_ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log("- VITE_FIREBASE_API_KEY:", import.meta.env.VITE_FIREBASE_API_KEY ? "Set" : "Missing");

// Test 2: Check Firebase auth
import { auth } from './src/lib/firebase.js';
console.log("Auth object:", auth);
console.log("Current user:", auth.currentUser);

// Test 3: Check Firestore connection
import { db } from './src/lib/firebase.js';
console.log("Firestore object:", db);

// Test 4: Try to read a document
import { doc, getDoc } from 'firebase/firestore';

async function testFirestore() {
  try {
    console.log("Testing Firestore read permissions...");
    const testDoc = doc(db, "test", "test");
    const docSnap = await getDoc(testDoc);
    console.log("✅ Firestore read test passed");
  } catch (error) {
    console.error("❌ Firestore read test failed:", error);
  }
}

testFirestore();

console.log("=== End Firebase Test ===");
