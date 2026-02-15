// ========================================
// S2 KENNEL JAMMU - FIREBASE CONFIGURATION
// Using Firebase SDK v9+ (Modular SDK)
// ========================================
// 
// IMPORTANT: Replace the config values below with your Firebase project credentials
// 
// To get your Firebase config:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select existing one
// 3. Go to Project Settings
// 4. Scroll down to "Your apps" and select Web (</>)
// 5. Copy the firebaseConfig object and paste below
// 
// Required Firebase Services (enable in Firebase Console):
// - Authentication (Email/Password provider)
// - Firestore Database
// - Storage (optional, for images)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// ========================================
// REPLACE THESE VALUES WITH YOUR FIREBASE CONFIG
// ========================================

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};

// ========================================
// INITIALIZE FIREBASE
// ========================================

const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Services
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

// ========================================
// EXPORT SERVICES FOR USE IN OTHER FILES
// ========================================

window.firebaseServices = {
    auth,
    db,
    storage,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    ref,
    uploadBytes,
    getDownloadURL
};

// Make globally available for convenience
window.auth = auth;
window.db = db;
window.storage = storage;