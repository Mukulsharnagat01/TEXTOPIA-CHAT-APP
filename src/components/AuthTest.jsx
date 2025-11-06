import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const AuthTest = () => {
  const [authStatus, setAuthStatus] = useState(null);
  const [firestoreTest, setFirestoreTest] = useState(null);

  useEffect(() => {
    // Test authentication
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthStatus({
          isAuthenticated: true,
          uid: user.uid,
          email: user.email,
        });
      } else {
        setAuthStatus({
          isAuthenticated: false,
          uid: null,
          email: null,
        });
      }
    });

    return unsubscribe;
  }, []);

  const testFirestore = async () => {
    try {
      console.log("Testing Firestore permissions...");
      
      // Test 1: Try to read a document
      const testDoc = doc(db, "test", "test");
      const docSnap = await getDoc(testDoc);
      console.log("✅ Read test passed");
      
      // Test 2: Try to write a document
      await setDoc(testDoc, {
        message: "Test message",
        timestamp: new Date(),
        uid: auth.currentUser?.uid,
      });
      console.log("✅ Write test passed");
      
      setFirestoreTest({ success: true, message: "All tests passed!" });
    } catch (error) {
      console.error("❌ Firestore test failed:", error);
      setFirestoreTest({ 
        success: false, 
        message: `Test failed: ${error.message}`,
        code: error.code 
      });
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '20px', 
      border: '1px solid #ccc',
      borderRadius: '8px',
      maxWidth: '300px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <h3>Firebase Debug Info</h3>
      
      <div>
        <strong>Authentication:</strong>
        {authStatus ? (
          <div>
            <p>Status: {authStatus.isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated'}</p>
            <p>UID: {authStatus.uid || 'None'}</p>
            <p>Email: {authStatus.email || 'None'}</p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <strong>Firestore Test:</strong>
        <button onClick={testFirestore} style={{ marginLeft: '10px' }}>
          Test Firestore
        </button>
        {firestoreTest && (
          <div style={{ marginTop: '5px' }}>
            <p style={{ color: firestoreTest.success ? 'green' : 'red' }}>
              {firestoreTest.message}
            </p>
            {firestoreTest.code && <p>Code: {firestoreTest.code}</p>}
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <strong>Environment:</strong>
        <p>Project: {import.meta.env.VITE_FIREBASE_PROJECT_ID}</p>
        <p>Mode: {import.meta.env.MODE}</p>
      </div>
    </div>
  );
};

export default AuthTest;
