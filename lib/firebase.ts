import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBogzxNda_uF2kgRAYVn5LpY_AripqE54s",
  authDomain: "thevintagehousekupwara.firebaseapp.com",
  projectId: "thevintagehousekupwara",
  storageBucket: "thevintagehousekupwara.firebasestorage.app",
  messagingSenderId: "701611567941",
  appId: "1:701611567941:web:7fff75a02085386e3c2c2c",
  measurementId: "G-PLX6SWNTHX"
};

// Next.js Hot-Reload Safe Initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
const db = getFirestore(app);

// Initialize Analytics safely (only on the client side)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, db, analytics };
export const googleProvider = new GoogleAuthProvider();