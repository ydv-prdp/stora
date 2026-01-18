import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDePkd9-QxIJM1Y38vEnE427u91X_vX57Y",
    authDomain: "volt-49102.firebaseapp.com",
    projectId: "volt-49102",
    storageBucket: "volt-49102.firebasestorage.app",
    messagingSenderId: "664879251048",
    appId: "1:664879251048:web:621da7ee67487a424bc5dd",
    measurementId: "G-S0B6CHJMZR"
};

import { getStorage } from "firebase/storage";

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, storage, googleProvider };
