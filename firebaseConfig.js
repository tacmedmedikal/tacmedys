// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANcwKOmKOasZSt1D4A8I698g5VAyyTadw",
  authDomain: "tacmedikal-app.firebaseapp.com",
  projectId: "tacmedikal-app",
  storageBucket: "tacmedikal-app.firebasestorage.app",
  messagingSenderId: "544739357657",
  appId: "1:544739357657:web:543033eb95d07e7c159fc8",
  measurementId: "G-RT4MB4TXYL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    import("firebase/analytics").then(({ getAnalytics, isSupported }) => {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      }).catch(() => {
        // Analytics not supported, continue without it
      });
    }).catch(() => {
      // Analytics module not available
    });
  } catch (error) {
    // Continue without analytics
  }
}

// Initialize Firebase Auth - simple approach for Expo
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase services for use throughout the app
export { analytics, app, auth, db };

