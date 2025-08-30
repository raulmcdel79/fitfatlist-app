

// Fix: Use Firebase v9 compat library for v8 namespaced API syntax
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

// Your web app's Firebase configuration should be stored in environment variables
// Example .env.local file:
// VITE_FIREBASE_API_KEY="your-api-key"
// VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
// VITE_FIREBASE_PROJECT_ID="your-project-id"
// VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
// VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
// VITE_FIREBASE_APP_ID="your-app-id"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Fix: Initialize Firebase App using v8 syntax (singleton pattern)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Fix: Initialize and export Firebase Authentication using v8 syntax
export const auth = firebase.auth();